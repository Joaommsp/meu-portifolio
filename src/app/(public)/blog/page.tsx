"use client"

import * as React from "react"
import Link from "next/link"
import { X, FileX, Clock, ArrowUpRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/blog/PostCard"
import { ScrollReveal } from "@/components/animations"
import { CampoBusca } from "@/components/listagem/CampoBusca"
import { EstadoListagem } from "@/components/listagem/EstadoListagem"
import { FilterChip, FiltroGrupo } from "@/components/listagem/filtros"
import {
  contagem,
  rotuloContador,
  useListagem,
} from "@/components/listagem/useListagem"
import { contarRotulos, temAlgumRotulo } from "@/components/listagem/rotulos"
import { PageHero } from "@/components/sections/PageHero"
import { getAllPublishedPosts } from "@/lib/data/posts"
import { POST_CATEGORIES, type PostCategory } from "@/types/post"
import type { Post } from "@/types/post"

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

/* Estável e estrito: uma consulta que falha aparece como erro, e não como
   lista vazia (ver useListagem). */
const carregarPosts = () => getAllPublishedPosts({ estrito: true })

export default function BlogPage() {
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("all")
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  const { itens: allPosts, erro, carregando, tentarDeNovo } =
    useListagem(carregarPosts)

  const publishedPosts = React.useMemo(() => {
    if (!allPosts) return []
    return [...allPosts].sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    )
  }, [allPosts])

  const featured = publishedPosts.find((p) => p.featured) ?? null

  const allTags = React.useMemo(
    () => contarRotulos(publishedPosts, (p) => p.tags),
    [publishedPosts]
  )

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return publishedPosts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory)
        return false
      if (activeTags.size > 0 && !temAlgumRotulo(p.tags, activeTags)) {
        return false
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
      <PageHero
        rotulo="Blog"
        janela="blog"
        titulo={
          <>
            Pensamentos, tutoriais
            <br />
            <span className="text-gradient-brand-claro">e divagações</span>
          </>
        }
        descricao={
          <>
            {/* Sem número enquanto carrega ou com zero: "0 posts" lia como
                "O posts". */}
            {publishedPosts.length > 0
              ? contagem(publishedPosts.length, "post", "posts")
              : "Os posts"}{" "}
            que escrevi quando quis. Sobre dev, design e o que aparece no meio.
          </>
        }
      />

      {/* Featured */}
      {featured && !hasActiveFilter && (
        <section className="container mx-auto max-w-6xl px-5 sm:px-6">
          <ScrollReveal>
            <FeaturedCard post={featured} />
          </ScrollReveal>
        </section>
      )}

      {/* Filtros + grid */}
      <section className="container mx-auto max-w-6xl px-5 sm:px-6 py-16">
        <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
          <CampoBusca
            valor={search}
            onChange={setSearch}
            placeholder="Buscar por título, excerpt ou tag…"
            rotulo="Buscar posts"
          />

          <FiltroGrupo rotulo="Categoria">
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
          </FiltroGrupo>

          {allTags.length > 0 && (
            <FiltroGrupo rotulo="Tags">
              {allTags.map((tag) => (
                <FilterChip
                  key={tag.chave}
                  active={activeTags.has(tag.chave)}
                  onClick={() => toggleTag(tag.chave)}
                >
                  #{tag.rotulo}
                </FilterChip>
              ))}
            </FiltroGrupo>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === publishedPosts.length ? (
                <>{rotuloContador({ carregando, erro }, filtered.length, "post", "posts")}</>
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
        {/* Os cards usam h3; sem este h2 a página pulava do h1 direto pra eles. */}
        <h2 className="sr-only">Posts</h2>
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, idx) => (
              <ScrollReveal key={post.id} delay={Math.min(idx, 5) * 0.05}>
                <PostCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EstadoListagem
            icone={FileX}
            carregando={carregando}
            erro={erro}
            temConteudo={publishedPosts.length > 0}
            vazio={{
              titulo: "Ainda não há posts por aqui",
              texto: "O primeiro texto aparece aqui assim que for publicado.",
            }}
            semResultado="Nenhum post encontrado"
            onLimpar={clearFilters}
            onTentarDeNovo={tentarDeNovo}
          />
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
          <Badge variant="outline" className="font-mono text-xs uppercase">
            {CATEGORY_LABEL[post.category]}
          </Badge>
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock className="size-3" />
            {post.readingTime} min
          </span>
          <span className="font-mono text-xs text-muted-foreground">
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
