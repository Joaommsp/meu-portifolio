"use client"

import * as React from "react"
import { GitHubCalendar } from "react-github-calendar"

import { useThemeColor, type Accent } from "@/contexts/ThemeColorContext"

/**
 * Contribution graph do GitHub colorido com o accent atual do site.
 *
 * Por que ramp hardcoded em JS em vez de ler CSS vars:
 *   As CSS vars `--brand*` têm transição de 300ms (registradas via
 *   @property). getComputedStyle retorna o valor interpolado, não o
 *   final — causava o "off-by-one" (graph mostrava cor anterior).
 *   Mapear accent → 5 cores diretamente em JS é instant + correto.
 *
 * Ramp (nível 0 → 4):
 *   0: muted (sem contribuições)         — cinza
 *   1: brand-muted (poucas)              — escuro do brand
 *   2: brand-glow (algumas)              — médio
 *   3: brand (muitas)                    — saturado
 *   4: brand-hover (muito ativo)         — mais brilhante
 */

const MUTED = "oklch(0.22 0.012 260)" // --muted

type Ramp = [string, string, string, string, string]

const ACCENT_RAMPS: Record<Accent, Ramp> = {
  green: [
    MUTED,
    "oklch(0.42 0.10 145)",
    "oklch(0.65 0.24 145)",
    "oklch(0.78 0.22 145)",
    "oklch(0.83 0.22 145)",
  ],
  blue: [
    MUTED,
    "oklch(0.38 0.10 250)",
    "oklch(0.58 0.22 250)",
    "oklch(0.70 0.20 250)",
    "oklch(0.75 0.20 250)",
  ],
  purple: [
    MUTED,
    "oklch(0.38 0.11 290)",
    "oklch(0.58 0.24 290)",
    "oklch(0.70 0.22 290)",
    "oklch(0.75 0.22 290)",
  ],
  red: [
    MUTED,
    "oklch(0.38 0.11 25)",
    "oklch(0.58 0.24 25)",
    "oklch(0.70 0.22 25)",
    "oklch(0.75 0.22 25)",
  ],
  orange: [
    MUTED,
    "oklch(0.42 0.10 60)",
    "oklch(0.65 0.21 60)",
    "oklch(0.78 0.19 60)",
    "oklch(0.83 0.19 60)",
  ],
  cyan: [
    MUTED,
    "oklch(0.42 0.09 195)",
    "oklch(0.70 0.18 195)",
    "oklch(0.82 0.16 195)",
    "oklch(0.87 0.16 195)",
  ],
  pink: [
    MUTED,
    "oklch(0.42 0.11 340)",
    "oklch(0.62 0.24 340)",
    "oklch(0.75 0.22 340)",
    "oklch(0.80 0.22 340)",
  ],
  yellow: [
    MUTED,
    "oklch(0.55 0.11 95)",
    "oklch(0.78 0.20 95)",
    "oklch(0.90 0.18 95)",
    "oklch(0.94 0.18 95)",
  ],
}

/* Medidas do calendário usadas pra dimensionar os blocos. */
const COLUNAS = 53 // semanas do ano
const MARGEM = 3 // espaço entre blocos
const LARGURA_ROTULOS = 34 // coluna dos dias da semana
const BLOCO_MIN = 11 // padrão da lib — piso, pra não encolher no mobile
const BLOCO_MAX = 20 // acima disso o gráfico vira mancha, não dado

export function GithubContributions({
  username = "Joaommsp",
}: {
  username?: string
}) {
  const { accent } = useThemeColor()
  const theme = ACCENT_RAMPS[accent]

  // O tamanho do bloco vem da largura real disponível: assim o calendário
  // preenche o card em vez de sobrar espaço à direita. No mobile o cálculo
  // cai no piso e o container continua rolando na horizontal.
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [blockSize, setBlockSize] = React.useState(BLOCO_MIN)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const medir = () => {
      const util = el.clientWidth - LARGURA_ROTULOS - COLUNAS * MARGEM
      const ideal = Math.floor(util / COLUNAS)
      setBlockSize(Math.max(BLOCO_MIN, Math.min(ideal, BLOCO_MAX)))
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Sentinela de medição: envolver o calendário faria ele se comprimir
          contra o wrapper (a lib usa max-width: 100%) em vez de rolar
          dentro do card no mobile. */}
      <div ref={containerRef} aria-hidden className="h-0 w-full" />
      <GitHubCalendar
      username={username}
      colorScheme="dark"
      theme={{ dark: theme }}
      blockSize={blockSize}
      blockMargin={MARGEM}
      blockRadius={2}
      fontSize={blockSize >= 15 ? 12 : 11}
      labels={{
        totalCount: "{{count}} contribuições em {{year}}",
        legend: {
          less: "Menos",
          more: "Mais",
        },
        months: [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez",
        ],
        weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        }}
      />
    </>
  )
}
