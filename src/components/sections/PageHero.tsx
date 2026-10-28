import * as React from "react"

import { FadeIn } from "@/components/animations"
import { CASCA_HERO } from "@/components/sections/secao"
import { cn } from "@/lib/utils"

type Props = {
  /**
   * H1 da página. Aceita `<br>` e `<span>`: o span fica na mesma cor do
   * título (gradiente de texto aqui dentro é neutralizado) e ganha só peso.
   */
  titulo: React.ReactNode
  /** Linha de apoio, abaixo do título. */
  descricao?: React.ReactNode
  /** Ações principais, abaixo da descrição. */
  acoes?: React.ReactNode
  /** Números, badges e CTAs secundários, abaixo do bloco do título. */
  children?: React.ReactNode
  /** Bloco à direita do título a partir de md (embaixo dele no celular). */
  lateral?: React.ReactNode
  className?: string
}

/**
 * Hero padrão das páginas internas: título e apoio direto sobre o
 * fundo da página, sem moldura nem textura.
 *
 * Mantém a casca do hero da home (`CASCA_HERO`): o `HeroSobreposto` prende o
 * hero e precisa que ele ocupe uma tela.
 */
export function PageHero({
  titulo,
  descricao,
  acoes,
  children,
  lateral,
  className,
}: Props) {
  return (
    <section className={cn(CASCA_HERO, className)}>
      <FadeIn
        className={cn(
          "container relative mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-24",
          lateral && "md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10"
        )}
      >
        <div>
          {/* `<span>` no título ganha só peso, na mesma cor (behance usa). */}
          <h1 className="max-w-4xl font-display text-[2.5rem] font-medium leading-[0.95] tracking-[-0.035em] text-pretty text-foreground sm:text-5xl md:text-7xl [&_span]:bg-none [&_span]:font-bold [&_span]:text-current">
            {titulo}
          </h1>
          {descricao && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {descricao}
            </p>
          )}
          {acoes && (
            <div className="mt-8 flex flex-wrap items-center gap-4">{acoes}</div>
          )}

          {children && <div className="mt-10">{children}</div>}
        </div>
        {lateral && <div className="mt-8 md:mt-0">{lateral}</div>}
      </FadeIn>
    </section>
  )
}
