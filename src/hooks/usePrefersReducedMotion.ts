"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"

/**
 * Detecta `prefers-reduced-motion: reduce`. Retorna true se o usuário
 * pediu redução de movimento; todas as primitivas de animação caem
 * num fallback estático nesse caso.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}
