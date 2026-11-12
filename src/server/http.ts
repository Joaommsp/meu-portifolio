import "server-only"

import { ErroDominio, type CodigoErro } from "@/lib/conteudo/tipos"
import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"

/**
 * Resposta de erro das rotas do MCP e da gestão de acessos, num formato só:
 * `{ codigo, mensagem, campos? }`. Nunca leva stack trace.
 */

/** Códigos que só existem na borda HTTP (não são erro de regra). */
export type CodigoHttp =
  | CodigoErro
  | "NAO_AUTENTICADO"
  | "SEM_PERMISSAO"
  | "LIMITE_DE_CHAMADAS"
  | "CORPO_GRANDE"
  | "METODO_NAO_PERMITIDO"
  | "NAO_CONFIGURADO"

export type CorpoDeErro = {
  codigo: CodigoHttp
  mensagem: string
  campos?: Record<string, string>
}

export function respostaDeErro(
  status: number,
  codigo: CodigoHttp,
  mensagem: string,
  campos?: Record<string, string>
): Response {
  const corpo: CorpoDeErro = campos ? { codigo, mensagem, campos } : { codigo, mensagem }
  return Response.json(corpo, { status })
}

/** Estado que não permite a ação: 409 com o código para a tela decidir. */
const STATUS_DO_CODIGO: Partial<Record<CodigoErro, number>> = {
  VALIDACAO: 400,
  IMAGEM_GRANDE: 400,
  TIPO_NAO_SUPORTADO: 400,
  FORA_DO_ESCOPO: 403,
  NAO_ENCONTRADO: 404,
  ACESSO_ATIVO: 409,
  ACESSO_INATIVO: 409,
  LIMITE_DE_CHAVES: 409,
  ACAO_INVALIDA: 409,
  SLUG_EM_USO: 409,
  FALHA_EXTERNA: 503,
}

export const MENSAGEM_FALHA_DO_BANCO = "Falha ao acessar o banco de dados. Tente de novo."

/**
 * Erro lançado pelo serviço vira status com significado. O que não é
 * previsto (Firestore fora, rede) sai como 503 com mensagem própria; o
 * detalhe fica só no log do servidor.
 */
export function respostaDoErro(erro: unknown): Response {
  if (erro instanceof ErroDominio) {
    return respostaDeErro(STATUS_DO_CODIGO[erro.codigo] ?? 400, erro.codigo, erro.message, erro.campos)
  }
  if (erro instanceof ServicoNaoConfiguradoError) {
    return respostaDeErro(503, "NAO_CONFIGURADO", erro.message)
  }
  console.error("[api] falha de dependência", erro)
  return respostaDeErro(503, "FALHA_EXTERNA", MENSAGEM_FALHA_DO_BANCO)
}

/** Corpo JSON da requisição; corpo ilegível vira 400 de validação. */
export async function lerJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    throw new ErroDominio("VALIDACAO", "Corpo da requisição não é JSON válido.")
  }
}
