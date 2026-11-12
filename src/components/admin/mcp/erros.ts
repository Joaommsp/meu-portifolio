import { toast } from "sonner"

import { ErroApi } from "@/lib/admin-api/mcp"

export type ErrosDeCampo = Record<string, string>

export const SEM_ERROS: ErrosDeCampo = {}

/** Mensagem do servidor, como veio; nada de texto genérico. */
export function mensagemDoErro(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/**
 * Erro de envio de formulário: 400 com `campos` volta para o lado de cada
 * campo; o resto vira toast com a mensagem do servidor.
 */
export function errosDoEnvio(e: unknown): ErrosDeCampo {
  if (e instanceof ErroApi && Object.keys(e.campos).length > 0) return e.campos
  toast.error(mensagemDoErro(e))
  return SEM_ERROS
}
