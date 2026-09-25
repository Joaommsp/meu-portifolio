"use client"

import * as React from "react"
import { X, BookMarked } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/books/BookCard"
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
import { getAllPublishedBooks } from "@/lib/data/books"
import { BOOK_STATUSES, type BookStatus } from "@/types/book"

const STATUS_LABEL: Record<BookStatus, string> = {
  lendo: "Lendo",
  lido: "Lidos",
  relendo: "Relendo",
  wishlist: "Wishlist",
  pausado: "Pausados",
  abandonado: "Abandonados",
}

type StatusFilter = BookStatus | "all"

/* Estável e estrito: uma consulta que falha aparece como erro, e não como
   lista vazia (ver useListagem). */
const carregarLivros = () => getAllPublishedBooks({ estrito: true })

export default function BooksPage() {
  const [activeStatus, setActiveStatus] = React.useState<StatusFilter>("all")
  const [activeGenres, setActiveGenres] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  const { itens: allBooks, erro, carregando, tentarDeNovo } =
    useListagem(carregarLivros)

  const books = React.useMemo(() => {
    if (!allBooks) return []
    return [...allBooks].sort((a, b) => b.yearRead - a.yearRead)
  }, [allBooks])

  const allGenres = React.useMemo(
    () => contarRotulos(books, (b) => b.genres),
    [books]
  )

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return books.filter((b) => {
      if (activeStatus !== "all" && b.status !== activeStatus) return false
      if (activeGenres.size > 0 && !temAlgumRotulo(b.genres, activeGenres)) {
        return false
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
      <PageHero
        rotulo="Livros"
        janela="livros"
        titulo={
          <>
            Estante
            <br />
            <span className="text-gradient-brand-claro">pessoal</span>
          </>
        }
        descricao={
          <>
            {/* Sem número enquanto carrega ou com zero. */}
            {books.length > 0
              ? contagem(books.length, "livro", "livros")
              : "Os livros"}{" "}
            que passaram pela mesa — alguns marcaram.
          </>
        }
      />

      {/* Filtros + grid */}
      <section className="container mx-auto max-w-6xl px-5 sm:px-6 pt-12 pb-24">
        <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
          <CampoBusca
            valor={search}
            onChange={setSearch}
            placeholder="Buscar por título, autor ou gênero…"
            rotulo="Buscar livros"
          />

          <FiltroGrupo rotulo="Status">
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
          </FiltroGrupo>

          {allGenres.length > 0 && (
            <FiltroGrupo rotulo="Gêneros">
              {allGenres.map((g) => (
                <FilterChip
                  key={g.chave}
                  active={activeGenres.has(g.chave)}
                  onClick={() => toggleGenre(g.chave)}
                >
                  {g.rotulo}
                </FilterChip>
              ))}
            </FiltroGrupo>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === books.length ? (
                <>
                  {rotuloContador({ carregando, erro }, filtered.length, "livro", "livros")}
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

        {/* Os cards usam h3; sem este h2 a página pulava do h1 direto pra eles. */}
        <h2 className="sr-only">Livros da estante</h2>
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((book, idx) => (
              <ScrollReveal key={book.id} delay={Math.min(idx, 5) * 0.05}>
                <BookCard book={book} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EstadoListagem
            icone={BookMarked}
            carregando={carregando}
            erro={erro}
            onTentarDeNovo={tentarDeNovo}
            temConteudo={books.length > 0}
            vazio={{
              titulo: "Ainda não há livros por aqui",
              texto: "A estante enche conforme eu for escrevendo sobre as leituras.",
            }}
            semResultado="Nenhum livro encontrado"
            onLimpar={clearFilters}
          />
        )}
      </section>
    </>
  )
}
