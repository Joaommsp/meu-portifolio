import { lerJson } from "@/server/http"
import { criarAcesso, enderecoDoMcp, listarAcessos, rotaDeAdmin } from "@/server/mcp/rota-admin"

export const runtime = "nodejs"

/** Chaves pessoais e acessos únicos, em listas separadas, e o endereço do MCP (ACESSOS-01). */
export function GET(req: Request): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) =>
    Response.json(await listarAcessos(acessos, enderecoDoMcp(req)))
  )
}

/** Cria pelo `tipo` (`pessoal` ou `unico`). O segredo sai só aqui, uma vez. */
export function POST(req: Request): Promise<Response> {
  return rotaDeAdmin(req, async ({ acessos }) => {
    const criado = await criarAcesso(acessos, await lerJson(req), enderecoDoMcp(req))
    return Response.json(criado, { status: 201 })
  })
}
