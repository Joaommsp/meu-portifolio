"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type TextRevealProps = {
  text: string
  /** Granularidade da animação. */
  by?: "word" | "letter"
  /** Delay antes da primeira parte aparecer (s). */
  delay?: number
  /** Stagger entre partes (s). */
  staggerDelay?: number
  /** Duração de cada parte (s). */
  duration?: number
  /** Se true, anima quando entra no viewport. Padrão: anima no mount. */
  inView?: boolean
  /**
   * Desliga o slide, deixando só o fade.
   *
   * OBRIGATÓRIO quando o TextReveal está dentro de um elemento com
   * `background-clip: text` (as utilities `text-gradient-brand*`): ali o texto
   * é transparente e quem pinta é o gradiente recortado do ANCESTRAL. Um
   * filho com `transform` passa a pintar em camada própria, onde o recorte do
   * ancestral não alcança — e a parte transformada some da tela. Opacidade não
   * tem esse efeito; só o transform.
   */
  deslocar?: boolean
  className?: string
}

/**
 * Revela texto palavra-a-palavra ou letra-a-letra com fade + slide-up.
 *
 * Dentro de um elemento com gradiente de texto, passar `deslocar={false}`
 * (ver a prop) — senão as partes somem.
 *
 * Acessibilidade: `aria-label` tem o texto completo, parts são
 * `aria-hidden`, então leitores de tela pegam o texto inteiro de uma vez.
 */
export function TextReveal({
  text,
  by = "word",
  delay = 0,
  staggerDelay = 0.04,
  duration = 0.55,
  inView = false,
  deslocar = true,
  className,
}: TextRevealProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <span className={className}>{text}</span>
  }

  const parts = by === "letter" ? Array.from(text) : text.split(" ")

  const initial = deslocar ? { opacity: 0, y: "0.5em" } : { opacity: 0 }
  const animate = deslocar ? { opacity: 1, y: 0 } : { opacity: 1 }

  return (
    <span
      className={className}
      aria-label={text}
      style={{ display: "inline-block" }}
    >
      {parts.map((part, idx) => {
        const isLast = idx === parts.length - 1
        const content = by === "word" ? (isLast ? part : `${part} `) : part
        const transition = {
          delay: delay + idx * staggerDelay,
          duration,
          ease: [0.25, 0.4, 0.25, 1] as const,
        }
        return (
          <motion.span
            key={`${part}-${idx}`}
            aria-hidden="true"
            initial={initial}
            {...(inView
              ? {
                  whileInView: animate,
                  viewport: { once: true, amount: 0.3 },
                }
              : { animate })}
            transition={transition}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {content}
          </motion.span>
        )
      })}
    </span>
  )
}
