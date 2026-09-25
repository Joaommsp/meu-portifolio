"use client"

import * as React from "react"
import { X, Gamepad2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/games/GameCard"
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
import { getAllPublishedGames } from "@/lib/data/games"
import { GAME_STATUSES, type GameStatus } from "@/types/game"

const STATUS_LABEL: Record<GameStatus, string> = {
  jogando: "Jogando",
  concluido: "Concluídos",
  rejogando: "Rejogando",
  wishlist: "Wishlist",
  abandonado: "Abandonados",
}

type StatusFilter = GameStatus | "all"

/* Estável e estrito: uma consulta que falha aparece como erro, e não como
   lista vazia (ver useListagem). */
const carregarJogos = () => getAllPublishedGames({ estrito: true })

export default function GamesPage() {
  const [activeStatus, setActiveStatus] = React.useState<StatusFilter>("all")
  const [activePlatforms, setActivePlatforms] = React.useState<Set<string>>(
    new Set()
  )
  const [activeGenres, setActiveGenres] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  const { itens: allGames, erro, carregando, tentarDeNovo } =
    useListagem(carregarJogos)

  const games = React.useMemo(() => {
    if (!allGames) return []
    return [...allGames].sort((a, b) => b.yearPlayed - a.yearPlayed)
  }, [allGames])

  const allPlatforms = React.useMemo(
    () => contarRotulos(games, (g) => g.platforms),
    [games]
  )

  const allGenres = React.useMemo(
    () => contarRotulos(games, (g) => g.genres),
    [games]
  )

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return games.filter((g) => {
      if (activeStatus !== "all" && g.status !== activeStatus) return false
      if (activePlatforms.size > 0 && !temAlgumRotulo(g.platforms, activePlatforms)) {
        return false
      }
      if (activeGenres.size > 0 && !temAlgumRotulo(g.genres, activeGenres)) {
        return false
      }
      if (term) {
        const haystack =
          `${g.title} ${g.shortDescription} ${g.platforms.join(" ")} ${g.genres.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [activeStatus, activePlatforms, activeGenres, deferredSearch, games])

  const hasActiveFilter =
    activeStatus !== "all" ||
    activePlatforms.size > 0 ||
    activeGenres.size > 0 ||
    search.trim() !== ""

  function togglePlatform(p: string) {
    setActivePlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

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
    setActivePlatforms(new Set())
    setActiveGenres(new Set())
    setSearch("")
  }

  return (
    <>
      {/* Hero */}
      <PageHero
        rotulo="Games"
        janela="games"
        titulo={
          <>
            Jogos que
            <br />
            <span className="text-gradient-brand-claro">marcaram</span>
          </>
        }
        descricao={
          <>
            {/* Sem número enquanto carrega ou com zero: "0 jogos" lia como
                "O jogos". */}
            {games.length > 0
              ? contagem(games.length, "jogo", "jogos")
              : "Os jogos"}{" "}
            que ficaram comigo — a história deles e por que me marcaram.
          </>
        }
      />

      {/* Filtros + grid */}
      <section className="container mx-auto max-w-6xl px-5 sm:px-6 pt-12 pb-24">
        <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
          <CampoBusca
            valor={search}
            onChange={setSearch}
            placeholder="Buscar por título, plataforma ou gênero…"
            rotulo="Buscar jogos"
          />

          <FiltroGrupo rotulo="Status">
            <FilterChip
              active={activeStatus === "all"}
              onClick={() => setActiveStatus("all")}
            >
              Todos
            </FilterChip>
            {GAME_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={activeStatus === s}
                onClick={() => setActiveStatus(s)}
              >
                {STATUS_LABEL[s]}
              </FilterChip>
            ))}
          </FiltroGrupo>

          {allPlatforms.length > 0 && (
            <FiltroGrupo rotulo="Plataformas">
              {allPlatforms.map((p) => (
                <FilterChip
                  key={p.chave}
                  active={activePlatforms.has(p.chave)}
                  onClick={() => togglePlatform(p.chave)}
                >
                  {p.rotulo}
                </FilterChip>
              ))}
            </FiltroGrupo>
          )}

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
              {filtered.length === games.length ? (
                <>
                  {rotuloContador({ carregando, erro }, filtered.length, "jogo", "jogos")}
                </>
              ) : (
                <>
                  Mostrando{" "}
                  <span className="text-foreground">{filtered.length}</span> de{" "}
                  {games.length}
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
        <h2 className="sr-only">Jogos</h2>
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game, idx) => (
              <ScrollReveal key={game.id} delay={Math.min(idx, 5) * 0.05}>
                <GameCard game={game} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EstadoListagem
            icone={Gamepad2}
            carregando={carregando}
            erro={erro}
            onTentarDeNovo={tentarDeNovo}
            temConteudo={games.length > 0}
            vazio={{
              titulo: "Ainda não há jogos por aqui",
              texto: "Os jogos entram aqui conforme eu for escrevendo sobre eles.",
            }}
            semResultado="Nenhum jogo encontrado"
            onLimpar={clearFilters}
          />
        )}
      </section>
    </>
  )
}
