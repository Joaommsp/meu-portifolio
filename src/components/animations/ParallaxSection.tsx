"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type ParallaxSectionProps = {
  /**
   * Velocidade do parallax. Positivo = move pra cima ao scrollar
   * (efeito "puxar"). Negativo = move pra baixo.
   * Range típico: 0.1 a 0.6.
   */
  speed?: number
  className?: string
  children: React.ReactNode
}

/**
 * Aplica translateY baseado no scroll progress da seção dentro
 * do viewport. Use em backgrounds, imagens, ou blocos decorativos.
 */
export function ParallaxSection({
  speed = 0.3,
  className,
  children,
}: ParallaxSectionProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // 0 → 1 (entrada → saída) mapeia para 0 → -speed*200px
  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 200])

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
