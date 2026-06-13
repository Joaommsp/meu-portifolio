import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Star,
  BookOpen,
  Calendar,
  Heart,
  User as UserIcon,
} from "lucide-react"

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
  findBookBySlug,
  getAllBookSlugs,
  getAllPublishedBooks,
} from "@/lib/data/books"
import type { BookStatus } from "@/types/book"
import { BookCard } from "@/components/books/BookCard"
import { cn } from "@/lib/utils"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"

export async function generateStaticParams() {
  const slugs = await getAllBookSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await findBookBySlug(slug)
  if (!book) return { title: "Livro não encontrado" }

  const url = `${SITE_URL}/livros/${book.slug}`

  return {
    title: `${book.title} — ${book.author}`,
    description: book.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: book.title,
      description: book.shortDescription,
      type: "article",
      url,
      modifiedTime: book.updatedAt.toISOString(),
      authors: ["João Marcos"],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description: book.shortDescription,
    },
  }
}

const STATUS_LABEL: Record<BookStatus, string> = {
  lendo: "Lendo",
  lido: "Lido",
  relendo: "Relendo",
  wishlist: "Wishlist",
  pausado: "Pausado",
  abandonado: "Abandonado",
}

const STATUS_COLORS: Record<BookStatus, string> = {
  lendo: "border-brand/40 bg-brand/10 text-brand",
  lido: "border-success/40 bg-success/10 text-success",
  relendo: "border-brand/40 bg-brand/10 text-brand",
  wishlist: "border-info/40 bg-info/10 text-info",
  pausado: "border-warning/40 bg-warning/10 text-warning",
  abandonado: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params
  const book = await findBookBySlug(slug)
  if (!book) notFound()

  const allBooks = await getAllPublishedBooks()
  const related = allBooks
    .filter((b) => b.id !== book.id)
    .sort((a, b) => {
      // Mesmo autor pesa mais, depois mesmos gêneros
      const aAuthor = a.author === book.author ? -3 : 0
      const bAuthor = b.author === book.author ? -3 : 0
      const aGenres = a.genres.filter((g) => book.genres.includes(g)).length
      const bGenres = b.genres.filter((g) => book.genres.includes(g)).length
      return aAuthor - aGenres - (bAuthor - bGenres)
    })
    .slice(0, 3)

  const url = `${SITE_URL}/livros/${book.slug}`

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    description: book.shortDescription,
    image: book.coverImage || undefined,
    genre: book.genres,
    numberOfPages: book.pages ?? undefined,
    aggregateRating:
      book.rating != null
        ? {
            "@type": "AggregateRating",
            ratingValue: book.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: 1,
          }
        : undefined,
    review: {
      "@type": "Review",
      author: { "@type": "Person", name: "João Marcos" },
      reviewRating:
        book.rating != null
          ? {
              "@type": "Rating",
              ratingValue: book.rating,
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
        name: "Livros",
        item: `${SITE_URL}/livros`,
      },
      { "@type": "ListItem", position: 3, name: book.title, item: url },
    ],
  }

  return (
    <>
      <ReadingProgressBar />
      <StructuredData data={bookSchema} />
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
              render={<Link href="/livros" />}
            >
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Todos os livros
            </Button>
          </FadeIn>

          <div className="grid gap-10 md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]">
            {/* Cover — 2:3 book proportions */}
            <ScrollReveal>
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6),0_0_60px_-30px_var(--brand-glow)]">
                {book.coverImage && (
                  <Image
                    src={book.coverImage}
                    alt={`Capa de ${book.title}`}
                    fill
                    sizes="(max-width: 768px) 80vw, 320px"
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
                      STATUS_COLORS[book.status]
                    )}
                  >
                    {STATUS_LABEL[book.status]}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                    <Calendar className="size-3" />
                    {book.yearRead}
                  </span>
                  {book.pages != null && (
                    <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                      <BookOpen className="size-3" />
                      {book.pages} páginas
                    </span>
                  )}
                  {book.rating != null && (
                    <span className="flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[0.7rem] text-brand">
                      <Star className="size-3 fill-brand" />
                      {book.rating.toFixed(1)}/10
                    </span>
                  )}
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                  {book.title}
                </h1>
              </SlideIn>

              <SlideIn direction="up" delay={0.12}>
                <p className="mt-3 flex items-center gap-2 font-mono text-sm text-muted-foreground">
                  <UserIcon className="size-3.5" />
                  por <span className="text-foreground">{book.author}</span>
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={0.15}>
                <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
                  {book.shortDescription}
                </p>
              </SlideIn>

              {book.genres.length > 0 && (
                <SlideIn direction="up" delay={0.2}>
                  <div className="mt-6">
                    <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                      Gêneros
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {book.genres.map((g) => (
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

      {/* Por que gosto */}
      {book.whyILikeIt && (
        <section className="container mx-auto max-w-3xl px-6 py-16">
          <ScrollReveal>
            <div className="rounded-2xl border border-brand/30 bg-brand/[0.04] p-8 md:p-10">
              <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
                <Heart className="size-3.5" />
                Por que eu gosto
              </div>
              <MarkdownContent>{book.whyILikeIt}</MarkdownContent>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Sinopse */}
      {book.synopsis && (
        <section className="container mx-auto max-w-3xl px-6 pb-16">
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <BookOpen className="size-3.5" />
              Sinopse
            </div>
            <article>
              <MarkdownContent>{book.synopsis}</MarkdownContent>
            </article>
          </ScrollReveal>
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
                    Continue lendo
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={0.05}>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                    Livros parecidos
                  </h2>
                </ScrollReveal>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b, idx) => (
                <ScrollReveal key={b.id} delay={idx * 0.05}>
                  <BookCard book={b} />
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
