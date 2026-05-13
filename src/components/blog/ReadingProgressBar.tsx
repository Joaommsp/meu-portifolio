"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

/**
 * Barra fininha no topo da página que cresce conforme o usuário rola
 * pelo artigo. Indica % lido. Posicionada `fixed`.
 *
 * Usa rAF loop ao invés de listener `scroll` nativo — Lenis (smooth
 * scroll) desacopla o evento, então polling por frame é mais confiável.
 */
export function ReadingProgressBar() {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    let rafId = 0
    let last = -1

    function tick() {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        docHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
          : 0

      if (Math.abs(progress - last) > 0.1) {
        last = progress
        setValue(progress)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <ProgressPrimitive.Root
      aria-label="Progresso de leitura"
      value={value}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
    >
      <ProgressPrimitive.Track className="relative block h-1 w-full overflow-hidden bg-transparent">
        <ProgressPrimitive.Indicator className="h-full bg-brand shadow-[0_0_8px_var(--brand-glow)]" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}
