"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Direction = "up" | "down" | "left" | "right"

type SlideInProps = {
  direction?: Direction
  distance?: number
  delay?: number
  duration?: number
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
  }
}

/**
 * Slide com fade no mount. `direction` indica de ONDE vem
 * (ex: "up" = vem de baixo, sobe para a posição final).
 */
export function SlideIn({
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.55,
  className,
  children,
}: SlideInProps) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  const offset = offsetFor(direction, distance)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
