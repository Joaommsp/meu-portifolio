"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

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
 * Revela elementos quando entram no viewport. Use para seções
 * de página que aparecem conforme o usuário scrolla.
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
  if (reduced) return <div className={className}>{children}</div>

  const offset = offsetFor(direction, distance)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ delay, duration, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
