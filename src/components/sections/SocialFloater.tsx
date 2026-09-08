"use client"

import { motion } from "motion/react"

import { SOCIAL_LINKS } from "@/lib/nav"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/**
 * Linha vertical fixa no canto esquerdo com socials empilhados.
 * Estilo Brittany Chiang. Aparece só em ≥1024px.
 */
export function SocialFloater() {
  const reduced = usePrefersReducedMotion()
  /* Com redução de movimento vira <aside> puro. Passar alvos undefined a um
     motion deixa o elemento preso no estado inicial (opacity 0), porque o
     hook só reporta a preferência DEPOIS do mount — quando o Motion já
     aplicou o initial e não tem mais para onde animar. */
  const Envoltorio = reduced ? "aside" : motion.aside

  return (
    <Envoltorio
      aria-label="Redes sociais"
      className="fixed bottom-0 left-6 z-30 hidden flex-col items-center gap-5 lg:flex"
      {...(reduced
        ? {}
        : {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 1.4, duration: 0.6 },
          })}
    >
      <ul className="flex flex-col gap-3 list-none">
        {SOCIAL_LINKS.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              data-cursor-grow
              className="block text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-brand"
            >
              <s.icon className="size-4" />
            </a>
          </li>
        ))}
      </ul>
      <div
        aria-hidden
        className="h-24 w-px bg-gradient-to-b from-border to-transparent"
      />
    </Envoltorio>
  )
}
