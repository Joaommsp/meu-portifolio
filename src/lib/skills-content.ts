/**
 * Conteúdo da seção "Stack" (/sobre).
 *
 * Cada ferramenta vira um chip, agrupado por área.
 *
 * `icon` é opcional: quem não tem logo próprio (NestJS, UI/UX, MySQL…) ganha
 * um selo com as iniciais, em vez de uma carta sem símbolo.
 */

import type { TechName } from "@/components/icons/tech-icons"

export type Skill = {
  name: string
  /** Quando existe, usa o SVG oficial da marca. */
  icon?: TechName
  /** Cor de destaque de quem não tem ícone próprio. */
  color?: string
}

export type SkillGroup = {
  label: string
  skills: readonly Skill[]
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    label: "Frontend",
    skills: [
      {
        name: "React",
        icon: "React",
      },
      {
        name: "React Native",
        icon: "React Native",
      },
      {
        name: "Next.js",
        icon: "Next.js",
      },
      {
        name: "TypeScript",
        icon: "TypeScript",
      },
      {
        name: "JavaScript",
        icon: "JavaScript",
      },
      {
        name: "Tailwind",
        icon: "Tailwind",
      },
      {
        name: "HTML5",
        icon: "HTML5",
      },
      {
        name: "CSS3",
        icon: "CSS3",
      },
      {
        name: "Vite",
        icon: "Vite",
      },
    ],
  },
  {
    label: "Backend",
    skills: [
      {
        name: "Node.js",
        icon: "Node.js",
      },
      {
        name: "NestJS",
        color: "#E0234E",
      },
      {
        name: "Firebase",
        icon: "Firebase",
      },
      {
        name: "MySQL",
        color: "#4479A1",
      },
    ],
  },
  {
    label: "Design",
    skills: [
      {
        name: "Figma",
        icon: "Figma",
      },
      {
        name: "UI/UX",
        color: "#A78BFA",
      },
      {
        name: "Data storytelling",
        color: "#38BDF8",
      },
      {
        name: "Design Systems",
        color: "#F472B6",
      },
    ],
  },
  {
    label: "Ferramentas",
    skills: [
      {
        name: "Git",
        icon: "Git",
      },
      {
        name: "GitHub",
        color: "#E6EDE6",
      },
      {
        name: "Vercel",
        color: "#E6EDE6",
      },
    ],
  },
  {
    label: "Aplicativos",
    skills: [
      {
        name: "VS Code",
        icon: "VS Code",
      },
      {
        name: "macOS",
        icon: "macOS",
      },
      {
        name: "Windows",
        icon: "Windows",
      },
      {
        name: "Canva",
        icon: "Canva",
      },
      {
        name: "Linear",
        icon: "Linear",
      },
      {
        name: "Slack",
        icon: "Slack",
      },
      {
        name: "MySQL Workbench",
        icon: "MySQL",
      },
      {
        name: "PostgreSQL",
        icon: "PostgreSQL",
      },
    ],
  },
] as const
