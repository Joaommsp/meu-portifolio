import "server-only"

import { createHash, randomBytes } from "node:crypto"

import { PREFIXO_DO_SEGREDO, type TipoAcesso } from "@/lib/mcp/tipos"

/** Bytes aleatórios do segredo: 32 bytes viram 43 caracteres base64url. */
const BYTES_DO_SEGREDO = 32
/** Caracteres do segredo, depois do prefixo do tipo, que ficam visíveis. */
const CARACTERES_VISIVEIS = 4

/** sha256 hex: é o id do documento; o segredo em texto puro nunca é gravado. */
export function hashDoSegredo(segredo: string): string {
  return createHash("sha256").update(segredo).digest("hex")
}

export function gerarSegredo(tipo: TipoAcesso): {
  segredo: string
  hash: string
  prefixo: string
} {
  const inicio = PREFIXO_DO_SEGREDO[tipo]
  const segredo = inicio + randomBytes(BYTES_DO_SEGREDO).toString("base64url")
  return {
    segredo,
    hash: hashDoSegredo(segredo),
    prefixo: segredo.slice(0, inicio.length + CARACTERES_VISIVEIS),
  }
}
