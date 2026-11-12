import { rotaDeAdmin } from "@/server/mcp/rota-admin"

export const runtime = "nodejs"

type Contexto = { params: Promise<{ id: string }> }

/** Apaga acesso inativo; a auditoria dele fica (ACESSOS-03, ACESSOS-04). */
export function DELETE(req: Request, { params }: Contexto): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) => {
    await acessos.apagar((await params).id)
    return new Response(null, { status: 204 })
  })
}
