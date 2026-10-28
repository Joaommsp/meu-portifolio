"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"

type Direction = "up" | "down" | "left" | "right" | "none"

type ScrollRevealProps = {
  direction?: Direction
  distance?: number
  delay?: number
  duration?: number
  /** Anima só uma vez (true) ou toda vez que entra/sai do viewport (false). */
  once?: boolean
  /** Fração visível pra disparar (0–1). */
  amount?: number
  className?: string
  children: React.ReactNode
}

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance }
    case "down":
      return { y: -distance }
    case "left":
      return { x: distance }
    case "right":
      return { x: -distance }
    case "none":
      return {}
  }
}

/**
 * Revela elementos quando entram no viewport: chegam fora de foco e assentam
 * (opacidade, deslocamento e desfoque juntos). Use para seções de página que
 * aparecem conforme o usuário rola. Ao terminar, o filtro sai de vez: um
 * `blur(0px)` parado ainda criaria stacking context e prenderia `fixed`.
 */
export function ScrollReveal({
  direction = "up",
  distance = 32,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
  className,
  children,
}: ScrollRevealProps) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={cn("min-w-0", className)}>{children}</div>

  const offset = offsetFor(direction, distance)

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={{ opacity: 0, filter: "blur(6px)", ...offset }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0, transitionEnd: { filter: "none" } }}
      viewport={{ once, amount }}
      transition={{ delay, duration: duration + 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
