import type { ZodError, ZodType } from "zod"

import { ErroDominio } from "./tipos"

/**
 * Primeiro erro do schema, para o toast das páginas do admin que salvam
 * item a item (figma, uses, atualmente, jogando). `null` quando passa.
 */
export function primeiroErro(
  schema: ZodType,
  valores: unknown
): { campo: string; mensagem: string } | null {
  const resultado = schema.safeParse(valores)
  if (resultado.success) return null
  const issue = resultado.error.issues[0]
  if (!issue) return null
  return { campo: issue.path.join("."), mensagem: issue.message }
}

/** Campo → primeira mensagem do zod; erro sem caminho fica em `_`. */
export function errosPorCampo(erro: ZodError): Record<string, string> {
  const campos: Record<string, string> = {}
  for (const issue of erro.issues) campos[issue.path.join(".") || "_"] ??= issue.message
  return campos
}

/** Dado do `safeParse` ou `ErroDominio` de validação com o erro de cada campo. */
export function validarOuFalhar<T>(
  resultado: { success: true; data: T } | { success: false; error: ZodError },
  mensagem: string
): T {
  if (!resultado.success) {
    throw new ErroDominio("VALIDACAO", mensagem, errosPorCampo(resultado.error))
  }
  return resultado.data
}
