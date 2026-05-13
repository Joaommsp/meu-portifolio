import Link from "next/link"
import { ArrowLeft, Home, Search, FolderGit2, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider"
import { NotFoundActions } from "@/components/sections/NotFoundActions"

export default function NotFound() {
  return (
    <CommandPaletteProvider>
      <Header />
      <main className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 540,
              x: "20%",
              y: "30%",
              color: "var(--brand)",
              duration: 24,
              delay: 0,
              opacity: 0.3,
            },
            {
              size: 420,
              x: "75%",
              y: "70%",
              color: "var(--brand-glow)",
              duration: 28,
              delay: 2,
              opacity: 0.25,
            },
          ]}
        />
        <NoiseTexture opacity={0.05} />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Tag */}
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
            ERRO 404
          </span>

          {/* "404" gigante com tratamento split */}
          <h1
            className="mt-6 font-display text-[clamp(8rem,22vw,16rem)] font-bold leading-none tracking-tighter"
            aria-label="404"
          >
            <span className="text-foreground">4</span>
            <span className="text-brand drop-shadow-[0_0_24px_var(--brand-glow)]">
              0
            </span>
            <span className="text-foreground">4</span>
          </h1>

          {/* Glitch line */}
          <div className="mt-2 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            <span className="h-px w-8 bg-brand" />
            <span>signal lost</span>
            <span className="h-px w-8 bg-brand" />
          </div>

          {/* Mensagem */}
          <h2 className="mt-8 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Esta página se perdeu no caminho.
          </h2>
          <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
            O link pode estar quebrado, o conteúdo foi movido, ou você apenas
            digitou errado. Acontece com os melhores.
          </p>

          {/* CTAs principais */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/" />}>
              <Home className="size-4" data-icon="inline-start" />
              Voltar pro início
            </Button>
            <NotFoundActions />
          </div>

          {/* Atalhos */}
          <div className="mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                href: "/projetos",
                icon: FolderGit2,
                label: "Projetos",
                desc: "O que já construí",
              },
              {
                href: "/blog",
                icon: BookOpen,
                label: "Blog",
                desc: "Pensamentos & tutoriais",
              },
              {
                href: "/contato",
                icon: ArrowLeft,
                label: "Contato",
                desc: "Vamos conversar",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-card/40 p-4 text-left backdrop-blur-sm transition-colors hover:border-brand/50 hover:bg-card/60"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform group-hover:-translate-y-0.5">
                  <card.icon className="size-4" />
                </span>
                <span className="font-display text-sm font-semibold">
                  {card.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {card.desc}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer hint */}
          <p className="mt-12 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            <kbd className="mr-1 rounded border border-border/60 bg-muted/30 px-1.5 py-0.5">
              Ctrl
            </kbd>
            <kbd className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5">
              K
            </kbd>{" "}
            <span className="ml-2">pra buscar tudo</span>
          </p>
        </div>
      </main>
      <Footer />
    </CommandPaletteProvider>
  )
}
