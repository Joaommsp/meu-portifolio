import "server-only"

import { ErroDominio } from "@/lib/conteudo/tipos"
import { CAMINHO_DO_MCP, promptDeUsoUnico } from "@/lib/mcp/conexao"
import type { NovaChave, NovoUnico } from "@/lib/mcp/esquemas"
import {
  TIPOS_DE_ACESSO,
  type AcessoCriado,
  type RespostaDaCriacao,
  type RespostaDaLista,
} from "@/lib/mcp/tipos"
import { juntarComOu } from "@/lib/utils"
import { exigirAdmin } from "@/server/admin-auth"
import { respostaDoErro } from "@/server/http"

import type { ServicoAcessos } from "./acessos/servico"
import { obterDependencias, type DependenciasMcp } from "./dependencias"

/**
 * Casca das rotas `/api/admin/mcp/*`: dependências, guarda do dono e
 * mapeamento de erro num lugar só. A rota fica com a chamada ao serviço.
 */
export async function rotaDeAdmin(
  req: Request,
  acao: (deps: DependenciasMcp) => Promise<Response>
): Promise<Response> {
  try {
    const deps = obterDependencias()
    const admin = await exigirAdmin(req, deps.verificarIdToken)
    if ("resposta" in admin) return admin.resposta
    return await acao(deps)
  } catch (erro) {
    return respostaDoErro(erro)
  }
}

/** Endereço público do `/api/mcp`: `MCP_PUBLIC_URL` ou a origem da requisição. */
export function enderecoDoMcp(req: Request, env: Record<string, string | undefined> = process.env): string {
  return env.MCP_PUBLIC_URL || `${new URL(req.url).origin}${CAMINHO_DO_MCP}`
}

/** Chaves e únicos com o endereço que a tela mostra e põe na configuração. */
export async function listarAcessos(
  acessos: ServicoAcessos,
  enderecoMcp: string
): Promise<RespostaDaLista> {
  return { ...(await acessos.listar()), enderecoMcp }
}

/** Prompt pronto do uso único, montado só no servidor. */
function promptDoUnico(criado: AcessoCriado, enderecoMcp: string): string {
  const { acesso, segredo } = criado
  if (!acesso.escopo) throw new Error("Acesso único criado sem escopo.")
  return promptDeUsoUnico({
    url: enderecoMcp,
    segredo,
    recurso: acesso.escopo.recurso,
    itemId: acesso.escopo.itemId,
    acoes: acesso.escopo.acoes,
    tarefa: acesso.tarefa ?? "",
  })
}

const MENSAGEM_TIPO_INVALIDO = `Use ${juntarComOu(TIPOS_DE_ACESSO.map((t) => `"${t}"`))}.`

/**
 * Cria pelo `tipo` do corpo: `pessoal` (nome, validadeDias) ou `unico`
 * (recurso, itemId, acoes, tarefa). O único sai com o prompt pronto.
 */
export async function criarAcesso(
  acessos: ServicoAcessos,
  corpo: unknown,
  enderecoMcp: string
): Promise<RespostaDaCriacao> {
  const tipo = (corpo as { tipo?: unknown } | null)?.tipo
  if (tipo === "pessoal") {
    return { ...(await acessos.criarChave(corpo as NovaChave)), enderecoMcp }
  }
  if (tipo === "unico") {
    const criado = await acessos.criarUnico(corpo as NovoUnico)
    return { ...criado, enderecoMcp, prompt: promptDoUnico(criado, enderecoMcp) }
  }
  throw new ErroDominio("VALIDACAO", "Dados inválidos.", { tipo: MENSAGEM_TIPO_INVALIDO })
}
