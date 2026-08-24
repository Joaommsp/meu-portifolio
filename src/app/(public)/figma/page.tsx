import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Heart, Users } from "lucide-react"

import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { FigmaIcon } from "@/components/icons/brand-icons"
import { getFigmaFiles } from "@/lib/data/figma"
import {
  FIGMA_PROFILE_URL,
  FIGMA_HANDLE,
  FIGMA_MEMBER_SINCE,
  type FigmaFile,
} from "@/types/figma"

export const metadata: Metadata = {
  title: "Figma",
  description:
    "Arquivos públicos de João Marcos na Figma Community: design systems, UI kits e protótipos.",
}

function Numero({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div>
      <span className="block font-display text-2xl font-bold tabular-nums tracking-tight">
        {valor.toLocaleString("pt-BR")}
      </span>
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </span>
    </div>
  )
}

function Arquivo({ arquivo }: { arquivo: FigmaFile }) {
  const Wrapper = arquivo.url ? "a" : "div"
  return (
    <Wrapper
      {...(arquivo.url
        ? { href: arquivo.url, target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
        {arquivo.coverImage ? (
          <Image
            src={arquivo.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <FigmaIcon className="size-7 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="flex items-start justify-between gap-2">
          <span className="font-medium leading-snug">{arquivo.title}</span>
          {arquivo.url && (
            <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </span>

        <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3" aria-hidden />
            {arquivo.likes.toLocaleString("pt-BR")}
            <span className="sr-only">curtidas</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3" aria-hidden />
            {arquivo.users.toLocaleString("pt-BR")}
            <span className="sr-only">pessoas usaram</span>
          </span>
        </span>
      </div>
    </Wrapper>
  )
}

export default async function FigmaPage() {
  const arquivos = await getFigmaFiles()

  const totalCurtidas = arquivos.reduce((t, a) => t + a.likes, 0)
  const totalUsos = arquivos.reduce((t, a) => t + a.users, 0)

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
              <FigmaIcon className="size-4" />
              Figma Community · membro desde {FIGMA_MEMBER_SINCE}
            </p>
          </FadeIn>

          <SlideIn direction="up" delay={0.1}>
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {arquivos.length > 0
                ? `${arquivos.length} arquivo${arquivos.length > 1 ? "s" : ""} público${arquivos.length > 1 ? "s" : ""}, do design system ao protótipo navegável.`
                : "Design systems, UI kits e protótipos publicados como recursos abertos."}
            </p>
          </SlideIn>

          {arquivos.length > 0 && (
            <SlideIn direction="up" delay={0.2}>
              <div className="mt-10 flex flex-wrap gap-8 border-t border-border pt-6">
                <Numero valor={arquivos.length} rotulo="Arquivos" />
                <Numero valor={totalCurtidas} rotulo="Curtidas" />
                <Numero valor={totalUsos} rotulo="Pessoas usaram" />
              </div>
            </SlideIn>
          )}

          <SlideIn direction="up" delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={FIGMA_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                <FigmaIcon className="size-4" />
                Ver perfil na Community
              </a>
              <Link
                href="/projetos"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Ver os projetos no site
              </Link>
            </div>
          </SlideIn>

          <SlideIn direction="up" delay={0.35}>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              {FIGMA_HANDLE}
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Arquivos */}
      {arquivos.length > 0 && (
        <section className="container mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {arquivos.map((arquivo, i) => (
              <ScrollReveal key={arquivo.id} delay={Math.min(i, 6) * 0.05}>
                <Arquivo arquivo={arquivo} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
