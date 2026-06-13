import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Clock,
  Gamepad2,
  BookMarked,
  Music,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
} from "@/components/backgrounds"
import { SpotifyNowPlaying } from "@/components/sections/SpotifyNowPlaying"
import { getAllPublishedBooks } from "@/lib/data/books"
import { getAllPublishedGames } from "@/lib/data/games"
import { NOW_LAST_UPDATED, NOW_LOCATION } from "@/lib/now-content"

export const metadata: Metadata = {
  title: "Agora",
  description:
    "O que João Marcos está fazendo agora — trabalho, estudos, jogos, livros e metas do mês.",
  alternates: { canonical: "/now" },
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default async function NowPage() {
  const [books, games] = await Promise.all([
    getAllPublishedBooks(),
    getAllPublishedGames(),
  ])

  const currentBook = books.find(
    (b) => b.status === "lendo" || b.status === "relendo"
  )
  const currentGame = games.find(
    (g) => g.status === "jogando" || g.status === "rejogando"
  )

  const lastUpdatedDate = new Date(NOW_LAST_UPDATED)

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-4xl px-6 py-24 md:py-28">
          <FadeIn>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              <Sparkles className="size-3.5" />
              Agora
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              O que ando
              <br />
              <span className="text-gradient-brand">fazendo</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Esta página é um snapshot de onde estou — trabalho,
              estudos, hobbies. Inspirada no movimento{" "}
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                /now
              </a>{" "}
              do Derek Sivers.
            </p>
          </SlideIn>
          <SlideIn direction="up" delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-brand" />
                {NOW_LOCATION}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" />
                Atualizado em {dateFormatter.format(lastUpdatedDate)}
              </span>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* Live snapshot — auto-puxado dos dados */}
      <section className="container mx-auto max-w-4xl px-6 pt-12 pb-8">
        <ScrollReveal>
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
            Em tempo real
          </p>
        </ScrollReveal>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Spotify (live) */}
          <ScrollReveal delay={0.05}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <Music className="size-3 text-brand" />
                Tocando
              </div>
              <SpotifyNowPlaying className="!flex !max-w-none !border-0 !p-0" />
            </div>
          </ScrollReveal>

          {/* Livro atual */}
          <ScrollReveal delay={0.1}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <BookMarked className="size-3 text-brand" />
                Lendo
              </div>
              {currentBook ? (
                <Link
                  href={`/livros/${currentBook.slug}`}
                  className="group flex items-center gap-3"
                >
                  {currentBook.coverImage && (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded">
                      <Image
                        src={currentBook.coverImage}
                        alt={currentBook.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
                      {currentBook.title}
                    </p>
                    <p className="truncate font-mono text-[0.7rem] text-muted-foreground">
                      {currentBook.author}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Entre livros.
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Jogo atual */}
          <ScrollReveal delay={0.15}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <Gamepad2 className="size-3 text-brand" />
                Jogando
              </div>
              {currentGame ? (
                <Link
                  href={`/games/${currentGame.slug}`}
                  className="group flex items-center gap-3"
                >
                  {currentGame.coverImage && (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded">
                      <Image
                        src={currentGame.coverImage}
                        alt={currentGame.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
                      {currentGame.title}
                    </p>
                    <p className="truncate font-mono text-[0.7rem] text-muted-foreground">
                      {currentGame.platforms[0] ?? ""}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Sem jogo ativo.
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer hint */}
      <section className="container mx-auto max-w-3xl px-6 pt-16 pb-24">
        <ScrollReveal>
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="font-mono text-[0.65rem] uppercase"
            >
              Movimento /now · nownownow.com
            </Badge>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
