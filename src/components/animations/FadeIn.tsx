"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type FadeInProps = {
  delay?: number
  duration?: number
  className?: string
  children: React.ReactNode
}

/**
 * Fade-in simples no mount (initial → animate).
 * Para fade ao entrar no viewport, use ScrollReveal.
 */
export function FadeIn({
  delay = 0,
  duration = 0.5,
  className,
  children,
}: FadeInProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
