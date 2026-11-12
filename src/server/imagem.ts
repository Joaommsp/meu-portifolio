import "server-only"

import { ErroDominio } from "@/lib/conteudo/tipos"
import { ehTipoDeImagem, MENSAGEM_TIPO_NAO_SUPORTADO, urlDeUpload } from "@/lib/imagem"
import { emMegabytes, MAX_BYTES_DA_IMAGEM } from "@/lib/mcp/limites"

/**
 * Upload de imagem pelo MCP, com o mesmo preset unsigned do admin. Por URL o
 * Cloudinary baixa sozinho (nada passa pelo corpo da função); por base64 a
 * imagem vai como data URI.
 */

export type EntradaImagem = {
  url?: string
  base64?: string
  /** Tipo MIME do base64; dispensável quando o base64 já é um data URI. */
  tipo?: string
}

export type ImagemSubida = {
  url: string
  largura: number
  altura: number
  bytes: number
}

type Ambiente = Record<string, string | undefined>

export type DependenciasImagem = {
  fetch?: typeof fetch
  env?: Ambiente
}

const DATA_URI = /^data:([^;,]+);base64,([\s\S]*)$/

function decodificar(base64: string, tipo: string | undefined) {
  const dataUri = DATA_URI.exec(base64)
  const conteudo = dataUri ? (dataUri[2] ?? "") : base64
  return {
    tipo: dataUri ? dataUri[1] : tipo,
    conteudo,
    bytes: Buffer.from(conteudo, "base64").length,
  }
}

/** Monta o `file` do Cloudinary depois das regras de exclusividade, tipo e tamanho. */
function arquivoParaEnvio(entrada: EntradaImagem): string {
  const temUrl = Boolean(entrada.url)
  const temBase64 = Boolean(entrada.base64)
  if (temUrl === temBase64) {
    throw new ErroDominio("ACAO_INVALIDA", "Envie url ou base64, um dos dois.")
  }

  if (entrada.url) {
    if (!/^https?:\/\//i.test(entrada.url)) {
      throw new ErroDominio("VALIDACAO", "Use uma URL http(s).", {
        url: "Use uma URL http(s).",
      })
    }
    return entrada.url
  }

  const { tipo, conteudo, bytes } = decodificar(entrada.base64 ?? "", entrada.tipo)
  if (!tipo || !ehTipoDeImagem(tipo)) {
    throw new ErroDominio("TIPO_NAO_SUPORTADO", MENSAGEM_TIPO_NAO_SUPORTADO)
  }
  if (bytes > MAX_BYTES_DA_IMAGEM) {
    throw new ErroDominio(
      "IMAGEM_GRANDE",
      `Imagem acima de ${emMegabytes(MAX_BYTES_DA_IMAGEM)}. Envie pela url pública da imagem.`
    )
  }
  return `data:${tipo};base64,${conteudo}`
}

export async function subirImagem(
  entrada: EntradaImagem,
  deps: DependenciasImagem = {}
): Promise<ImagemSubida> {
  const arquivo = arquivoParaEnvio(entrada)
  const env = deps.env ?? process.env
  const fazerFetch = deps.fetch ?? fetch

  const nuvem = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!nuvem || !preset) {
    throw new ErroDominio("FALHA_EXTERNA", "Cloudinary não configurado no servidor.")
  }

  const corpo = new FormData()
  corpo.append("file", arquivo)
  corpo.append("upload_preset", preset)
  const pasta = env.NEXT_PUBLIC_CLOUDINARY_FOLDER
  if (pasta) corpo.append("folder", pasta)

  let resposta: Response
  try {
    resposta = await fazerFetch(urlDeUpload(nuvem), { method: "POST", body: corpo })
  } catch {
    throw new ErroDominio("FALHA_EXTERNA", "Não foi possível falar com o Cloudinary.")
  }

  const dados = (await resposta.json().catch(() => ({}))) as {
    secure_url?: string
    width?: number
    height?: number
    bytes?: number
    error?: { message?: string }
  }
  if (!resposta.ok || !dados.secure_url) {
    const motivo = dados.error?.message ?? `HTTP ${resposta.status}`
    throw new ErroDominio("FALHA_EXTERNA", `O Cloudinary recusou a imagem: ${motivo}`)
  }
  return {
    url: dados.secure_url,
    largura: dados.width ?? 0,
    altura: dados.height ?? 0,
    bytes: dados.bytes ?? 0,
  }
}
