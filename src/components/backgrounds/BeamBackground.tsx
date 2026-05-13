"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Beam = {
  width: number
  color: string
  duration: number
  delay: number
  rotation: number
  opacity: number
}

const DEFAULT_BEAMS: Beam[] = [
  {
    width: 200,
    color: "var(--brand)",
    duration: 12,
    delay: 0,
    rotation: 25,
    opacity: 0.35,
  },
  {
    width: 100,
    color: "var(--brand-glow)",
    duration: 16,
    delay: 3,
    rotation: 25,
    opacity: 0.25,
  },
  {
    width: 150,
    color: "var(--brand-hover)",
    duration: 14,
    delay: 6,
    rotation: 25,
    opacity: 0.3,
  },
]

type Props = {
  className?: string
  beams?: Beam[]
}

/**
 * Feixes de luz diagonais atravessando a tela em loop.
 * Cinematográfico — usa em hero ou seção de impacto.
 */
export function BeamBackground({ className, beams = DEFAULT_BEAMS }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {beams.map((beam, i) => (
        <motion.div
          key={i}
          className="absolute -top-1/4 left-0 h-[150%] origin-top-left will-change-transform"
          style={{
            width: beam.width,
            background: `linear-gradient(to bottom, transparent 0%, ${beam.color} 50%, transparent 100%)`,
            filter: "blur(8px)",
            opacity: beam.opacity,
            rotate: `${beam.rotation}deg`,
          }}
          initial={{ x: "-30vw" }}
          animate={reduced ? { x: "30vw" } : { x: ["-30vw", "130vw"] }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: reduced ? 0 : Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
