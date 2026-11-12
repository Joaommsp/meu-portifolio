import { rotaDeAdmin } from "@/server/mcp/rota-admin"

export const runtime = "nodejs"

type Contexto = { params: Promise<{ id: string }> }

/** Revoga acesso ativo; a chamada seguinte ao MCP recebe 401 (ACESSOS-02). */
export function POST(req: Request, { params }: Contexto): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) =>
    Response.json(await acessos.revogar((await params).id))
  )
}
