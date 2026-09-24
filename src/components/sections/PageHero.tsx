import * as React from "react"

import { DotMesh, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { FadeIn, SlideIn } from "@/components/animations"
import { WindowFrame } from "@/components/misc/WindowFrame"
import { cn } from "@/lib/utils"

/** Atmosfera do creme — a mesma em toda página interna, de propósito. */
const ORBS = [
  {
    size: 400,
    x: "10%",
    y: "20%",
    color: "var(--orb-1)",
    duration: 18,
    delay: 0,
    opacity: 0.25,
  },
  {
    size: 350,
    x: "75%",
    y: "60%",
    color: "var(--orb-2)",
    duration: 22,
    delay: 2,
    opacity: 0.2,
  },
]

/** Largura do rail, e o vão entre ele e a janela. Ver `RECUO_CONTEUDO`. */
const RAIL = "lg:w-8"
const VAO = "lg:gap-7"
/**
 * Alinha o conteúdo abaixo com a borda esquerda da janela: é a soma de `RAIL`
 * (2rem) e `VAO` (1.75rem). Mexer num dos dois sem mexer aqui desalinha.
 */
const RECUO_CONTEUDO = "lg:pl-15"

/**
 * A malha de FORA é textura de margem: fica atrás da janela opaca, e com o
 * espaçamento padrão o frame recalcularia ~1200 pontos que ninguém vê.
 */
const ESPACAMENTO_MARGEM = 36

type Props = {
  /** Rótulo do rail vertical. Curto — o rail tem 2rem de largura. */
  rotulo: string
  /** Ícone opcional do rail. Fica ereto mesmo com o texto na vertical. */
  icone?: React.ReactNode
  /** Seção mostrada na barra de título da janela (o slug da rota). */
  janela: string
  /** H1 da página. Aceita `<br>` e `<span className="text-gradient-brand-claro">`. */
  titulo: React.ReactNode
  /** Linha de apoio, dentro da janela, abaixo do título. */
  descricao?: React.ReactNode
  /** Ações principais, dentro da janela. */
  acoes?: React.ReactNode
  /** Números, badges e CTAs secundários — ficam FORA da janela, sobre o creme. */
  children?: React.ReactNode
  className?: string
}

/**
 * Hero padrão das páginas internas: rail vertical no creme e o título dentro
 * de uma janela escura, com a malha de pontos acendendo sob o cursor dos dois
 * lados da moldura.
 *
 * A janela repete a metáfora do hero da home em vez de inventar uma segunda
 * linguagem para as internas — e o bloco escuro no meio do creme é o maior
 * contraste da página, que é o que dá presença ao título.
 *
 * O rail vira uma linha horizontal acima da janela abaixo de `lg`: o
 * `writing-mode` vertical não cabe em tela estreita.
 */
export function PageHero({
  rotulo,
  icone,
  janela,
  titulo,
  descricao,
  acoes,
  children,
  className,
}: Props) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <DotMesh espacamento={ESPACAMENTO_MARGEM} />
      <GradientOrbs orbs={ORBS} />
      <NoiseTexture opacity={0.04} />

      <div className="container relative mx-auto max-w-6xl px-5 py-20 sm:px-6 md:py-24">
        <div className={cn("flex flex-col gap-5 lg:flex-row", VAO)}>
          <FadeIn
            className={cn(
              "flex shrink-0 items-center gap-4 text-brand lg:flex-col lg:justify-center lg:gap-6",
              RAIL
            )}
          >
            <span aria-hidden className="block h-px w-12 bg-current lg:h-22 lg:w-px" />
            {icone}
            <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] lg:[writing-mode:vertical-rl]">
              {rotulo}
            </p>
          </FadeIn>

          <SlideIn direction="up" delay={0.1} className="flex-1">
            <WindowFrame secao={janela} className="superficie-painel">
              {/* A malha de pontos fica só no creme, ATRÁS da janela: dentro
                  do painel ela competia com o título em vez de emoldurá-lo.

                  `text-foreground` não é redundante: sem ele o que estiver
                  aqui dentro herda a tinta do creme (o Button `outline`, por
                  exemplo, não declara cor própria) e some no escuro. */}
              <div className="relative overflow-hidden px-6 py-14 text-foreground sm:px-10 md:px-14 md:py-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -bottom-40 size-136 rounded-full opacity-20"
                  style={{
                    background:
                      "radial-gradient(ellipse, var(--brand-glow) 0%, transparent 68%)",
                  }}
                />

                <div className="relative">
                  <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.035em] text-pretty md:text-[5rem]">
                    {titulo}
                  </h1>
                  {descricao && (
                    <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                      {descricao}
                    </p>
                  )}
                  {acoes && (
                    <div className="mt-9 flex flex-wrap items-center gap-4">{acoes}</div>
                  )}
                </div>
              </div>
            </WindowFrame>
          </SlideIn>
        </div>

        {children && (
          <SlideIn
            direction="up"
            delay={0.2}
            className={cn("mt-12", RECUO_CONTEUDO)}
          >
            {children}
          </SlideIn>
        )}
      </div>
    </section>
  )
}
