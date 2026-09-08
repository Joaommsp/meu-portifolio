"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useThemeColor } from "@/contexts/ThemeColorContext"
import { ACCENT_ESCALAS, PAINEL_TEXTO } from "@/lib/accent-colors"
import { lerOklch, oklchParaRgba } from "@/lib/color"
import { useCanvasPonteiro, type AmbienteCanvas } from "@/hooks/useCanvasPonteiro"

/* Geometria da grade. */
const PASSO = 34 // px entre cruzetas
const BRACO = 6 // px de cada braço da cruzeta
const ALCANCE = 230 // px de raio em que o holofote ainda acende

/* Opacidade da cruzeta em repouso e sob o centro do holofote. */
const ALFA_BASE = 0.05
const ALFA_PICO = 0.35
/* Acima disto a cruzeta troca a tinta neutra pela cor do accent. */
const LIMIAR_ACCENT = 0.25
/* Brilho do halo por cima da grade. */
const ALFA_HALO = 0.1

type Props = {
  className?: string
  /** Cor das cruzetas em repouso, como `oklch(L C H)`. */
  corBase?: string
}

/**
 * Grade de cruzetas discretas com um holofote que segue o cursor: as cruzetas
 * perto da luz crescem em opacidade e trocam para a cor do accent, e um halo
 * suave passa por cima.
 *
 * Escolhido para o painel escuro do hero justamente por ser o fundo interativo
 * mais CALMO — ali já convivem retrato, título, CTAs e o terminal. Constelação
 * e campo de linhas competiriam com tudo isso.
 *
 * O accent vem de `ACCENT_ESCALAS[...].meio`, não de `--brand`: sobre fundo
 * escuro o `--brand` (L ~0.5) some, e `meio` (L ~0.75) é o passo claro da
 * mesma escala. Também não dá pra ler `--brand` do CSS — a var tem transição
 * de 300ms via @property e `getComputedStyle` devolveria a cor do meio da
 * animação.
 *
 * Ciclo de vida (rAF, ponteiro, DPR, reduced-motion) fica no
 * `useCanvasPonteiro`; aqui mora só o desenho.
 */
export function SpotlightGrid({
  className,
  corBase = PAINEL_TEXTO,
}: Props) {
  const { accent } = useThemeColor()

  const paleta = React.useMemo(() => {
    const neutro = lerOklch(corBase) ?? { l: 0.97, c: 0.014, h: 78 }
    const marca = lerOklch(ACCENT_ESCALAS[accent].meio) ?? neutro
    return { neutro, marca }
  }, [accent, corBase])

  const pintar = React.useCallback(
    ({ ctx, larg, alt, mx, my, dentro }: AmbienteCanvas) => {
      ctx.clearRect(0, 0, larg, alt)
      ctx.lineWidth = 1

      for (let x = PASSO / 2; x < larg; x += PASSO) {
        for (let y = PASSO / 2; y < alt; y += PASSO) {
          const k = dentro
            ? Math.max(0, 1 - Math.hypot(x - mx, y - my) / ALCANCE)
            : 0
          const forca = k * k
          ctx.strokeStyle = oklchParaRgba(
            forca > LIMIAR_ACCENT ? paleta.marca : paleta.neutro,
            ALFA_BASE + (ALFA_PICO - ALFA_BASE) * forca
          )
          ctx.beginPath()
          ctx.moveTo(x - BRACO, y)
          ctx.lineTo(x + BRACO, y)
          ctx.moveTo(x, y - BRACO)
          ctx.lineTo(x, y + BRACO)
          ctx.stroke()
        }
      }

      if (dentro) {
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, ALCANCE + 10)
        halo.addColorStop(0, oklchParaRgba(paleta.marca, ALFA_HALO))
        halo.addColorStop(1, oklchParaRgba(paleta.marca, 0))
        ctx.fillStyle = halo
        ctx.fillRect(0, 0, larg, alt)
      }

      // Desenho sem inércia: o quadro já reflete a posição atual do cursor, e
      // o próximo movimento reacorda o loop.
      return false
    },
    [paleta]
  )

  const canvasRef = useCanvasPonteiro(pintar)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  )
}
