import "server-only"

import { tokenBearer } from "@/lib/mcp/conexao"
import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"
import { respostaDeErro } from "@/server/http"

/**
 * Guarda das rotas `/api/admin/mcp/*` (ACESSOS-05): ID token do Firebase no
 * `Authorization` e uid igual ao do dono. Mesma comparação do `isAdminUid`
 * do navegador, mas com o uid lido do ambiente do servidor.
 */

type Ambiente = Record<string, string | undefined>

export type ResultadoAdmin = { uid: string } | { resposta: Response }

export async function exigirAdmin(
  req: Request,
  verificarIdToken: (token: string) => Promise<string>,
  env: Ambiente = process.env
): Promise<ResultadoAdmin> {
  const token = tokenBearer(req.headers.get("authorization"))
  if (!token) {
    return { resposta: respostaDeErro(401, "NAO_AUTENTICADO", "Faça login de novo.") }
  }

  let uid: string
  try {
    uid = await verificarIdToken(token)
  } catch (erro) {
    // Sem service account é 503 (quem chama mapeia), não sessão inválida.
    if (erro instanceof ServicoNaoConfiguradoError) throw erro
    return { resposta: respostaDeErro(401, "NAO_AUTENTICADO", "Sessão inválida ou expirada. Faça login de novo.") }
  }

  const dono = env.ADMIN_UID || env.NEXT_PUBLIC_ADMIN_UID
  if (!dono || uid !== dono) {
    return { resposta: respostaDeErro(403, "SEM_PERMISSAO", "Esta conta não administra o portfólio.") }
  }
  return { uid }
}
