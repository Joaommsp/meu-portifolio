"use client"

import * as React from "react"
import Lenis from "lenis"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/**
 * Smooth scroll global via Lenis.
 *
 * Imprescindível pro scroll-driven video scrubbing do Hero — sem isso,
 * o trackpad/mouse causa jitter e o vídeo "engasga" entre frames.
 *
 * Respeita `prefers-reduced-motion` (não inicializa).
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const reduced = usePrefersReducedMotion()

  React.useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.1,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reduced])

  return <>{children}</>
}
