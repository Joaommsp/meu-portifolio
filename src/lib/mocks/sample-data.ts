import type { Post } from "@/types/post"
import type { Project } from "@/types/project"
import type { Game } from "@/types/game"

/**
 * Mocks pra Etapa 8 — substituídos por dados reais do Firestore
 * quando .env.local estiver preenchido (e os componentes plugarem
 * `listProjects`/`listPosts` em vez destes).
 */

export const sampleProjects: Project[] = [
  {
    id: "mock-gfi",
    slug: "gfi-sistema-gestao",
    title: "GFI — Sistema de Gestão",
    shortDescription:
      "Plataforma interna de gestão de pessoal e perícias com dashboards comparativos, multi-tenant e dark/light modes.",
    fullDescription: `## Contexto

A GFI é uma iniciativa interna da **Polícia Militar da Bahia** para digitalizar a gestão de pessoal, perícias e processos administrativos. Antes do projeto, fluxos críticos eram acompanhados em planilhas Excel — com problemas de sincronização, versionamento e auditabilidade.

## Meu papel

Atuei como **frontend developer**, responsável pela arquitetura da aplicação web, sistema de design interno e integração com o backend Django.

## Destaques técnicos

- **Multi-tenant** com isolamento por unidade administrativa
- **Dashboards comparativos** com gráficos interativos (Recharts)
- **Dark/light mode** completo com troca instantânea
- **Filtros assíncronos** com toast de "Aplicando filtros…" e spinner full-page no reset
- **Mobile-first** com sheets de filtro dedicados em telas < 1024px

## Stack
- Frontend: **React 18 + Vite + TypeScript + Tailwind**
- State: TanStack Query + Zustand
- UI: shadcn/ui customizado, Recharts, react-hook-form + Zod
- Backend (consumo): Django REST + DRF
- Deploy: Docker, homologação interna

## Aprendizados

Esse projeto consolidou muito da minha prática em **Design Systems** — montei uma biblioteca de componentes interna que vira o futuro template pra outros sistemas da PMPA.`,
    coverImage: "",
    gallery: [],
    technologies: ["React", "Vite", "TypeScript", "Tailwind", "Recharts"],
    category: "web",
    liveUrl: null,
    githubUrl: "https://github.com/GFI-PMPA",
    featured: true,
    status: "em-desenvolvimento",
    startDate: new Date("2024-08-01"),
    endDate: null,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date(),
  },
  {
    id: "mock-portfolio",
    slug: "portfolio-pessoal",
    title: "Portfolio Premium",
    shortDescription:
      "Este site. Dark-only com 8 cores trocáveis, 6 backgrounds composáveis, custom cursor com spring e animações reduce-motion-aware.",
    fullDescription: `## Visão

Construir um portfolio que **não parecesse template**. Cada decisão — cor, tipografia, motion — pensada do zero. Premissa: **dark-only premium**, com personalidade visual no nível Linear/Vercel/Brittany Chiang.

## Diferenciais

- **8 cores de destaque trocáveis** ao vivo via popover no header — usando \`@property\` para transição suave de 300ms entre OKLCH values
- **6 backgrounds composáveis** (Grid, DotPattern, GradientOrbs, BeamBackground, NoiseTexture, ParticlesBackground)
- **Custom Cursor** com 2 elementos (ring que segue com spring + dot que tracking exato), responsivo a hover/click states
- **Tilt 3D nos cards** de projeto via mouse-tracking com Motion springs
- **TextReveal** palavra-por-palavra ou letra-por-letra
- Tudo respeita \`prefers-reduced-motion\`

## Arquitetura

- **Next.js 16** App Router + TypeScript strict
- **Tailwind v4** com CSS-first config (\`@theme inline\`, OKLCH, \`@property\`)
- **shadcn/ui base-nova** preset (com \`@base-ui/react\`)
- **Firebase v12** modular SDK (Firestore + Auth + Storage)
- **Motion v12** (sucessor do framer-motion)
- **react-hook-form + Zod** pra todos os forms

## Status
Projeto vivo, evoluindo a cada etapa. Atualmente em produção privada — código será aberto quando concluído.`,
    coverImage: "",
    gallery: [],
    technologies: ["Next.js", "TypeScript", "Tailwind", "Firebase", "Figma"],
    category: "web",
    liveUrl: null,
    githubUrl: "https://github.com/Joaommsp",
    featured: true,
    status: "em-desenvolvimento",
    startDate: new Date("2026-04-28"),
    endDate: null,
    createdAt: new Date("2026-04-28"),
    updatedAt: new Date(),
  },
  {
    id: "mock-commits-semanticos",
    slug: "commits-semanticos",
    title: "Guia de Commits Semânticos",
    shortDescription:
      "Documentação completa sobre Conventional Commits com exemplos, ferramentas de implementação e melhores práticas.",
    fullDescription: `## O que é

Repositório com **guia prático de Conventional Commits** em português — desde a teoria até integração com hooks Git e ferramentas como commitizen e husky.

## Conteúdo

- Tipos de commit (\`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`test\`, \`chore\`)
- Estrutura: \`type(scope): subject\`
- Como configurar **commitlint + husky** num projeto novo
- Templates de mensagem
- Integração com **changelog automático** (standard-version, semantic-release)

## Por que escrevi

Em projetos com mais de uma pessoa, o histórico de commits vira documentação. Sem padrão, vira ruído. Esse guia consolida o que aprendi praticando isso por anos em projetos pessoais e profissionais.`,
    coverImage: "",
    gallery: [],
    technologies: ["Git"],
    category: "outro",
    liveUrl: null,
    githubUrl: "https://github.com/Joaommsp/commits-semanticos",
    featured: true,
    status: "concluido",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-15"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-15"),
  },
]

