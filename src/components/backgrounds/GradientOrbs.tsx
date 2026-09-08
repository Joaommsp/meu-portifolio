"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Orb = {
  size: number
  x: string
  y: string
  color: string
  duration: number
  delay: number
  opacity?: number
}

const DEFAULT_ORBS: Orb[] = [
  {
    size: 480,
    x: "5%",
    y: "10%",
    color: "var(--orb-1)",
    duration: 18,
    delay: 0,
    opacity: 0.35,
  },
  {
    size: 360,
    x: "75%",
    y: "55%",
    color: "var(--orb-2)",
    duration: 22,
    delay: 2,
    opacity: 0.3,
  },
  {
    size: 420,
    x: "35%",
    y: "85%",
    color: "var(--orb-3)",
    duration: 26,
    delay: 4,
    opacity: 0.25,
  },
]

type Props = {
  className?: string
  orbs?: Orb[]
}

/**
 * 3 orbs blurrados se movendo lentamente em loop.
 *
 * A cor NÃO segue o accent: orb é atmosfera de fundo, e o fundo do site é
 * constante (creme + rosa) por regra. Usa os tokens --orb-*; quem precisar
 * de outra cor passa `orbs` explicitamente.
 */
export function GradientOrbs({ className, orbs = DEFAULT_ORBS }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(80px)",
            opacity: orb.opacity ?? 0.3,
          }}
          animate={
            reduced
              ? undefined
              : {
                  x: [0, 60, -40, 0],
                  y: [0, -50, 35, 0],
                }
          }
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
