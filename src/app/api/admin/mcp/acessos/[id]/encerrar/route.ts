import { rotaDeAdmin } from "@/server/mcp/rota-admin"

export const runtime = "nodejs"

type Contexto = { params: Promise<{ id: string }> }

/** Encerra acesso de uso único ativo pelo botão do dono (UNICO-06). */
export function POST(req: Request, { params }: Contexto): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) =>
    Response.json(await acessos.encerrar((await params).id))
  )
}
