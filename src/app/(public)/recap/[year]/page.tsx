import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  FileText,
  Gamepad2,
  BookMarked,
  Briefcase,
  Clock,
  Star,
  TrendingUp,
  Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
} from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { getAllPublishedPosts } from "@/lib/data/posts"
import { getAllProjects } from "@/lib/data/projects"
import { getAllPublishedGames } from "@/lib/data/games"
import { getAllPublishedBooks } from "@/lib/data/books"
import { fetchWakatimeRange, getLangColor } from "@/lib/wakatime"

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 2024 // ajuste pra primeiro ano com conteúdo

export async function generateStaticParams() {
  const years: string[] = []
  for (let y = MIN_YEAR; y <= CURRENT_YEAR; y++) {
    years.push(String(y))
  }
  return years.map((year) => ({ year }))
}

type Props = {
  params: Promise<{ year: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return {
    title: `${year} — Recap`,
    description: `Resumo de ${year} de João Marcos: posts publicados, jogos, livros, projetos e horas de código.`,
    alternates: { canonical: `/recap/${year}` },
  }
}

export default async function RecapPage({ params }: Props) {
  const { year: yearStr } = await params
  const year = Number(yearStr)

  if (
    !Number.isInteger(year) ||
    year < MIN_YEAR ||
    year > CURRENT_YEAR
  ) {
    notFound()
  }

  const [posts, projects, games, books, wakatime] = await Promise.all([
    getAllPublishedPosts(),
    getAllProjects(),
    getAllPublishedGames(),
    getAllPublishedBooks(),
    fetchWakatimeRange(`${year}-01-01`, `${year}-12-31`),
  ])

  // Filtra por ano
  const yearPosts = posts.filter((p) => {
    const date = p.publishedAt ?? p.createdAt
    return date.getFullYear() === year
  })
  const yearProjects = projects.filter(
    (p) => p.startDate.getFullYear() === year
  )
  const yearGames = games.filter((g) => g.yearPlayed === year)
  const yearBooks = books.filter((b) => b.yearRead === year)

  // Top rated
  const topGame = [...yearGames]
    .filter((g) => g.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
  const topBook = [...yearBooks]
    .filter((b) => b.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
  const featuredPost = yearPosts.find((p) => p.featured) ?? yearPosts[0]

  // Top gêneros (games + livros combinados)
  const genreCount = new Map<string, number>()
  for (const g of yearGames) {
    for (const t of g.genres) genreCount.set(t, (genreCount.get(t) ?? 0) + 1)
  }
  const topGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const isCurrentYear = year === CURRENT_YEAR
  const hasAnyData =
    yearPosts.length > 0 ||
    yearGames.length > 0 ||
    yearBooks.length > 0 ||
    yearProjects.length > 0 ||
    (wakatime?.total_seconds ?? 0) > 0

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs />
        <NoiseTexture opacity={0.05} />

        <div className="container relative mx-auto max-w-5xl px-6 py-24 md:py-28">
          <FadeIn>
            <Button
              variant="ghost"
              size="sm"
              className="mb-8"
              render={<Link href="/" />}
            >
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Voltar
            </Button>
          </FadeIn>

          <FadeIn delay={0.05}>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Recap {isCurrentYear ? "(em andamento)" : "anual"}
            </p>
          </FadeIn>

          <SlideIn direction="up" delay={0.1}>
            <h1 className="mt-4 font-display text-[clamp(4rem,18vw,14rem)] font-bold leading-none tracking-tighter">
              <span className="text-foreground">{String(year).slice(0, 2)}</span>
              <span className="text-brand drop-shadow-[0_0_30px_var(--brand-glow)]">
                {String(year).slice(2)}
              </span>
            </h1>
          </SlideIn>

          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {isCurrentYear
                ? `Snapshot do ano até aqui — atualiza conforme novos posts, jogos e livros entram.`
                : `Tudo que aconteceu em ${year} — posts, jogos, livros e horas de código.`}
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Big numbers grid */}
      {hasAnyData ? (
        <>
          <section className="container mx-auto max-w-5xl px-6 pt-12 pb-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <BigNumber
                icon={<FileText className="size-4" />}
                value={yearPosts.length}
                label="Posts"
                href="/blog"
              />
              <BigNumber
                icon={<Briefcase className="size-4" />}
                value={yearProjects.length}
                label="Projetos"
                href="/projetos"
              />
              <BigNumber
                icon={<Gamepad2 className="size-4" />}
                value={yearGames.length}
                label="Jogos"
                href="/games"
              />
              <BigNumber
                icon={<BookMarked className="size-4" />}
                value={yearBooks.length}
                label="Livros"
                href="/livros"
              />
              <BigNumber
                icon={<Clock className="size-4" />}
                value={wakatime?.total_hours ?? 0}
                label="Horas codando"
                suffix="h"
              />
            </div>
          </section>

          {/* Top linguagens (Wakatime) */}
          {wakatime && wakatime.languages.length > 0 && (
            <section className="container mx-auto max-w-5xl px-6 pb-16">
              <ScrollReveal>
                <h2 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <TrendingUp className="size-3.5 text-brand" />
                  Linguagens mais usadas
                </h2>
              </ScrollReveal>
              <div className="grid gap-3 rounded-2xl border border-border bg-card p-6">
                {wakatime.languages.slice(0, 6).map((lang) => (
                  <ScrollReveal key={lang.name} delay={0.03}>
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            aria-hidden
                            className="inline-block size-2.5 shrink-0 rounded-full"
                            style={{ background: getLangColor(lang.name) }}
                          />
                          {lang.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {lang.percent.toFixed(1)}% ·{" "}
                          {Math.round(lang.total_seconds / 3600)}h
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${lang.percent}%`,
                            background: getLangColor(lang.name),
                          }}
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              {wakatime.days_coded > 0 && (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {wakatime.days_coded} dias com pelo menos 1 commit · média{" "}
                  {Math.round(
                    wakatime.total_seconds / (wakatime.days_coded * 60)
                  )}{" "}
                  min/dia ativo
                </p>
              )}
            </section>
          )}

          {/* Highlights */}
          {(topGame || topBook || featuredPost) && (
            <section className="container mx-auto max-w-5xl px-6 pb-16">
              <ScrollReveal>
                <h2 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <Award className="size-3.5 text-brand" />
                  Destaques do ano
                </h2>
              </ScrollReveal>

              <div className="grid gap-4 lg:grid-cols-3">
                {topGame && (
                  <ScrollReveal>
                    <HighlightCard
                      type="Top jogo"
                      title={topGame.title}
                      subtitle={topGame.shortDescription}
                      coverImage={topGame.coverImage}
                      rating={topGame.rating}
                      href={`/games/${topGame.slug}`}
                    />
                  </ScrollReveal>
                )}
                {topBook && (
                  <ScrollReveal delay={0.05}>
                    <HighlightCard
                      type="Top livro"
                      title={topBook.title}
                      subtitle={topBook.author}
                      coverImage={topBook.coverImage}
                      rating={topBook.rating}
                      href={`/livros/${topBook.slug}`}
                    />
                  </ScrollReveal>
                )}
                {featuredPost && (
                  <ScrollReveal delay={0.1}>
                    <HighlightCard
                      type="Post em destaque"
                      title={featuredPost.title}
                      subtitle={featuredPost.excerpt}
                      coverImage={featuredPost.coverImage}
                      href={`/blog/${featuredPost.slug}`}
                    />
                  </ScrollReveal>
                )}
              </div>
            </section>
          )}

          {/* Top gêneros (jogos) */}
          {topGenres.length > 0 && (
            <section className="container mx-auto max-w-5xl px-6 pb-16">
              <ScrollReveal>
                <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Gêneros que dominaram
                </h2>
              </ScrollReveal>
              <div className="flex flex-wrap gap-3">
                {topGenres.map(([genre, count], idx) => (
                  <ScrollReveal key={genre} delay={idx * 0.03}>
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/[0.06] px-4 py-2">
                      <span className="font-display text-2xl font-bold text-brand">
                        {count}
                      </span>
                      <span className="text-sm">{genre}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        // Empty state — ano ainda sem dados
        <section className="container mx-auto max-w-2xl px-6 pb-24">
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Vazio
            </p>
            <p className="mt-3 text-muted-foreground">
              Sem dados pra {year} ainda. Volta no fim do ano.
            </p>
          </div>
        </section>
      )}

      {/* Year nav */}
      <YearNav currentYear={year} />
    </>
  )
}

/* ─────────────────────────────────────────────────────────── */

function BigNumber({
  icon,
  value,
  label,
  suffix = "",
  href,
}: {
  icon: React.ReactNode
  value: number
  label: string
  suffix?: string
  href?: string
}) {
  const className =
    "group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
  const content = (
    <>
      <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="font-display text-5xl font-bold tracking-tight text-foreground transition-colors group-hover:text-brand md:text-6xl">
        {value}
        {suffix && (
          <span className="text-2xl text-muted-foreground">{suffix}</span>
        )}
      </p>
    </>
  )
  return (
    <ScrollReveal>
      {href ? (
        <Link href={href} className={className}>
          {content}
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </ScrollReveal>
  )
}

function HighlightCard({
  type,
  title,
  subtitle,
  coverImage,
  rating,
  href,
}: {
  type: string
  title: string
  subtitle?: string
  coverImage: string
  rating?: number | null
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-brand/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-card to-transparent"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-brand/40 bg-brand/10 font-mono text-[0.6rem] uppercase text-brand"
          >
            {type}
          </Badge>
          {rating != null && (
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <Star className="size-3 fill-brand text-brand" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight transition-colors group-hover:text-brand">
          {title}
        </h3>
        {subtitle && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}

function YearNav({ currentYear }: { currentYear: number }) {
  const years: number[] = []
  for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) years.push(y)

  return (
    <section className="border-t border-border bg-card/30 py-12">
      <div className="container mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Outros anos
        </p>
        <div className="flex flex-wrap gap-2">
          {years
            .filter((y) => y !== currentYear)
            .map((y) => (
              <Button
                key={y}
                variant="outline"
                size="sm"
                render={<Link href={`/recap/${y}`} />}
              >
                {y}
              </Button>
            ))}
        </div>
      </div>
    </section>
  )
}
