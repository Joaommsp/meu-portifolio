import "server-only"

import {
  McpServer,
  WebStandardStreamableHTTPServerTransport,
  type CallToolResult,
} from "@modelcontextprotocol/server"
import { z } from "zod"

import { descreverRecurso, RECURSOS_DE_DOCUMENTO_UNICO } from "@/lib/conteudo"
import { ErroDominio, NOMES_DE_RECURSO, type Recurso } from "@/lib/conteudo/tipos"
import { NOME_DO_SERVIDOR_MCP } from "@/lib/mcp/conexao"
import { emMegabytes, ITENS_POR_PAGINA, MAX_BYTES_DA_IMAGEM } from "@/lib/mcp/limites"
import type { AcaoDoUnico } from "@/lib/mcp/tipos"
import {
  ACOES_DE_CONTEUDO,
  PERMISSAO_DA_ACAO,
  type AcaoConteudo,
  type ArgumentosConteudo,
} from "@/server/conteudo/servico"
import { MENSAGEM_FALHA_DO_BANCO } from "@/server/http"

import type { Acesso } from "./acessos/tipos"
import type { DependenciasMcp } from "./dependencias"
import { instrucoes } from "./instrucoes"

/**
 * Um `McpServer` por requisição (stateless), com as ferramentas do escopo do
 * acesso. A regra mora nos serviços; aqui só se traduz para o protocolo.
 */

export const NOME_DO_SERVIDOR = NOME_DO_SERVIDOR_MCP
const VERSAO_DO_SERVIDOR = "1.0.0"

export type DependenciasDoServidor = Pick<DependenciasMcp, "acessos" | "conteudo" | "subirImagem">

/** As ações de conteúdo do serviço viram ferramentas com o mesmo nome. */
export const FERRAMENTAS = [
  ...ACOES_DE_CONTEUDO,
  "descrever_recurso",
  "subir_imagem",
  "concluir_tarefa",
] as const
export type Ferramenta = (typeof FERRAMENTAS)[number]

/** Ferramentas que cada ação do uso único libera, lidas da regra do serviço. */
function ferramentasDaAcao(acao: AcaoDoUnico): Ferramenta[] {
  return ACOES_DE_CONTEUDO.filter((a) => PERMISSAO_DA_ACAO[a] === acao)
}

/** Documento único (hoje `atualmente`): obter e atualizar sem id. */
const SEM_ID = RECURSOS_DE_DOCUMENTO_UNICO.join(", ")

/**
 * Pessoal: tudo menos `concluir_tarefa`. Único: só o concedido, nunca `apagar`
 * (UNICO-03). Único sem escopo é documento corrompido: fecha em vez de abrir.
 */
export function ferramentasDoAcesso(acesso: Acesso): Ferramenta[] {
  if (acesso.tipo === "pessoal") {
    return FERRAMENTAS.filter((f) => f !== "concluir_tarefa")
  }
  if (!acesso.escopo) return ["concluir_tarefa"]
  const { acoes } = acesso.escopo
  const concedidas = new Set<Ferramenta>(acoes.flatMap(ferramentasDaAcao))
  concedidas.add("descrever_recurso")
  if (acoes.includes("criar") || acoes.includes("editar")) concedidas.add("subir_imagem")
  concedidas.add("concluir_tarefa")
  return FERRAMENTAS.filter((f) => concedidas.has(f))
}

function texto(valor: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(valor, null, 2) }] }
}

/** Erro previsto vira `isError` legível para a LLM corrigir: `CODIGO: mensagem` + campos. */
function erroDaFerramenta(erro: unknown): CallToolResult {
  const dominio =
    erro instanceof ErroDominio
      ? erro
      : new ErroDominio("FALHA_EXTERNA", MENSAGEM_FALHA_DO_BANCO)
  if (!(erro instanceof ErroDominio)) console.error("[mcp] falha na ferramenta", erro)
  const campos = dominio.campos
    ? "\n" + Object.entries(dominio.campos).map(([campo, msg]) => `${campo}: ${msg}`).join("\n")
    : ""
  return {
    content: [{ type: "text", text: `${dominio.codigo}: ${dominio.message}${campos}` }],
    isError: true,
  }
}

async function executar(acao: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return texto(await acao())
  } catch (erro) {
    return erroDaFerramenta(erro)
  }
}

const recurso = z.enum(NOMES_DE_RECURSO).describe("Recurso do conteúdo")
const id = z.string().min(1).describe(`Id do item (omitir em ${SEM_ID})`)
const dados = z
  .record(z.string(), z.unknown())
  .describe("Campos do item, como em descrever_recurso")

