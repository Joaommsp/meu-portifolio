/**
 * Formatos de imagem aceitos no upload, os mesmos no admin (navegador) e no
 * MCP (servidor).
 */
export const TIPOS_DE_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const
export type TipoDeImagem = (typeof TIPOS_DE_IMAGEM)[number]

/** Nome do formato como aparece no texto para o usuário e para a LLM. */
export const ROTULO_DO_TIPO_DE_IMAGEM: Record<TipoDeImagem, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
}

export const ROTULOS_DOS_TIPOS_DE_IMAGEM: readonly string[] = TIPOS_DE_IMAGEM.map(
  (tipo) => ROTULO_DO_TIPO_DE_IMAGEM[tipo]
)

export function ehTipoDeImagem(tipo: string): tipo is TipoDeImagem {
  return (TIPOS_DE_IMAGEM as readonly string[]).includes(tipo)
}

export const MENSAGEM_TIPO_NAO_SUPORTADO = `Tipo não suportado. Aceitos: ${ROTULOS_DOS_TIPOS_DE_IMAGEM.join(", ")}.`

/** Endpoint de upload unsigned do Cloudinary, o mesmo no admin e no MCP. */
export function urlDeUpload(nuvem: string): string {
  return `https://api.cloudinary.com/v1_1/${nuvem}/image/upload`
}
