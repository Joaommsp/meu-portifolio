"use client"

import { MIDIA_TOQUE, useMediaQuery } from "@/hooks/useMediaQuery"

/**
 * Aparelho de toque (celular, tablet). Efeito que só se paga com mouse e GPU
 * folgada cai fora quando isto é true.
 */
export function useToque(): boolean {
  return useMediaQuery(MIDIA_TOQUE)
}
