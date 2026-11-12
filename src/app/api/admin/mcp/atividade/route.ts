import { rotaDeAdmin } from "@/server/mcp/rota-admin"

export const runtime = "nodejs"

/** As `REGISTROS_DA_ATIVIDADE` ações mais recentes da auditoria, da mais nova para a mais velha (AUDIT-02). */
export function GET(req: Request): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) => Response.json(await acessos.atividade()))
}
