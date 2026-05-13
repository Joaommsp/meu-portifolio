import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, Clock, Calendar, Heart, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
} from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { MarkdownContent } from "@/components/markdown/MarkdownContent"
import { BackToTop } from "@/components/blog/BackToTop"
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar"
import { StructuredData } from "@/components/seo/StructuredData"
import {
  findGameBySlug,
  getAllGameSlugs,
  getAllPublishedGames,
} from "@/lib/data/games"
import type { Game, GameStatus } from "@/types/game"
import { GameCard } from "@/components/games/GameCard"
import { cn } from "@/lib/utils"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"

export async function generateStaticParams() {
  const slugs = await getAllGameSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await findGameBySlug(slug)
  if (!game) return { title: "Jogo não encontrado" }

  const url = `${SITE_URL}/games/${game.slug}`

  return {
    title: game.title,
    description: game.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      type: "article",
      url,
      modifiedTime: game.updatedAt.toISOString(),
      authors: ["João Marcos"],
    },
    twitter: {
      card: "summary_large_image",
      title: game.title,
      description: game.shortDescription,
    },
  }
}

const STATUS_LABEL: Record<GameStatus, string> = {
  jogando: "Jogando",
  concluido: "Concluído",
  rejogando: "Rejogando",
  wishlist: "Wishlist",
  abandonado: "Abandonado",
}

const STATUS_COLORS: Record<GameStatus, string> = {
  jogando: "border-brand/40 bg-brand/10 text-brand",
  concluido: "border-success/40 bg-success/10 text-success",
  rejogando: "border-brand/40 bg-brand/10 text-brand",
  wishlist: "border-info/40 bg-info/10 text-info",
  abandonado: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params
  const game = await findGameBySlug(slug)
  if (!game) notFound()

  const allGames = await getAllPublishedGames()
  const related = allGames
    .filter((g) => g.id !== game.id)
    .sort((a, b) => {
      // Mesmo gênero pesa mais, depois mesma plataforma
      const aGenres = a.genres.filter((t) => game.genres.includes(t)).length
      const bGenres = b.genres.filter((t) => game.genres.includes(t)).length
      const aPlatforms = a.platforms.filter((p) =>
        game.platforms.includes(p)
      ).length
      const bPlatforms = b.platforms.filter((p) =>
        game.platforms.includes(p)
      ).length
      return bGenres * 2 + bPlatforms - (aGenres * 2 + aPlatforms)
    })
    .slice(0, 3)

  const url = `${SITE_URL}/games/${game.slug}`

  // JSON-LD: VideoGame
  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.shortDescription,
    image: game.coverImage || undefined,
    gamePlatform: game.platforms,
    genre: game.genres,
    aggregateRating:
      game.rating != null
        ? {
            "@type": "AggregateRating",
            ratingValue: game.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: 1,
          }
        : undefined,
    review: {
      "@type": "Review",
      author: { "@type": "Person", name: "João Marcos" },
      reviewRating:
        game.rating != null
          ? {
              "@type": "Rating",
              ratingValue: game.rating,
              bestRating: 10,
            }
          : undefined,
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Games",
        item: `${SITE_URL}/games`,
      },
      { "@type": "ListItem", position: 3, name: game.title, item: url },
    ],
  }

  return (
    <>
      <ReadingProgressBar />
      <StructuredData data={videoGameSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 480,
              x: "10%",
              y: "20%",
              color: "var(--brand)",
              duration: 22,
              delay: 0,
              opacity: 0.22,
            },
            {
              size: 380,
              x: "80%",
              y: "60%",
              color: "var(--brand-glow)",
              duration: 26,
              delay: 2,
              opacity: 0.18,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-6xl px-6 py-20 md:py-24">
          <FadeIn>
            <Button
              variant="ghost"
              size="sm"
              className="mb-8"
              render={<Link href="/games" />}
            >
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Todos os jogos
            </Button>
          </FadeIn>

          <div className="grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
            {/* Cover */}
            <ScrollReveal>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6),0_0_60px_-30px_var(--brand-glow)]">
                {game.coverImage && (
                  <Image
                    src={game.coverImage}
                    alt={`Capa de ${game.title}`}
                    fill
                    sizes="(max-width: 768px) 80vw, 340px"
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </ScrollReveal>

            {/* Info */}
            <div className="flex flex-col">
              <FadeIn delay={0.05}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.65rem] uppercase",
                      STATUS_COLORS[game.status]
                    )}
                  >
                    {STATUS_LABEL[game.status]}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                    <Calendar className="size-3" />
                    {game.yearPlayed}
                  </span>
                  {game.hoursPlayed != null && (
                    <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                      <Clock className="size-3" />
                      {game.hoursPlayed}h
                    </span>
                  )}
                  {game.rating != null && (
                    <span className="flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[0.7rem] text-brand">
                      <Star className="size-3 fill-brand" />
                      {game.rating.toFixed(1)}/10
                    </span>
                  )}
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                  {game.title}
                </h1>
              </SlideIn>

              <SlideIn direction="up" delay={0.15}>
                <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
                  {game.shortDescription}
                </p>
              </SlideIn>

              {game.platforms.length > 0 && (
                <SlideIn direction="up" delay={0.2}>
                  <div className="mt-6">
                    <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                      Plataformas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 font-mono text-xs text-foreground/80"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </SlideIn>
              )}

              {game.genres.length > 0 && (
                <SlideIn direction="up" delay={0.25}>
                  <div className="mt-4">
                    <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                      Gêneros
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.map((g) => (
                        <span
                          key={g}
                          className="font-mono text-xs text-brand"
                        >
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>
                </SlideIn>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Por que eu gosto */}
      {game.whyILikeIt && (
        <section className="container mx-auto max-w-3xl px-6 py-16">
          <ScrollReveal>
            <div className="rounded-2xl border border-brand/30 bg-brand/[0.04] p-8 md:p-10">
              <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
                <Heart className="size-3.5" />
                Por que eu gosto
              </div>
              <MarkdownContent>{game.whyILikeIt}</MarkdownContent>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* História */}
      {game.history && (
        <section className="container mx-auto max-w-3xl px-6 pb-16">
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <BookOpen className="size-3.5" />
              História do jogo
            </div>
            <article>
              <MarkdownContent>{game.history}</MarkdownContent>
            </article>
          </ScrollReveal>
        </section>
      )}

      {/* Galeria */}
      {game.gallery.length > 0 && (
        <section className="container mx-auto max-w-5xl px-6 pb-16">
          <ScrollReveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Galeria
            </p>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {game.gallery.map((src, idx) => (
              <ScrollReveal key={src} delay={idx * 0.05}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
                  <Image
                    src={src}
                    alt={`${game.title} screenshot ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card/30 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <ScrollReveal>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
                    Jogos parecidos
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={0.05}>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                    Continue explorando
                  </h2>
                </ScrollReveal>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((g, idx) => (
                <ScrollReveal key={g.id} delay={idx * 0.05}>
                  <GameCard game={g} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <BackToTop />
    </>
  )
}
