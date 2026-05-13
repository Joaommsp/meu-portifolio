import * as React from "react"
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FigmaIcon,
  BehanceIcon,
} from "@/components/icons/brand-icons"

export type NavItem = {
  href: string
  label: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/projetos", label: "Projetos" },
  { href: "/blog", label: "Blog" },
  { href: "/games", label: "Games" },
  { href: "/contato", label: "Contato" },
] as const

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

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

export const CONTACT_EMAIL = "joao22melo_2023@outlook.com"
