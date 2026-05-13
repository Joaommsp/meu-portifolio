import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
} from "@/components/backgrounds"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Hardware, software e ferramentas que João Marcos usa no dia-a-dia pra construir produtos digitais.",
}

type Item = {
  name: string
  description: string
  url: string
  /** Marca como item favorito (badge brand). */
  starred?: boolean
}

type Category = {
  title: string
  description: string
  items: Item[]
}

const CATEGORIES: Category[] = [
  {
    title: "Hardware",
    description: "O que tem em cima da mesa enquanto codo.",
    items: [
      {
        name: "Notebook (placeholder)",
        description:
          "Substitua pelo seu modelo — ex: Acer Nitro 5, MacBook Pro M2, Lenovo IdeaPad.",
        url: "#",
        starred: true,
      },
      {
        name: "Monitor externo",
        description:
          "Segundo display 1080p ou 4K — pra Figma de um lado, código do outro.",
        url: "#",
      },
      {
        name: "Teclado mecânico",
        description:
          "Switch de sua preferência — Cherry MX Brown, Gateron Yellow, etc.",
        url: "#",
      },
      {
        name: "Mouse",
        description: "Mouse com fio ou sem — Logitech, Razer, ou similar.",
        url: "#",
      },
      {
        name: "Headphone",
        description:
          "Pra calls + concentração. Substitua pelo seu — JBL, Edifier, Sony, etc.",
        url: "#",
      },
    ],
  },
  {
    title: "Editor & Dev Tools",
    description: "Onde o código nasce.",
    items: [
      {
        name: "VS Code",
        description:
          "Editor principal. Tema escuro com cor de destaque que combina com o que tô codando.",
        url: "https://code.visualstudio.com",
        starred: true,
      },
      {
        name: "IntelliJ IDEA",
        description: "Pra projetos Java/Kotlin da faculdade.",
        url: "https://www.jetbrains.com/idea/",
      },
      {
        name: "Git",
        description: "Versionamento padrão. Conventional commits sempre.",
        url: "https://git-scm.com",
      },
      {
        name: "GitHub",
        description: "Repositórios + colaboração + portfolio público.",
        url: "https://github.com",
      },
      {
        name: "Vercel",
        description: "Deploy preferido pra projetos Next.js.",
        url: "https://vercel.com",
      },
      {
        name: "Node.js",
        description: "Runtime de tudo — npm, scripts, build tools.",
        url: "https://nodejs.org",
      },
    ],
  },
  {
    title: "Design",
    description: "Pra desenhar antes de codar.",
    items: [
      {
        name: "Figma",
        description:
          "Onde 100% das telas começam. Plugin Auto Layout salva minha vida.",
        url: "https://figma.com",
        starred: true,
      },
      {
        name: "Adobe Photoshop",
        description:
          "Edição de imagens pontuais — quando Figma não dá conta de raster.",
        url: "https://www.adobe.com/products/photoshop.html",
      },
      {
        name: "Coolors",
        description: "Pra gerar paletas rápidas.",
        url: "https://coolors.co",
      },
    ],
  },
  {
    title: "Apps no dia-a-dia",
    description: "O que abre junto com o computador.",
    items: [
      {
        name: "Notion",
        description:
          "Notas, planejamento, second brain. Substitui Evernote e parte do Trello.",
        url: "https://notion.so",
      },
      {
        name: "Discord",
        description: "Comunicação com colegas + comunidades de dev.",
        url: "https://discord.com",
      },
      {
        name: "WhatsApp Web",
        description: "Inevitável no Brasil. Sempre aberto numa aba.",
        url: "https://web.whatsapp.com",
      },
      {
        name: "Spotify",
        description:
          "Trilha sonora pra codar — lo-fi, eletrônica, e às vezes silêncio.",
        url: "https://spotify.com",
      },
    ],
  },
  {
    title: "Browser & Extensões",
    description: "Tab manager / dev tools.",
    items: [
      {
        name: "Google Chrome",
        description:
          "DevTools é insubstituível. Mesmo que use outros browsers pra testar.",
        url: "https://www.google.com/chrome",
      },
      {
        name: "React DevTools",
        description: "Pra inspecionar tree, props, state, profiler.",
        url: "https://react.dev/learn/react-developer-tools",
      },
      {
        name: "ColorZilla",
        description: "Eyedropper + gradient generator no browser.",
        url: "https://www.colorzilla.com",
      },
      {
        name: "WhatFont",
        description: "Detecta a fonte de qualquer site com um hover.",
        url: "https://chromewebstore.google.com/detail/whatfont/jabopobgcpjmedljpbcaablpmlmfcogm",
      },
    ],
  },
  {
    title: "CLI & Utilitários",
    description: "Linha de comando + ferramentas auxiliares.",
    items: [
      {
        name: "Git Bash / PowerShell",
        description: "Terminal do Windows pra dev.",
        url: "https://git-scm.com/downloads",
      },
      {
        name: "ChatGPT / Claude",
        description:
          "Pra brainstorm, explicar erros estranhos e revisar código.",
        url: "https://claude.ai",
      },
      {
        name: "Excalidraw",
        description: "Desenho rápido de diagramas + arquitetura.",
        url: "https://excalidraw.com",
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 380,
              x: "10%",
              y: "20%",
              color: "var(--brand)",
              duration: 18,
              delay: 0,
              opacity: 0.25,
            },
            {
              size: 320,
              x: "75%",
              y: "60%",
              color: "var(--brand-glow)",
              duration: 22,
              delay: 2,
              opacity: 0.2,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-4xl px-6 py-24 md:py-32">
          <FadeIn>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Uses
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Hardware, software e{" "}
              <span className="text-gradient-brand">trampo diário</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Lista das ferramentas que uso no dia-a-dia pra construir
              produtos digitais. Atualizada quando algo muda. Inspirado por{" "}
              <a
                href="https://uses.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand transition-opacity hover:underline hover:opacity-80"
              >
                uses.tech
              </a>
              .
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-5xl space-y-16 px-6 py-16">
        {CATEGORIES.map((cat, idx) => (
          <ScrollReveal key={cat.title} delay={idx * 0.05}>
            <div>
              <header className="mb-8">
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {cat.title}
                </h2>
                <p className="mt-2 text-muted-foreground">{cat.description}</p>
              </header>

              <ul className="grid gap-3 md:grid-cols-2">
                {cat.items.map((item) => (
                  <li key={item.name}>
                    <ItemCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* Footer note */}
      <section className="container mx-auto max-w-4xl px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              💡 Sentindo falta de algo?
            </p>
            <p className="mt-2">
              Manda no{" "}
              <a
                href="/contato"
                className="text-brand underline-offset-2 hover:underline"
              >
                contato
              </a>
              . Sempre interessado em ferramentas que outras pessoas amam.
              Esta página é editada manualmente — atualizo quando troco algo
              no setup.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}

/* ─────────────────────────────────────────────────────────── */

function ItemCard({ item }: { item: Item }) {
  const isPlaceholder = item.url === "#"
  return (
    <a
      href={item.url}
      target={isPlaceholder ? undefined : "_blank"}
      rel={isPlaceholder ? undefined : "noopener noreferrer"}
      className={cn(
        "group flex h-full cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
        item.starred
          ? "border-brand/40 hover:border-brand"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold tracking-tight transition-colors group-hover:text-brand">
            {item.name}
          </h3>
          {item.starred && (
            <Badge
              variant="outline"
              className="h-4 border-brand/40 bg-brand/10 px-1.5 font-mono text-[0.6rem] uppercase text-brand"
            >
              fav
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>
      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  )
}