const DESCRICOES: Record<Ferramenta, string> = {
  listar: `Lista os itens de um recurso, ${ITENS_POR_PAGINA} por página. Passe o cursor devolvido para a próxima.`,
  obter: `Lê um item pelo id. Em ${SEM_ID}, sem id.`,
  criar: "Cria um item. Chame descrever_recurso antes.",
  atualizar: `Atualiza um item: mande só os campos que mudam. Em ${SEM_ID}, sem id.`,
  apagar: "Apaga um item pelo id.",
  descrever_recurso: "Campos, limites, formatos e obrigatórios de um recurso.",
  subir_imagem:
    `Sobe uma imagem ao Cloudinary e devolve a URL para usar no campo. Prefira url; base64 até ${emMegabytes(MAX_BYTES_DA_IMAGEM)}.`,
  concluir_tarefa: "Encerra este acesso de uso único. Chame ao terminar a tarefa.",
}

export function criarServidor(acesso: Acesso, deps: DependenciasDoServidor): McpServer {
  const servidor = new McpServer(
    { name: NOME_DO_SERVIDOR, version: VERSAO_DO_SERVIDOR },
    { instructions: instrucoes(acesso) }
  )
  const permitidas = new Set(ferramentasDoAcesso(acesso))
  const escopo = acesso.tipo === "unico" ? acesso.escopo : null

  /** Ação de conteúdo; as de escrita gravam auditoria só depois do sucesso (AUDIT-01). */
  async function conteudo(
    acao: AcaoConteudo,
    alvo: Recurso,
    args: ArgumentosConteudo
  ) {
    const resultado = await deps.conteudo.executar(acao, alvo, args, escopo)
    if (acao === "criar" || acao === "atualizar" || acao === "apagar") {
      const itemId = "id" in resultado ? String(resultado.id) : (args.id ?? null)
      await deps.acessos.auditarFerramenta(acesso, acao, alvo, itemId)
    }
    return resultado
  }

  const registrar = <T extends z.ZodObject>(
    nome: Ferramenta,
    entrada: T,
    acao: (args: z.infer<T>) => Promise<unknown>
  ) => {
    if (!permitidas.has(nome)) return
    // O SDK não resolve a sobrecarga com o schema genérico; o tipo dos args volta no cast abaixo.
    const inputSchema: z.ZodObject = entrada
    servidor.registerTool(
      nome,
      { description: DESCRICOES[nome], inputSchema },
      (args) => executar(() => acao(args as z.infer<T>))
    )
  }

  registrar("listar", z.object({ recurso, cursor: z.string().optional() }), (a) =>
    conteudo("listar", a.recurso, { cursor: a.cursor })
  )
  registrar("obter", z.object({ recurso, id: id.optional() }), (a) =>
    conteudo("obter", a.recurso, { id: a.id })
  )
  registrar("criar", z.object({ recurso, dados }), (a) =>
    conteudo("criar", a.recurso, { dados: a.dados })
  )
  registrar("atualizar", z.object({ recurso, id: id.optional(), dados }), (a) =>
    conteudo("atualizar", a.recurso, { id: a.id, dados: a.dados })
  )
  registrar("apagar", z.object({ recurso, id }), (a) =>
    conteudo("apagar", a.recurso, { id: a.id })
  )
  registrar("descrever_recurso", z.object({ recurso }), async (a) => descreverRecurso(a.recurso))
  registrar(
    "subir_imagem",
    z.object({
      url: z.string().optional().describe("URL pública http(s) da imagem (preferível)"),
      base64: z.string().optional().describe(`Imagem em base64 ou data URI, até ${emMegabytes(MAX_BYTES_DA_IMAGEM)}`),
      tipo: z.string().optional().describe("Tipo MIME do base64, ex.: image/png"),
    }),
    async (a) => {
      const imagem = await deps.subirImagem(a)
      await deps.acessos.auditarFerramenta(acesso, "subir_imagem", null, null)
      return imagem
    }
  )
  registrar("concluir_tarefa", z.object({}), async () => {
    await deps.acessos.encerrar(acesso.id)
    return { encerrado: true, mensagem: "Tarefa concluída. Este acesso foi encerrado." }
  })

  return servidor
}

/** Atende uma requisição já autenticada: servidor e transporte novos, resposta JSON. */
export async function atenderMcp(
  req: Request,
  acesso: Acesso,
  deps: DependenciasDoServidor
): Promise<Response> {
  const servidor = criarServidor(acesso, deps)
  const transporte = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await servidor.connect(transporte)
  try {
    return await transporte.handleRequest(req)
  } finally {
    await servidor.close()
  }
}
