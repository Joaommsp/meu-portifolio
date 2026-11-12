/**
 * Leitura saneada de documento do Firestore para a forma do formulário.
 * Documento antigo ou meio preenchido não pode derrubar o admin nem o MCP:
 * campo ausente vira o vazio do formulário.
 */

/**
 * Objeto literal (`{}`), não `Date`, `Timestamp` nem lista. A conversão de
 * datas do repositório e a mescla do parcial no serviço usam a mesma regra.
 */
export function ehObjetoSimples(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype
}

export function texto(v: unknown): string {
  return typeof v === "string" ? v : ""
}

export function listaDeTextos(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : []
}

export function numero(v: unknown, padrao = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : padrao
}

export function numeroOuNulo(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

export function booleano(v: unknown): boolean {
  return Boolean(v)
}

/** `Date`, string ISO ou `Timestamp` (qualquer coisa com `toDate()`). */
export function data(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v === "string" && v !== "") {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (v && typeof v === "object" && "toDate" in v) {
    const toDate = (v as { toDate: unknown }).toDate
    if (typeof toDate === "function") return data(toDate.call(v))
  }
  return null
}

/**
 * Fuso das datas do conteúdo (horário de Brasília, sem horário de verão).
 * Fixo em vez do fuso de quem roda: o admin grava do navegador no Brasil e o
 * MCP grava da Vercel em UTC, e os dois precisam chegar à mesma meia-noite.
 */
const FUSO_DO_SITE = "-03:00"
const DESLOCAMENTO_DO_SITE_MS = -3 * 60 * 60 * 1000

/** `YYYY-MM-DD` no fuso do site (o `input type=date` espera isso). */
export function paraDataIso(d: Date): string {
  return new Date(d.getTime() + DESLOCAMENTO_DO_SITE_MS).toISOString().slice(0, 10)
}

/** Meia-noite do dia no fuso do site, igual em qualquer servidor. */
export function deDataIso(s: string): Date {
  return new Date(`${s}T00:00:00${FUSO_DO_SITE}`)
}
