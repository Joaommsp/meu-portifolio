"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"

type MagneticButtonProps = {
  /** Intensidade do efeito (0–1). 0.3 é sutil; 0.6 é dramático. */
  strength?: number
  className?: string
  children: React.ReactNode
}

/**
 * Wrapper que faz o conteúdo "seguir" o cursor com um spring suave
 * quando o mouse passa por cima. Em touch ou prefers-reduced-motion
 * cai num wrapper estático.
 */
export function MagneticButton({
  strength = 0.3,
  className,
  children,
}: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.5 })

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const dx = e.clientX - rect.left - rect.width / 2
      const dy = e.clientY - rect.top - rect.height / 2
      x.set(dx * strength)
      y.set(dy * strength)
    },
    [strength, x, y]
  )

  const handleMouseLeave = React.useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  if (reduced) {
    return (
      <div ref={ref} className={cn("inline-block", className)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block will-change-transform", className)}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
