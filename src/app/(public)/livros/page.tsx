"use client"

import * as React from "react"
import { Search, X, BookMarked } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookCard } from "@/components/books/BookCard"
import { GridBackground, GradientOrbs } from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { getAllPublishedBooks } from "@/lib/data/books"
import { BOOK_STATUSES, type BookStatus } from "@/types/book"
import type { Book } from "@/types/book"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<BookStatus, string> = {
  lendo: "Lendo",
  lido: "Lidos",
  relendo: "Relendo",
  wishlist: "Wishlist",
  pausado: "Pausados",
  abandonado: "Abandonados",
}

type StatusFilter = BookStatus | "all"

export default function BooksPage() {
  const [allBooks, setAllBooks] = React.useState<Book[] | null>(null)
  const [activeStatus, setActiveStatus] = React.useState<StatusFilter>("all")
  const [activeGenres, setActiveGenres] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  React.useEffect(() => {
    let cancelled = false
    getAllPublishedBooks().then((books) => {
      if (!cancelled) setAllBooks(books)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const books = React.useMemo(() => {
    if (!allBooks) return []
    return [...allBooks].sort((a, b) => b.yearRead - a.yearRead)
  }, [allBooks])

  const allGenres = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of books) {
      for (const g of b.genres) {
        counts.set(g, (counts.get(g) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g)
  }, [books])

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return books.filter((b) => {
      if (activeStatus !== "all" && b.status !== activeStatus) return false
      if (activeGenres.size > 0) {
        const hasAny = Array.from(activeGenres).some((g) =>
          b.genres.includes(g)
        )
        if (!hasAny) return false
      }
      if (term) {
        const haystack =
          `${b.title} ${b.author} ${b.shortDescription} ${b.genres.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [activeStatus, activeGenres, deferredSearch, books])

  const hasActiveFilter =
    activeStatus !== "all" || activeGenres.size > 0 || search.trim() !== ""

  function toggleGenre(g: string) {
    setActiveGenres((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  function clearFilters() {
    setActiveStatus("all")
    setActiveGenres(new Set())
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
              Livros
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Estante
              <br />
              <span className="text-gradient-brand">pessoal</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {books.length} livro{books.length === 1 ? "" : "s"} que passaram
              pela mesa — alguns marcaram.
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Filtros + grid */}
      <section className="container mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, autor ou gênero…"
              className="pl-9"
              aria-label="Buscar livros"
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
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={activeStatus === "all"}
                onClick={() => setActiveStatus("all")}
              >
                Todos
              </FilterChip>
              {BOOK_STATUSES.map((s) => (
                <FilterChip
                  key={s}
                  active={activeStatus === s}
                  onClick={() => setActiveStatus(s)}
                >
                  {STATUS_LABEL[s]}
                </FilterChip>
              ))}
            </div>
          </div>

          {allGenres.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                Gêneros
              </p>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((g) => (
                  <FilterChip
                    key={g}
                    active={activeGenres.has(g)}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === books.length ? (
                <>
                  {filtered.length} livro{filtered.length === 1 ? "" : "s"}
                </>
              ) : (
                <>
                  Mostrando{" "}
                  <span className="text-foreground">{filtered.length}</span> de{" "}
                  {books.length}
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

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((book, idx) => (
              <ScrollReveal key={book.id} delay={Math.min(idx, 5) * 0.05}>
                <BookCard book={book} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BookMarked className="size-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              Nenhum livro encontrado
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "cursor-pointer select-none px-3 py-1 font-mono text-xs transition-all",
        active
          ? "bg-brand text-brand-foreground hover:bg-brand-hover"
          : "hover:border-brand/60 hover:text-brand"
      )}
      render={<button type="button" onClick={onClick} aria-pressed={active} />}
    >
      {children}
    </Badge>
  )
}
