"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ArrowDown, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
  ParticlesBackground,
  SpotlightGrid,
} from "@/components/backgrounds"
import { SlideIn, TextReveal, MagneticButton } from "@/components/animations"
import { TerminalOverlay } from "@/components/misc/TerminalOverlay"
import { CONTACT_EMAIL } from "@/lib/nav"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/**
 * Retrato recortado: fundo removido na origem, então ele pousa direto no
 * painel sem trazer retângulo nenhum. Foi o que tornou o painel escuro viável
 * — o duotone existia justamente pra disfarçar o fundo de estúdio que agora
 * não existe mais.
 */
const RETRATO = {
  src: "/images/retrato-v5.webp",
  alt: "João Marcos sentado, mãos entrelaçadas, de camisa branca",
}

/** Os três botões da barra de título, nas cores do macOS. */
const LUZES = [
  { cor: "#ff5f57", nome: "fechar" },
  { cor: "#febc2e", nome: "minimizar" },
  { cor: "#28c840", nome: "maximizar" },
] as const

/**
 * Hero como uma janela de sistema: barra de título com os três botões, texto à
 * esquerda e o retrato à direita com um terminal rodando por cima.
 *
 * A moldura não é enfeite. A foto tem fundo escuro de estúdio e, solta numa
 * página creme, o retângulo escuro fica órfão; dentro de uma janela ele lê como
 * conteúdo emoldurado. Mesma lição da seção de perfil.
 *
 * Substituiu o vídeo com scrub por scroll (um carro preto sobre fundo preto),
 * que no tema claro ou sumia sob o véu ou trazia o mesmo retângulo órfão.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="hero"
      // select-none: a janela é uma peça visual, não texto pra copiar —
      // arrastar sobre ela ia deixando seleção pelo caminho. Os CTAs seguem
      // clicáveis e leitor de tela lê tudo; só a seleção do mouse sai.
      className="relative isolate flex min-h-dvh items-center overflow-hidden py-24 select-none lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
        <GradientOrbs />
        <ParticlesBackground count={20} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridBackground opacity={0.04} />
        <NoiseTexture opacity={0.05} />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
        <div className="overflow-hidden rounded-[15px] border border-[var(--painel-borda)] bg-[var(--painel)] shadow-[0_30px_70px_-28px_var(--shadow-elevated)]">
          {/* Barra de título */}
          <div className="flex h-9.5 items-center gap-2 border-b border-[var(--painel-borda)] bg-[var(--painel-2)] px-3.5">
            <div className="flex gap-1.75">
              {LUZES.map(({ cor, nome }) => (
                <span
                  key={nome}
                  aria-hidden
                  className="block size-2.75 rounded-full"
                  style={{ background: cor }}
                />
              ))}
            </div>
            <span className="mx-auto font-mono text-[11.5px] text-[var(--painel-texto-2)]">
              <span className="font-medium text-[var(--painel-texto)]">joao-marcos</span>
              {" — zsh — 120×32"}
            </span>
          </div>

          {/* Corpo: texto | retrato. `isolate` prende o z-index do holofote
              dentro do painel. */}
          <div className="relative isolate grid lg:grid-cols-[1fr_0.84fr]">
            <SpotlightGrid />
            {/* Esmaecimento da BASE DO PAINEL, não da imagem. Preso à coluna
                da foto ele terminava numa aresta vertical no meio da janela —
                dava pra ver onde o overlay acabava. Aqui atravessa a largura
                toda, então não existe borda pra notar.
                z-15: acima do retrato (z-10), abaixo do texto (z-20) — assim
                dissolve o corte do recorte sem lavar os CTAs. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[15]"
              style={{
                background:
                  "linear-gradient(to top, var(--painel) 0%, var(--painel-veu-1) 6%, var(--painel-veu-2) 14%, var(--painel-veu-3) 25%, transparent 42%)",
              }}
            />
            <div className="relative z-20 flex flex-col justify-center px-7 py-14 text-[var(--painel-texto)] sm:px-10 lg:py-16">
              <h1 className="mb-5 font-display text-3xl font-bold leading-[1.02] tracking-tight sm:text-4xl md:text-5xl">
                <span className="block">
                  <TextReveal
                    text="Desenvolvedor"
                    by="letter"
                    delay={0.3}
                    staggerDelay={0.04}
                  />
                </span>
                <motion.span
                  className="mt-1 block text-gradient-brand-claro"
                  initial={reduced ? undefined : { opacity: 0, y: 30 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.0,
                    duration: 0.7,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                >
                  <TextReveal
                    text="Frontend & UI/UX"
                    by="word"
                    delay={1.05}
                    staggerDelay={0.08}
                  />
                </motion.span>
              </h1>

              <SlideIn direction="up" delay={1.55} duration={0.7}>
                <p className="mb-3 max-w-lg leading-relaxed text-[var(--painel-texto-2)]">
                  Construo interfaces em{" "}
                  <span className="text-[var(--painel-texto)]">React</span>,{" "}
                  <span className="text-[var(--painel-texto)]">Next.js</span> e{" "}
                  <span className="text-[var(--painel-texto)]">TypeScript</span>,
                  combinando o visual agradável com o funcional.
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={1.7}>
                <p className="mb-8 max-w-md text-sm text-[var(--painel-texto-2)]">
                  Bacharel em Sistemas de Informação pela UNIRIOS (2025). Paulo
                  Afonso, BA.
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={1.85}>
                {/* No toque os CTAs empilham em 48px de altura e largura cheia;
                    a partir de sm voltam lado a lado no tamanho compacto. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <MagneticButton strength={0.3} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 w-full bg-brand-glow text-[var(--painel)] hover:bg-brand-glow/90 sm:h-9 sm:w-auto"
                      render={<Link href="/projetos" />}
                    >
                      Ver projetos
                      <ArrowRight className="size-4" data-icon="inline-end" />
                    </Button>
                  </MagneticButton>
                  <MagneticButton strength={0.3} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full border-brand-glow/45 bg-transparent text-brand-glow hover:bg-brand-glow/10 hover:text-brand-glow sm:h-9 sm:w-auto"
                      render={<a href={`mailto:${CONTACT_EMAIL}`} />}
                    >
                      <Mail className="size-4" data-icon="inline-start" />
                      Entrar em contato
                    </Button>
                  </MagneticButton>
                </div>
              </SlideIn>
            </div>

            {/* Retrato + terminal. O terminal corre por trás da figura; o
                recorte é ancorado à DIREITA pra sobrar a faixa da esquerda,
                senão a figura tapava as linhas quase todas. */}
            <div className="relative z-10 h-80 sm:h-96 lg:h-auto lg:min-h-104">
              <TerminalOverlay className="z-0" />
              <Image
                src={RETRATO.src}
                alt={RETRATO.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="z-10 object-contain object-bottom lg:object-bottom-right"
                /* saturate e drop-shadow na MESMA declaração: `filter` inline
                   sobrescreve a que o Tailwind gera, então a classe
                   `saturate-*` era silenciosamente descartada aqui. */
                style={{
                  filter:
                    "saturate(0.5) drop-shadow(0 18px 34px var(--painel-sombra))",
                }}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">
          Role
        </span>
        <ArrowDown className="size-4 animate-bounce" />
      </div>
    </section>
  )
}
