/**
 * Conteúdo da seção "Minhas experiências com algumas tecnologias" (/sobre).
 *
 * Registro profissional: cada texto diz o que é feito, com qual ferramenta e
 * em qual contexto. Sem opinião sobre a ferramenta.
 *
 * `icon` é opcional — quem não tem logo próprio (NestJS, UI/UX, MySQL…) ganha
 * um selo com as iniciais, em vez de uma carta sem símbolo.
 */

import type { TechName } from "@/components/icons/tech-icons"

export type Level = "Avançado" | "Intermediário" | "Aprendendo"

export type Skill = {
  name: string
  /** Quando existe, usa o SVG oficial da marca. */
  icon?: TechName
  /** Cor de destaque de quem não tem ícone próprio. */
  color?: string
  level: Level
  text: string
  /** Contexto de uso — dado verificável, exibido no rodapé da carta. */
  context: string
}

export type SkillGroup = {
  label: string
  skills: readonly Skill[]
}

/** Quantas barras acender no indicador de nível. */
export const LEVEL_BARS: Record<Level, number> = {
  Avançado: 3,
  Intermediário: 2,
  Aprendendo: 1,
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    label: "Frontend",
    skills: [
      {
        name: "React",
        icon: "React",
        level: "Avançado",
        text: "Principal ferramenta do meu trabalho. Construo as interfaces do produto de gestão financeira da empresa: dashboards, tabelas com grande volume de dados e formulários complexos.",
        context: "Uso diário · produto principal",
      },
      {
        name: "React Native",
        icon: "React Native",
        level: "Intermediário",
        text: "Versões mobile dos sistemas de gestão, reaproveitando a arquitetura de componentes já usada no React.",
        context: "Projeto atual",
      },
      {
        name: "Next.js",
        icon: "Next.js",
        level: "Avançado",
        text: "Framework padrão dos meus projetos web. Trabalho com App Router, renderização no servidor e otimização de SEO.",
        context: "Projetos web",
      },
      {
        name: "TypeScript",
        icon: "TypeScript",
        level: "Avançado",
        text: "Tipagem estática em todos os projetos. Reduz erro em tempo de execução e sustenta a manutenção em bases maiores.",
        context: "Todo projeto",
      },
      {
        name: "JavaScript",
        icon: "JavaScript",
        level: "Avançado",
        text: "Base de toda a stack — domínio dos fundamentos sobre os quais os frameworks acima funcionam.",
        context: "Base",
      },
      {
        name: "Tailwind",
        icon: "Tailwind",
        level: "Avançado",
        text: "Estilização com design tokens e tema centralizado, mantendo consistência visual entre telas.",
        context: "Todo projeto",
      },
      {
        name: "HTML5",
        icon: "HTML5",
        level: "Avançado",
        text: "Marcação semântica, acessibilidade e estrutura interpretável por mecanismos de busca.",
        context: "Base",
      },
      {
        name: "CSS3",
        icon: "CSS3",
        level: "Avançado",
        text: "Layout, animação e temas sem dependência externa quando o projeto não justifica uma.",
        context: "Base",
      },
      {
        name: "Vite",
        icon: "Vite",
        level: "Intermediário",
        text: "Build e ambiente de desenvolvimento nos projetos que não usam Next.",
        context: "Projetos menores",
      },
    ],
  },
  {
    label: "Backend",
    skills: [
      {
        name: "Node.js",
        icon: "Node.js",
        level: "Intermediário",
        text: "APIs REST nos projetos que desenvolvo de ponta a ponta: rotas, regras de negócio e integração com o banco.",
        context: "Projetos próprios",
      },
      {
        name: "NestJS",
        color: "#E0234E",
        level: "Intermediário",
        text: "Estrutura para APIs que precisam escalar: módulos, injeção de dependência e separação em camadas.",
        context: "Projetos próprios",
      },
      {
        name: "Firebase",
        icon: "Firebase",
        level: "Intermediário",
        text: "Autenticação e banco em tempo real. É a base do CMS deste portfólio.",
        context: "Este site",
      },
      {
        name: "MySQL",
        color: "#4479A1",
        level: "Intermediário",
        text: "Modelagem relacional e consultas para os sistemas que desenvolvo.",
        context: "Projetos próprios",
      },
    ],
  },
  {
    label: "Design",
    skills: [
      {
        name: "Figma",
        icon: "Figma",
        level: "Avançado",
        text: "Prototipação e definição da interface antes da implementação, trabalhando com componentes e design system.",
        context: "Antes de todo projeto",
      },
      {
        name: "UI/UX",
        color: "#A78BFA",
        level: "Avançado",
        text: "Metade da minha atuação no produto principal: definição de fluxos, hierarquia de informação e usabilidade.",
        context: "Produto principal",
      },
      {
        name: "Data storytelling",
        color: "#38BDF8",
        level: "Avançado",
        text: "Tradução de dados em decisão: KPIs, dashboards e relatórios voltados à análise de processos.",
        context: "Produto principal",
      },
      {
        name: "Design Systems",
        color: "#F472B6",
        level: "Intermediário",
        text: "Construção e manutenção de bibliotecas de componentes com tokens, variantes e documentação de uso.",
        context: "Produto principal",
      },
    ],
  },
  {
    label: "Ferramentas",
    skills: [
      {
        name: "Git",
        icon: "Git",
        level: "Intermediário",
        text: "Versionamento com branch por demanda e histórico organizado para revisão.",
        context: "Uso diário",
      },
      {
        name: "GitHub",
        color: "#E6EDE6",
        level: "Intermediário",
        text: "Repositórios, pull requests e revisão de código nos projetos em que trabalho.",
        context: "Uso diário",
      },
      {
        name: "Vercel",
        color: "#E6EDE6",
        level: "Intermediário",
        text: "Deploy e ambientes de preview dos projetos web.",
        context: "Deploy",
      },
    ],
  },
  {
    label: "Aplicativos",
    skills: [
      {
        name: "VS Code",
        icon: "VS Code",
        level: "Avançado",
        text: "Ambiente principal de desenvolvimento, com depuração, extensões de lint e formatação configuradas por projeto.",
        context: "Uso diário",
      },
      {
        name: "macOS",
        icon: "macOS",
        level: "Avançado",
        text: "Sistema preferido para desenvolvimento mobile: build e teste em iOS exigem Xcode, e o simulador roda aqui.",
        context: "Desenvolvimento mobile",
      },
      {
        name: "Windows",
        icon: "Windows",
        level: "Avançado",
        text: "Máquina do dia a dia para os projetos web, com WSL no ambiente de desenvolvimento.",
        context: "Máquina principal",
      },
      {
        name: "Canva",
        icon: "Canva",
        level: "Avançado",
        text: "Peças gráficas e materiais de apresentação quando a entrega não pede um arquivo de design system.",
        context: "Apoio ao design",
      },
      {
        name: "Linear",
        icon: "Linear",
        level: "Intermediário",
        text: "Organização das demandas: issues, ciclos e acompanhamento do que está em andamento.",
        context: "Organização",
      },
      {
        name: "Slack",
        icon: "Slack",
        level: "Intermediário",
        text: "Comunicação com o time e acompanhamento das decisões que afetam o produto.",
        context: "Uso diário",
      },
      {
        name: "MySQL Workbench",
        icon: "MySQL",
        level: "Intermediário",
        text: "Modelagem, consultas e administração dos bancos relacionais dos meus projetos.",
        context: "Projetos próprios",
      },
      {
        name: "PostgreSQL",
        icon: "PostgreSQL",
        level: "Intermediário",
        text: "Banco relacional dos projetos que exigem consultas mais pesadas e tipos avançados.",
        context: "Projetos próprios",
      },
    ],
  },
] as const
