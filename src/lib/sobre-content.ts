/**
 * Conteúdo fixo da página /sobre: trajetória, a faixa que passa e os passos
 * de "Como eu trabalho". O que muda com frequência (lendo, ouvindo,
 * estudando) vem do admin, em `lib/data/currently`.
 */

import { DEGREE } from "@/lib/education-content"

export type ItemTrajetoria = {
  periodo: string
  titulo: string
  org: string
  /** O item em andamento ganha o ponto cheio na linha do tempo. */
  atual?: boolean
}

export const TRAJETORIA: readonly ItemTrajetoria[] = [
  {
    periodo: "2025 a hoje",
    titulo: "Frontend & UI/UX Designer",
    org: "GFI · Consultoria Especializada",
    atual: true,
  },
  { periodo: "2024 a 2025", titulo: "Estagiário em TI", org: "Laboratório Estrela" },
  { periodo: "2023 a 2025", titulo: "Design Gráfico", org: "Egrafil · Gráfica Independência" },
  {
    periodo: `2021 a ${DEGREE.issued}`,
    titulo: DEGREE.curso,
    // só a sigla da instituição: o nome completo fica no card da Formação
    org: DEGREE.institution.split(" · ").at(-1) ?? DEGREE.institution,
  },
]

/** O que eu faço e com o quê, na faixa que passa abaixo do manifesto. */
export const FAIXA_ITENS: readonly string[] = [
  "Interfaces",
  "Dashboards",
  "Data storytelling",
  "Design system",
  "Protótipos no Figma",
  "React",
  "Next.js",
  "TypeScript",
  "React Native",
  "Sites e landing pages",
  "Sistemas de gestão",
  "Apps Android e iOS",
  "UX research",
]

export type PassoTrabalho = {
  nome: string
  destaque: string
  texto: string
}

export const COMO_TRABALHO: readonly PassoTrabalho[] = [
  {
    nome: "Entender",
    destaque: "Converso com quem vai usar, não só com quem contrata.",
    texto:
      "Antes da tela, o problema: quem usa, quando e o que falha hoje. Saio dessa etapa com o escopo escrito.",
  },
  {
    nome: "Prototipar",
    destaque: "Protótipo navegável antes da primeira linha de código.",
    texto:
      "Fluxo e telas principais no Figma, clicáveis no celular e no desktop. Só sigo com o seu aval.",
  },
  {
    nome: "Construir",
    destaque: "Entrega por partes, com preview a cada mudança.",
    texto: "React, Next.js e TypeScript sobre um design system, revisado módulo a módulo.",
  },
  {
    nome: "Acompanhar",
    destaque: "Lançamento acompanhado, não abandonado.",
    texto:
      "Acompanho o uso real, corrijo o que aparecer e ajusto pelo que os números mostram.",
  },
]

/** Base: Paulo Afonso, BA, às margens do São Francisco. */
export const BASE = {
  cidade: "Paulo Afonso",
  detalhe: "Bahia · 9°24′ S · 38°13′ O · Rio São Francisco",
} as const
