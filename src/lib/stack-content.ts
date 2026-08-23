/**
 * Ordem das tecnologias na seção "Stack" da home.
 *
 * A carta mostra só o símbolo e o nome — o ícone já diz o que é, e o
 * visitante não precisa ler nada pra entender a seção.
 */

import type { TechName } from "@/components/icons/tech-icons"

export const STACK: readonly TechName[] = [
  "React",
  "React Native",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Node.js",
  "Firebase",
  "Figma",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Vite",
  "Git",
] as const

export const STACK_COUNT = STACK.length
