import {
  emMegabytes,
  MAX_BYTES_DO_CORPO,
  MENSAGEM_ACESSO_INVALIDO,
  MAX_CHAMADAS_POR_MINUTO,
} from "@/lib/mcp/limites"
import { respostaDeErro, respostaDoErro } from "@/server/http"
import { obterDependencias } from "@/server/mcp/dependencias"
import { atenderMcp } from "@/server/mcp/servidor"

/**
 * Servidor MCP do admin: JSON-RPC por POST, sem sessão. Corpo grande sai
 * antes de autenticar; acesso inválido recebe sempre a mesma resposta 401.
 */

export const runtime = "nodejs"
export const maxDuration = 60

function corpoGrande(): Response {
  return respostaDeErro(
    413,
    "CORPO_GRANDE",
    `Corpo acima de ${emMegabytes(MAX_BYTES_DO_CORPO)}. Para imagem, use subir_imagem com a url pública.`
  )
}

export async function POST(req: Request): Promise<Response> {
  const declarado = Number(req.headers.get("content-length") ?? 0)
  if (declarado > MAX_BYTES_DO_CORPO) return corpoGrande()
  const corpo = await req.arrayBuffer()
  if (corpo.byteLength > MAX_BYTES_DO_CORPO) return corpoGrande()

  try {
    const deps = obterDependencias()
    const autenticacao = await deps.acessos.autenticar(req.headers.get("authorization"))
    if (autenticacao.resultado === "invalido") {
      return respostaDeErro(401, "NAO_AUTENTICADO", MENSAGEM_ACESSO_INVALIDO)
    }
    if (autenticacao.resultado === "limite") {
      return respostaDeErro(
        429,
        "LIMITE_DE_CHAMADAS",
        `Mais de ${MAX_CHAMADAS_POR_MINUTO} chamadas neste minuto. Tente no minuto seguinte.`
      )
    }
    // O corpo já foi lido para medir; o transporte recebe uma cópia da requisição.
    const copia = new Request(req.url, { method: "POST", headers: req.headers, body: corpo })
    return await atenderMcp(copia, autenticacao.acesso, deps)
  } catch (erro) {
    return respostaDoErro(erro)
  }
}

function metodoNaoPermitido(): Response {
  const resposta = respostaDeErro(405, "METODO_NAO_PERMITIDO", "Use POST: este servidor MCP não tem sessão.")
  resposta.headers.set("Allow", "POST")
  return resposta
}

export function GET(): Response {
  return metodoNaoPermitido()
}

export function DELETE(): Response {
  return metodoNaoPermitido()
}
