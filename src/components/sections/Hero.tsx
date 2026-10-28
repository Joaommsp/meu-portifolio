"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DotPattern } from "@/components/backgrounds"
import { SlideIn, TextReveal } from "@/components/animations"
import { WindowFrame } from "@/components/misc/WindowFrame"
import { TerminalOverlay } from "@/components/misc/TerminalOverlay"
import { CASCA_HERO } from "@/components/sections/secao"
import { CONTACT_EMAIL } from "@/lib/nav"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useToque } from "@/hooks/useToque"
import { cn } from "@/lib/utils"

/** Retrato recortado: fundo removido na origem, pousa direto no vidro. */
const RETRATO = {
  src: "/images/retrato-v5.webp",
  alt: "João Marcos sentado, mãos entrelaçadas, de camisa branca",
}

/**
 * Hero como uma janela de vidro: barra de título com os três botões, texto à
 * esquerda e o retrato à direita, com um terminal translúcido atrás do texto.
 *
 * Um traço de luz no accent corre a borda da janela.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const toque = useToque()
  const Envoltorio = reduced ? "span" : motion.span

  return (
    <section
      id="hero"
      // select-none: a janela é uma peça visual, não texto pra copiar.
      className={cn(CASCA_HERO, "py-24 select-none lg:py-28")}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <DotPattern opacity={0.06} />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
        <WindowFrame className="luz-borda relative">
          <div className="relative isolate grid lg:grid-cols-[1fr_0.84fr]">
            {/* Terminal atrás do texto, no lado esquerdo, translúcido. */}
            {!toque && (
              <TerminalOverlay className="right-auto z-0 w-[55%] opacity-[0.16] max-lg:hidden" />
            )}

            <div className="relative z-20 flex flex-col justify-center px-7 py-14 sm:px-10 lg:py-16">
              <h1 className="mb-5 font-display text-3xl font-bold leading-[1.02] tracking-tight sm:text-4xl md:text-5xl">
                <span className="block">
                  <TextReveal text="Desenvolvedor" by="letter" delay={0.3} staggerDelay={0.04} />
                </span>
                {/* Com redução de movimento, um <span> puro: um motion com
                    alvos undefined ficava parado em opacity 0. */}
                <Envoltorio
                  className="mt-1 block text-brand"
                  {...(reduced
                    ? {}
                    : {
                        initial: { opacity: 0, y: 30 },
                        animate: { opacity: 1, y: 0 },
                        transition: { delay: 1.0, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
                      })}
                >
                  <TextReveal
                    text="Frontend & UI/UX"
                    by="word"
                    delay={1.05}
                    staggerDelay={0.08}
                    deslocar={false}
                  />
                </Envoltorio>
              </h1>

              <SlideIn direction="up" delay={1.55} duration={0.7}>
                <p className="mb-3 max-w-lg leading-relaxed text-muted-foreground">
                  Construo interfaces em <span className="text-foreground">React</span>,{" "}
                  <span className="text-foreground">Next.js</span> e{" "}
                  <span className="text-foreground">TypeScript</span>, combinando o visual
                  agradável com o funcional.
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={1.7}>
                <p className="mb-8 max-w-md text-sm text-muted-foreground">
                  Bacharel em Sistemas de Informação pela UNIRIOS (2025). Paulo Afonso, BA.
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={1.85}>
                {/* No toque os CTAs empilham em 48px de altura e largura cheia. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full sm:h-10 sm:w-auto"
                    render={<Link href="/projetos" />}
                  >
                    Ver projetos
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="vidro h-12 w-full rounded-full sm:h-10 sm:w-auto"
                    render={<a href={`mailto:${CONTACT_EMAIL}`} />}
                  >
                    <Mail className="size-4" data-icon="inline-start" />
                    Entrar em contato
                  </Button>
                </div>
              </SlideIn>
            </div>

            {/* Retrato: a base se dissolve no vidro em vez de cortar reto. */}
            <div className="relative z-10 h-80 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] sm:h-96 lg:h-auto lg:min-h-104">
              <Image
                src={RETRATO.src}
                alt={RETRATO.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-bottom lg:object-bottom-right"
                style={{ filter: "saturate(0.55) drop-shadow(0 18px 30px var(--vidro-sombra))" }}
                priority
              />
            </div>
          </div>
        </WindowFrame>
      </div>
    </section>
  )
}
