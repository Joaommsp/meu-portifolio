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

export function GithubContributions({
  username = "Joaommsp",
}: {
  username?: string
}) {
  const { accent } = useThemeColor()
  const theme = ACCENT_RAMPS[accent]

  return (
    <GitHubCalendar
      username={username}
      colorScheme="dark"
      theme={{ dark: theme }}
      blockSize={11}
      blockMargin={3}
      blockRadius={2}
      fontSize={11}
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
  )
}
