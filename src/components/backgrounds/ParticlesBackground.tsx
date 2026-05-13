"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Particle = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

type Props = {
  className?: string
  count?: number
}

/**
 * Pontinhos flutuando sutilmente. Use atrás do hero pra dar
 * sensação de profundidade. Particles são geradas no client
 * (após mount) pra evitar mismatch de hidratação com Math.random().
 */
export function ParticlesBackground({ className, count = 35 }: Props) {
  const reduced = usePrefersReducedMotion()
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    const list = Array.from({ length: count }, (_, i): Particle => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    setParticles(list)
  }, [count])

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brand will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={
            reduced
              ? undefined
              : {
                  y: [-20, 20, -20],
                  opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
