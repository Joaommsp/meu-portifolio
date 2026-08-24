import type { Metadata } from "next"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { BehanceIcon } from "@/components/icons/brand-icons"
import {
  fetchBehanceProjects,
  BEHANCE_PROFILE_URL,
  BEHANCE_HANDLE,
  type BehanceProject,
} from "@/lib/behance"

export const metadata: Metadata = {
  title: "Behance",
  description:
    "Projetos de UX/UI e social media de João Marcos publicados no Behance.",
}

function Cartao({ projeto }: { projeto: BehanceProject }) {
  return (
    <a
      href={projeto.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-muted">
        {projeto.coverImage ? (
          <Image
            src={projeto.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <BehanceIcon className="size-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {projeto.category && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-brand">
            {projeto.category}
          </span>
        )}
        <span className="flex items-start justify-between gap-2">
          <span className="font-medium leading-snug">{projeto.title}</span>
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
    </a>
  )
}

export default async function BehancePage() {
  const { projects, ok } = await fetchBehanceProjects()

  const porCategoria = projects.reduce<Record<string, number>>((acc, p) => {
    const chave = p.category ?? "Outros"
    acc[chave] = (acc[chave] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 380,
              x: "8%",
              y: "18%",
              color: "var(--brand)",
              duration: 18,
              delay: 0,
              opacity: 0.22,
            },
            {
              size: 320,
              x: "78%",
              y: "62%",
              color: "var(--brand-glow)",
              duration: 22,
              delay: 2,
              opacity: 0.18,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-4xl px-5 py-24 sm:px-6 md:py-32">
          <FadeIn>
            <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              <BehanceIcon className="size-4" />
              Behance
            </p>
          </FadeIn>

          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              Design <span className="text-gradient-brand">publicado</span>
            </h1>
          </SlideIn>

          <SlideIn direction="up" delay={0.2}>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Interfaces, landing pages e peças de social media que publiquei no
              Behance como <span className="font-mono text-foreground">{BEHANCE_HANDLE}</span>.
            </p>
          </SlideIn>

          {projects.length > 0 && (
            <SlideIn direction="up" delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-8 border-t border-border pt-6">
                <div>
                  <span className="block font-display text-2xl font-bold tabular-nums tracking-tight">
                    {projects.length}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                    Projetos
                  </span>
                </div>
                {Object.entries(porCategoria).map(([cat, n]) => (
                  <div key={cat}>
                    <span className="block font-display text-2xl font-bold tabular-nums tracking-tight">
                      {n}
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                      {cat}
                    </span>
                  </div>
                ))}
              </div>
            </SlideIn>
          )}

          <SlideIn direction="up" delay={0.4}>
            <a
              href={BEHANCE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
            >
              <BehanceIcon className="size-4" />
              Ver perfil no Behance
            </a>
          </SlideIn>
        </div>
      </section>

      {/* Projetos */}
      <section className="container mx-auto max-w-6xl px-5 py-12 sm:px-6">
        {ok ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((projeto, i) => (
              <ScrollReveal key={projeto.id} delay={Math.min(i, 6) * 0.05}>
                <Cartao projeto={projeto} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* O Behance não tem API pública; a leitura depende do HTML deles.
             Quando muda, é melhor mandar a pessoa pro perfil do que mostrar
             uma grade vazia sem explicação. */
          <ScrollReveal>
            <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
              <BehanceIcon className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Não consegui carregar os projetos agora.
              </p>
              <a
                href={BEHANCE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-brand hover:underline"
              >
                Ver direto no Behance
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </ScrollReveal>
        )}
      </section>
    </>
  )
}
