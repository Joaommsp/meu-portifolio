"use client"

import * as React from "react"
import Link from "next/link"
import { Search, X, FileX, Clock, ArrowUpRight, Sparkles } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/blog/PostCard"
import { GridBackground, GradientOrbs } from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { getAllPublishedPosts } from "@/lib/data/posts"
import { POST_CATEGORIES, type PostCategory } from "@/types/post"
import type { Post } from "@/types/post"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<PostCategory, string> = {
  pensamento: "Pensamentos",
  tutorial: "Tutoriais",
  review: "Reviews",
  noticia: "Notícias",
  outro: "Outros",
}

type CategoryFilter = PostCategory | "all"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default function BlogPage() {
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("all")
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  const [allPosts, setAllPosts] = React.useState<Post[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    getAllPublishedPosts().then((posts) => {
      if (!cancelled) setAllPosts(posts)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const publishedPosts = React.useMemo(() => {
    if (!allPosts) return []
    return [...allPosts].sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    )
  }, [allPosts])

  const featured = publishedPosts.find((p) => p.featured) ?? null

  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of publishedPosts) {
      for (const t of p.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
  }, [publishedPosts])

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return publishedPosts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory)
        return false
      if (activeTags.size > 0) {
        const hasAny = Array.from(activeTags).some((t) => p.tags.includes(t))
        if (!hasAny) return false
      }
      if (term) {
        const haystack = `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [activeCategory, activeTags, deferredSearch, publishedPosts])

  const hasActiveFilter =
    activeCategory !== "all" || activeTags.size > 0 || search.trim() !== ""

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  function clearFilters() {
    setActiveCategory("all")
    setActiveTags(new Set())
    setSearch("")
  }

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs />

        <div className="container relative mx-auto max-w-4xl px-6 py-24 md:py-28">
          <FadeIn>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Blog
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Pensamentos, tutoriais
              <br />
              <span className="text-gradient-brand">e divagações</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {publishedPosts.length} post{publishedPosts.length === 1 ? "" : "s"}{" "}
              que escrevi quando quis. Sobre dev, design e o que aparece no
              meio.
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Featured */}
      {featured && !hasActiveFilter && (
        <section className="container mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <FeaturedCard post={featured} />
          </ScrollReveal>
        </section>
      )}

      {/* Filtros + grid */}
      <section className="container mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, excerpt ou tag…"
              className="pl-9"
              aria-label="Buscar posts"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              Categoria
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              >
                Todos
              </FilterChip>
              {POST_CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                >
                  {CATEGORY_LABEL[cat]}
                </FilterChip>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <FilterChip
                    key={tag}
                    active={activeTags.has(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === publishedPosts.length ? (
                <>{filtered.length} posts</>
              ) : (
                <>
                  Mostrando{" "}
                  <span className="text-foreground">{filtered.length}</span> de{" "}
                  {publishedPosts.length}
                </>
              )}
            </p>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="size-3.5" data-icon="inline-start" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, idx) => (
              <ScrollReveal key={post.id} delay={Math.min(idx, 5) * 0.05}>
                <PostCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileX className="size-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              Nenhum post encontrado
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros ou{" "}
              <button
                onClick={clearFilters}
                className="text-brand underline-offset-2 hover:underline"
              >
                limpe tudo
              </button>
              .
            </p>
          </div>
        )}
      </section>
    </>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* Featured: card grande horizontal pro post em destaque       */
/* ─────────────────────────────────────────────────────────── */
function FeaturedCard({ post }: { post: Post }) {
  const date = post.publishedAt ?? post.createdAt
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/50 md:flex-row"
    >
      {/* Cover gradient */}
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:w-2/5">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 30% 30%, var(--brand-glow) 0%, transparent 60%),
              radial-gradient(at 70% 70%, var(--brand-hover) 0%, transparent 55%),
              linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)
            `,
          }}
        />
        <div className="absolute left-3 top-3">
          <Badge className="gap-1 bg-brand text-brand-foreground">
            <Sparkles className="size-3" />
            Destaque
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
            {CATEGORY_LABEL[post.category]}
          </Badge>
          <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
            <Clock className="size-3" />
            {post.readingTime} min
          </span>
          <span className="font-mono text-[0.7rem] text-muted-foreground">
            {dateFormatter.format(date)}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-brand md:text-4xl">
          {post.title}
        </h2>

        <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-2 text-sm text-brand">
          Ler post completo
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

type FilterChipProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "cursor-pointer select-none px-3 py-1 font-mono text-xs transition-all",
        active
          ? "bg-brand text-brand-foreground hover:bg-brand-hover"
          : "hover:border-brand/60 hover:text-brand"
      )}
      render={
        <button type="button" onClick={onClick} aria-pressed={active} />
      }
    >
      {children}
    </Badge>
  )
}
