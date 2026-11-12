import "server-only"

import { definicaoDe } from "@/lib/conteudo"
import { ehObjetoSimples } from "@/lib/conteudo/leitura"
import { ErroDominio, type Recurso } from "@/lib/conteudo/tipos"
import { validarOuFalhar } from "@/lib/conteudo/validacao"
import type { AcaoDoUnico, EscopoDoUnico } from "@/lib/mcp/tipos"
import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"
import { MENSAGEM_FALHA_DO_BANCO } from "@/server/http"

import type { ItemLido, Pagina, RepositorioConteudo } from "./repositorio"

/**
 * Regra das ferramentas de conteúdo do MCP: escopo, validação pelo schema do
 * formulário, slug e erros de domínio. O escopo é conferido antes de
 * qualquer leitura, porque o firebase-admin ignora as regras do Firestore.
 */

export const ACOES_DE_CONTEUDO = [
  "listar",
  "obter",
  "criar",
  "atualizar",
  "apagar",
] as const
export type AcaoConteudo = (typeof ACOES_DE_CONTEUDO)[number]

export type ArgumentosConteudo = {
  id?: string
  cursor?: string
  dados?: Record<string, unknown>
}

export type ResultadoConteudo = Pagina | ItemLido | { id: string; apagado: true }

/** `null` = chave pessoal, sem recorte. */
export type EscopoConteudo = EscopoDoUnico | null

/** Ação do MCP para a permissão do uso único; apagar nunca é concedido. */
export const PERMISSAO_DA_ACAO: Record<AcaoConteudo, AcaoDoUnico | null> = {
  listar: "ler",
  obter: "ler",
  criar: "criar",
  atualizar: "editar",
  apagar: null,
}

/** Ações que não existem no documento único (`atualmente`). */
const ACOES_SEM_DOCUMENTO_UNICO: AcaoConteudo[] = ["listar", "criar", "apagar"]

function conferirEscopo(
  escopo: EscopoConteudo,
  acao: AcaoConteudo,
  recurso: Recurso,
  id: string | undefined
): void {
  if (!escopo) return
  const permissao = PERMISSAO_DA_ACAO[acao]
  const fora =
    escopo.recurso !== recurso ||
    permissao === null ||
    !escopo.acoes.includes(permissao) ||
    // Com item fixo, só esse item pode ser lido ou editado; listar leria os outros.
    (escopo.itemId !== null &&
      (acao === "listar" || ((acao === "obter" || acao === "atualizar") && id !== escopo.itemId)))
  if (fora) {
    throw new ErroDominio(
      "FORA_DO_ESCOPO",
      "Este acesso não permite esta ação neste recurso ou item."
    )
  }
}

/** Parcial sobre o atual; objeto aninhado (slot do `atualmente`) mescla um nível. */
function mesclar(
  atual: Record<string, unknown>,
  parcial: Record<string, unknown>
): Record<string, unknown> {
  const resultado = { ...atual }
  for (const [campo, valor] of Object.entries(parcial)) {
    const base = atual[campo]
    resultado[campo] =
      ehObjetoSimples(base) && ehObjetoSimples(valor) ? { ...base, ...valor } : valor
  }
  return resultado
}

export function criarServicoConteudo(repo: RepositorioConteudo) {
  function validar(recurso: Recurso, valores: unknown): Record<string, unknown> {
    const definicao = definicaoDe(recurso)
    const dados = validarOuFalhar(
      definicao.schema.safeParse(valores),
      "Dados inválidos para o recurso."
    )
    return definicao.paraEntrada(dados) as Record<string, unknown>
  }

  async function conferirSlug(recurso: Recurso, entrada: Record<string, unknown>, exceto?: string) {
    if (!definicaoDe(recurso).temSlug || typeof entrada.slug !== "string") return
    if (await repo.slugEmUso(recurso, entrada.slug, exceto)) {
      throw new ErroDominio("SLUG_EM_USO", `O slug "${entrada.slug}" já é usado em ${recurso}.`)
    }
  }

  function exigirId(id: string | undefined): string {
    if (!id) {
      throw new ErroDominio("VALIDACAO", "Informe o id do item.", { id: "Informe o id do item." })
    }
    return id
  }

  function naoEncontrado(recurso: Recurso, id: string): ErroDominio {
    return new ErroDominio("NAO_ENCONTRADO", `Nenhum item de ${recurso} com id "${id}".`)
  }

  async function rodar(
    acao: AcaoConteudo,
    recurso: Recurso,
    args: ArgumentosConteudo
  ): Promise<ResultadoConteudo> {
    const definicao = definicaoDe(recurso)
    const unico = definicao.idDoDocumentoUnico

    if (acao === "listar") return repo.listar(recurso, { cursor: args.cursor })

    if (acao === "criar") {
      const entrada = validar(recurso, args.dados ?? {})
      await conferirSlug(recurso, entrada)
      return repo.criar(recurso, entrada, definicao.derivados?.(entrada, null))
    }

    const id = unico ?? exigirId(args.id)
    const atual = await repo.obter(recurso, id)

    if (acao === "obter") {
      if (atual) return atual
      if (unico) return { ...(definicao.deDocumento(null) as Record<string, unknown>), id }
      throw naoEncontrado(recurso, id)
    }

    if (!atual && !unico) throw naoEncontrado(recurso, id)

    if (acao === "apagar") {
      await repo.apagar(recurso, id)
      return { id, apagado: true }
    }

    // atualizar: o parcial entra sobre o atual e o schema inteiro valida.
    const base = definicao.deDocumento(atual) as Record<string, unknown>
    const entrada = validar(recurso, mesclar(base, args.dados ?? {}))
    await conferirSlug(recurso, entrada, id)
    return repo.atualizar(recurso, id, entrada, definicao.derivados?.(entrada, atual))
  }

  return {
    async executar(
      acao: AcaoConteudo,
      recurso: Recurso,
      args: ArgumentosConteudo,
      escopo: EscopoConteudo
    ): Promise<ResultadoConteudo> {
      conferirEscopo(escopo, acao, recurso, args.id)
      if (definicaoDe(recurso).unico && ACOES_SEM_DOCUMENTO_UNICO.includes(acao)) {
        throw new ErroDominio(
          "ACAO_INVALIDA",
          `${recurso} é um documento único: use obter e atualizar, sem id.`
        )
      }
      try {
        return await rodar(acao, recurso, args)
      } catch (erro) {
        if (erro instanceof ErroDominio || erro instanceof ServicoNaoConfiguradoError) throw erro
        // O detalhe fica só no log do servidor; a LLM recebe a mensagem própria.
        console.error("[conteudo] falha de dependência", erro)
        throw new ErroDominio("FALHA_EXTERNA", MENSAGEM_FALHA_DO_BANCO)
      }
    },
  }
}

export type ServicoConteudo = ReturnType<typeof criarServicoConteudo>
