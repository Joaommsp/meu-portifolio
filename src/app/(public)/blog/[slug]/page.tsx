import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { MarkdownContent } from "@/components/markdown/MarkdownContent"
import { PostCard } from "@/components/blog/PostCard"
import { ShareButtons } from "@/components/blog/ShareButtons"
import { BackToTop } from "@/components/blog/BackToTop"
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar"
import { StructuredData } from "@/components/seo/StructuredData"
import {
  findPostBySlug,
  getAllPostSlugs,
  getAllPublishedPosts,
} from "@/lib/data/posts"
import type { Post } from "@/types/post"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await findPostBySlug(slug)
  if (!post) return { title: "Post não encontrado" }

  const url = `${SITE_URL}/blog/${post.slug}`

  // OG image é gerada dinamicamente via opengraph-image.tsx ao lado deste page.
  // Next pega automaticamente — não precisa setar `images` aqui.
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ["João Marcos"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  }
}

const CATEGORY_LABEL: Record<Post["category"], string> = {
  pensamento: "Pensamentos",
  tutorial: "Tutoriais",
  review: "Reviews",
  noticia: "Notícias",
  outro: "Outros",
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await findPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getAllPublishedPosts()
  const related = allPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => {
      const aCat = a.category === post.category ? -2 : 0
      const bCat = b.category === post.category ? -2 : 0
      const aTags = a.tags.filter((t) => post.tags.includes(t)).length * -1
      const bTags = b.tags.filter((t) => post.tags.includes(t)).length * -1
      return aCat + aTags - (bCat + bTags)
    })
    .slice(0, 2)

  const date = post.publishedAt ?? post.createdAt
  const url = `${SITE_URL}/blog/${post.slug}`

  // JSON-LD: Article + BreadcrumbList
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: "João Marcos",
      url: "https://github.com/Joaommsp",
    },
    publisher: {
      "@type": "Person",
      name: "João Marcos",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  }

  return (
    <>
      <ReadingProgressBar />
      <StructuredData data={articleSchema} />
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
              opacity: 0.25,
            },
            {
              size: 380,
              x: "75%",
              y: "60%",
              color: "var(--brand-glow)",
              duration: 26,
              delay: 2,
              opacity: 0.2,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-3xl px-6 py-20 md:py-24">
          <FadeIn>
            <Button
              variant="ghost"
              size="sm"
              className="mb-8"
              render={<Link href="/blog" />}
            >
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Todos os posts
            </Button>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
                {CATEGORY_LABEL[post.category]}
              </Badge>
              <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                <Clock className="size-3" />
                {post.readingTime} min de leitura
              </span>
              <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                <Calendar className="size-3" />
                {dateFormatter.format(date)}
              </span>
            </div>
          </FadeIn>

          <SlideIn direction="up" delay={0.1}>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              {post.title}
            </h1>
          </SlideIn>

          <SlideIn direction="up" delay={0.15}>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          </SlideIn>

          {post.tags.length > 0 && (
            <SlideIn direction="up" delay={0.2}>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs text-brand"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </SlideIn>
          )}
        </div>
      </section>

      {/* Cover image */}
      {post.coverImage && (
        <section className="container mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              <Image
                src={post.coverImage}
                alt={`Capa de ${post.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 56rem, 100vw"
                priority
              />
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Conteúdo markdown */}
      <article className="container mx-auto max-w-3xl px-6 py-12">
        {post.content ? (
          <MarkdownContent>{post.content}</MarkdownContent>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Conteúdo deste post ainda não foi escrito.
          </div>
        )}

        <div className="mt-12 border-t border-border pt-8">
          <ShareButtons title={post.title} url={`/blog/${post.slug}`} />
        </div>
      </article>

      {/* Posts relacionados */}
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
                    Posts relacionados
                  </h2>
                </ScrollReveal>
              </div>
              <ScrollReveal delay={0.1}>
                <Button variant="ghost" render={<Link href="/blog" />}>
                  Ver todos
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              </ScrollReveal>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {related.map((p, idx) => (
                <ScrollReveal key={p.id} delay={idx * 0.05}>
                  <PostCard post={p} />
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
