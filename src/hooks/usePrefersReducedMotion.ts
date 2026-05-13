"use client"

import * as React from "react"

/**
 * Detecta `prefers-reduced-motion: reduce`. Retorna true se o usuário
 * pediu redução de movimento — todas as primitivas de animação caem
 * num fallback estático nesse caso.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return prefersReduced
}
