import * as React from "react"
import {
  Blocks,
  Code,
  Globe,
  Palette,
  Pipette,
  Puzzle,
  Terminal,
  Type,
  type LucideIcon,
} from "lucide-react"

import { TECH_ICONS } from "@/components/icons/tech-icons"

type Svg = React.SVGProps<SVGSVGElement>

/** Logo do Chrome em traço, no mesmo peso do lucide. */
function ChromeIcon(props: Svg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  )
}

type Icone = { Icone: React.ComponentType<Svg & { colored?: boolean }>; marca?: boolean }

/**
 * Ícone de uma ferramenta do /uses pelo nome: o logo da marca quando o
 * projeto tem, senão um ícone lucide do que a ferramenta faz.
 */
const REGRAS: readonly [RegExp, Icone][] = [
  [/chrome/i, { Icone: ChromeIcon }],
  [/react/i, { Icone: TECH_ICONS.React, marca: true }],
  [/figma/i, { Icone: TECH_ICONS.Figma, marca: true }],
  [/vs ?code|visual studio code/i, { Icone: TECH_ICONS["VS Code"], marca: true }],
  [/\bgit\b/i, { Icone: TECH_ICONS.Git, marca: true }],
  [/slack/i, { Icone: TECH_ICONS.Slack, marca: true }],
  [/linear/i, { Icone: TECH_ICONS.Linear, marca: true }],
  [/canva/i, { Icone: TECH_ICONS.Canva, marca: true }],
  [/color|cor|eyedropper/i, { Icone: Pipette as LucideIcon }],
  [/font|tipogra/i, { Icone: Type as LucideIcon }],
  [/terminal|shell|warp/i, { Icone: Terminal as LucideIcon }],
  [/design|paleta/i, { Icone: Palette as LucideIcon }],
  [/extens|plugin/i, { Icone: Puzzle as LucideIcon }],
  [/browser|navegador|firefox|arc|edge|safari/i, { Icone: Globe as LucideIcon }],
  [/editor|ide\b|code/i, { Icone: Code as LucideIcon }],
]

export function iconeDoUso(nome: string, descricao = ""): Icone {
  const texto = `${nome} ${descricao}`
  return REGRAS.find(([re]) => re.test(nome))?.[1] ?? REGRAS.find(([re]) => re.test(texto))?.[1] ?? { Icone: Blocks as LucideIcon }
}
