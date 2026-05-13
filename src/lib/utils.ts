import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte texto em slug URL-friendly:
 * - Remove acentos
 * - Lowercase
 * - Espaços → hífens
 * - Remove caracteres não alfanuméricos
 * - Colapsa hífens duplicados
 *
 * Ex: "Olá Mundo!" → "ola-mundo"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Trunca string preservando palavras (não corta no meio).
 * Ex: truncate("Olá mundo bem-vindo", 10) → "Olá mundo…"
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const sliced = text.slice(0, max)
  const lastSpace = sliced.lastIndexOf(" ")
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + "…"
}