export const samplePosts: Post[] = [
  {
    id: "mock-post-1",
    slug: "construindo-portfolio-com-claude-code",
    title: "Construindo um portfolio premium com Claude Code",
    excerpt:
      "Como eu usei Claude Code pra construir esse site em 15 etapas controladas, com Next.js 16, Firebase e um sistema de cores trocável.",
    content: `## Por que comecei

Faz tempo que eu queria refazer meu portfolio. O antigo era... ok. Mas não dizia muito sobre quem eu sou. Quando o Claude Code virou \`claude-code\` (CLI) e ganhou agentes, planos e hooks, vi a oportunidade.

Decidi que ia construir o portfolio **em sessão única** com IA pareando comigo. Mas com regras:

- Nada de "gera tudo de uma vez"
- 15 etapas explícitas, uma de cada vez
- A cada etapa: build verde + visual review antes da próxima
- Decisões importantes ficam comigo

## Stack

- **Next.js 16** App Router (não 15 — \`@latest\` puxou)
- **TypeScript strict** com \`noUncheckedIndexedAccess\`
- **Tailwind v4** com \`@theme inline\` e OKLCH default
- **shadcn/ui** com novo preset \`base-nova\` (Base UI, não mais Radix)
- **Firebase v12** modular SDK
- **Motion v12** (sucessor do framer-motion)

## A coisa mais legal

Sistema de cores **trocáveis ao vivo**. 8 cores. Persistência localStorage. Sem flash.

Truque: registrei \`@property\` pras CSS vars de brand, daí transição de 300ms entre OKLCH values funciona nativamente:

\`\`\`css
@property --brand {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(0.78 0.22 145);
}

html[data-loaded="true"] {
  transition: --brand 300ms ease;
}
\`\`\`

E o \`data-loaded\` só vira true depois do primeiro paint, evitando flash quando o inline-script aplica o accent salvo.

## Aprendizados

> A IA é boa em acelerar o que já é boa engenharia. Não substitui pensar antes.

Cada etapa tinha um plano claro escrito por mim. O Claude executa rápido, mas as decisões (Next 16 ou 15? Mantém ou migra? Behance ou só Figma?) sempre voltavam pra mim.

O resultado é um site que parece custom, não template. E que eu entendo cada linha — porque eu autorizei cada linha.`,
    coverImage: "",
    category: "tutorial",
    tags: ["Next.js", "Claude Code", "Firebase"],
    published: true,
    featured: true,
    readingTime: 8,
    views: 0,
    createdAt: new Date("2026-04-28"),
    updatedAt: new Date("2026-04-28"),
    publishedAt: new Date("2026-04-28"),
  },
  {
    id: "mock-post-2",
    slug: "tailwind-v4-em-producao",
    title: "Tailwind v4 em produção: o que mudou",
    excerpt:
      "Migrei um projeto grande pra Tailwind v4 e a experiência foi melhor do que esperava. CSS-first config, @theme inline e OKLCH default.",
    content: `## TL;DR

Tailwind v4 é uma reescrita. Mais rápido (10x build), mais simples (sem \`tailwind.config.ts\`), mais moderno (OKLCH e \`@property\` nativos). Migração tomou 1 dia num projeto médio. Vale.

## O que mudou

### 1. Config no CSS

Acabou \`tailwind.config.ts\`. Tudo agora é \`@theme inline\` no \`globals.css\`:

\`\`\`css
@theme inline {
  --color-brand: oklch(0.78 0.22 145);
  --font-sans: var(--font-geist-sans);
  --radius-lg: 0.75rem;
}
\`\`\`

Daí \`bg-brand\`, \`font-sans\`, \`rounded-lg\` viram utilities automaticamente.

### 2. OKLCH como default

Toda cor padrão agora é OKLCH, não hex/HSL. Cores ficam mais consistentes em diferentes lightness.

### 3. \`@plugin\` no CSS

Plugins entram via diretiva CSS, não JS:

\`\`\`css
@plugin "@tailwindcss/typography";
@plugin "tailwindcss-animate";
\`\`\`

### 4. Build via Lightning CSS

PostCSS continua suportado, mas o engine novo é Lightning CSS (Rust). Build cold ficou 10x mais rápido no meu projeto.

## Migração: 4 passos

1. Roda \`npx @tailwindcss/upgrade\`
2. Move \`tailwind.config.ts\` → \`@theme\` no CSS
3. Atualiza imports de \`@tailwind base/components/utilities\` → \`@import "tailwindcss"\`
4. Testa em prod

## Pegadinhas

- **Plugins do shadcn**: alguns ainda não tinham migrado. Tive que esperar release.
- **Custom variants** mudaram sintaxe (\`@custom-variant dark (&:is(.dark *))\`)
- **CSS vars** que você quer animar precisam de \`@property\` (não é exclusividade Tailwind, mas vale lembrar)

## Vale migrar?

Se o projeto é novo, sim. Se é legado com muita config, espera os plugins atualizarem.`,
    coverImage: "",
    category: "review",
    tags: ["Tailwind", "CSS"],
    published: true,
    featured: true,
    readingTime: 6,
    views: 0,
    createdAt: new Date("2026-04-15"),
    updatedAt: new Date("2026-04-15"),
    publishedAt: new Date("2026-04-15"),
  },
  {
    id: "mock-post-3",
    slug: "ux-cor-de-destaque-trocavel",
    title: "Por que todo dashboard deveria ter cor de destaque trocável",
    excerpt:
      "Diferentes contextos pedem diferentes cores. Um sistema de design com 8 accents trocáveis dá voz ao usuário sem comprometer consistência.",
    content: `## A história

Trabalhando em produtos B2B, vi um padrão repetir: usuários **personalizam** o que podem. Tema dark, densidade da tabela, sidebar colapsada. Cor? Quase nunca tem opção.

Por que não?

## O argumento contra

> "Branding tem que ser consistente."

Faz sentido pra marketing-site. Não pra ferramenta de trabalho que a pessoa abre 8h/dia.

## O argumento a favor

1. **Acessibilidade**: deuteranopia (4-5% dos homens) tem dificuldade com vermelho/verde. Dar opção ajuda.
2. **Contexto múltiplo**: gestor de A/B test que precisa diferenciar do gestor financeiro
3. **Identidade**: usuários se apropriam mais de ferramentas customizáveis
4. **Custo zero**: se você usa CSS variables, custa um Context API + localStorage

## Como implementar

Reduz tudo a 5 vars:

\`\`\`css
[data-accent="green"] {
  --brand: oklch(0.78 0.22 145);
  --brand-hover: oklch(0.83 0.22 145);
  --brand-glow: oklch(0.65 0.24 145);
  --brand-muted: oklch(0.42 0.10 145);
  --brand-foreground: oklch(0.13 0.012 260);
}
\`\`\`

Daí teus componentes usam \`var(--brand)\` em vez de \`#22c55e\`. Quando o usuário troca o data-attribute, tudo se ajusta.

## Cuidados

- **Nem toda cor combina com tudo**. Testa antes de oferecer.
- **Persiste a escolha** (localStorage)
- **Aplica antes do paint** (inline script no head) pra evitar flash
- **Define fallback** (verde se atributo inexistente)

## Resultado

Esse próprio site faz isso. Clica no ícone de paleta no header. 8 cores. Persistência. 300ms de transição suave.

Custo total: ~80 linhas de CSS + 50 de TS.`,
    coverImage: "",
    category: "pensamento",
    tags: ["UX", "Design Systems"],
    published: true,
    featured: false,
    readingTime: 5,
    views: 0,
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-10"),
    publishedAt: new Date("2026-04-10"),
  },
]

/** Sem mocks pra games — usa apenas dados reais do Firestore. */
export const sampleGames: Game[] = []
