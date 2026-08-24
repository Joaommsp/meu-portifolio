import * as React from "react"
import {
  House,
  User,
  Clock,
  Monitor,
  Briefcase,
  FileText,
  Gamepad2,
  BookMarked,
  BarChart3,
  Mail,
  MessageSquare,
} from "lucide-react"

import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FigmaIcon,
  BehanceIcon,
} from "@/components/icons/brand-icons"

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

export type NavItem = {
  href: string
  label: string
}

/** Destino dentro de um grupo: ganha ícone e uma linha de contexto no popover. */
export type NavLink = NavItem & {
  description: string
  icon: IconComponent
}

/**
 * Entrada do menu principal: ou vai direto, ou abre um popover com destinos.
 */
export type NavEntry =
  | { kind: "link"; href: string; label: string }
  | { kind: "group"; label: string; items: readonly NavLink[] }

/**
 * A retrospectiva vive em `/recap/[year]` — não há índice. Calculado na carga
 * do módulo: no cliente isso é o ano de quem está visitando, que é o certo.
 */
const ANO_ATUAL = new Date().getFullYear()

/**
 * Fonte única da navegação.
 *
 * Eram 9 links soltos numa linha; com GitHub, Behance e Figma seriam 12 e a
 * barra não fecha mais. Agrupados em 3 popovers + 2 links diretos: cinco alvos
 * cobrindo catorze destinos, e `/uses` e `/recap` — que existiam sem entrada no
 * menu — finalmente aparecem.
 */
export const NAV_GROUPS: readonly NavEntry[] = [
  { kind: "link", href: "/", label: "Início" },
  {
    kind: "group",
    label: "Sobre",
    items: [
      {
        href: "/sobre",
        label: "Sobre mim",
        description: "Trajetória, formação e stack",
        icon: User,
      },
      {
        href: "/now",
        label: "Agora",
        description: "O que ando lendo, ouvindo e jogando",
        icon: Clock,
      },
      {
        href: "/uses",
        label: "Uses",
        description: "Setup, hardware e ferramentas",
        icon: Monitor,
      },
    ],
  },
  {
    kind: "group",
    label: "Trabalho",
    items: [
      {
        href: "/projetos",
        label: "Projetos",
        description: "Estudos de caso escritos por mim",
        icon: Briefcase,
      },
      {
        href: "/github",
        label: "GitHub",
        description: "Perfil, README e repositórios",
        icon: GithubIcon,
      },
      {
        href: "/behance",
        label: "Behance",
        description: "Projetos de UI e social media",
        icon: BehanceIcon,
      },
      {
        href: "/figma",
        label: "Figma",
        description: "Arquivos públicos da Community",
        icon: FigmaIcon,
      },
    ],
  },
  {
    kind: "group",
    label: "Diário",
    items: [
      {
        href: "/blog",
        label: "Blog",
        description: "Textos sobre frontend e design",
        icon: FileText,
      },
      {
        href: "/games",
        label: "Games",
        description: "O que joguei, com nota e review",
        icon: Gamepad2,
      },
      {
        href: "/livros",
        label: "Livros",
        description: "Leituras e o que ficou de cada uma",
        icon: BookMarked,
      },
      {
        href: `/recap/${ANO_ATUAL}`,
        label: "Retrospectiva",
        description: "O ano em números",
        icon: BarChart3,
      },
    ],
  },
  {
    kind: "group",
    label: "Contato",
    items: [
      {
        href: "/contato",
        label: "Falar comigo",
        description: "Proposta, dúvida ou só um oi",
        icon: Mail,
      },
      {
        href: "/guestbook",
        label: "Guestbook",
        description: "Deixe um recado no mural",
        icon: MessageSquare,
      },
    ],
  },
] as const

/** Ícone de cada entrada de topo — usado no menu mobile. */
export const NAV_GROUP_ICONS: Record<string, IconComponent> = {
  Início: House,
  Sobre: User,
  Trabalho: Briefcase,
  Diário: FileText,
  Contato: Mail,
}

/**
 * Todos os destinos, achatados. Rodapé e qualquer lista linear consomem daqui
 * em vez de repetir os links à mão.
 */
export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((entrada) =>
  entrada.kind === "link"
    ? [{ href: entrada.href, label: entrada.label }]
    : entrada.items.map(({ href, label }) => ({ href, label }))
)

export type SocialLink = {
  href: string
  label: string
  icon: IconComponent
  handle: string
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    href: "https://github.com/Joaommsp",
    label: "GitHub",
    icon: GithubIcon,
    handle: "@Joaommsp",
  },
  {
    href: "https://www.linkedin.com/in/joaomarcos10oficial/",
    label: "LinkedIn",
    icon: LinkedinIcon,
    handle: "joaomarcos10oficial",
  },
  {
    href: "https://instagram.com/joao.mmsp",
    label: "Instagram",
    icon: InstagramIcon,
    handle: "@joao.mmsp",
  },
  {
    href: "https://figma.com/@joaomarcos19",
    label: "Figma",
    icon: FigmaIcon,
    handle: "@joaomarcos19",
  },
  {
    href: "https://behance.net/joaomarcos10oficial",
    label: "Behance",
    icon: BehanceIcon,
    handle: "joaomarcos10oficial",
  },
] as const

export const CONTACT_EMAIL = "jmmsp2003@hotmail.com"
