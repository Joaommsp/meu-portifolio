import Link from "next/link"
import { ArrowRight, Gamepad2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { GameCard } from "@/components/games/GameCard"
import { getFeaturedGames, getAllPublishedGames } from "@/lib/data/games"

export async function FeaturedGames() {
  // Tenta featured primeiro, cai pros 4 mais recentes se ninguém marcado
  const featured = await getFeaturedGames()
  const games =
    featured.length > 0
      ? featured.slice(0, 4)
      : (await getAllPublishedGames()).slice(0, 4)

  // Se não tem jogo nenhum publicado, não renderiza a seção
  if (games.length === 0) return null

  return (
    <section
      id="featured-games"
      className="container mx-auto max-w-6xl scroll-mt-20 px-6 py-32"
    >
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <ScrollReveal>
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              <Gamepad2 className="size-3.5" />
              05 · Games
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Jogos que marcaram
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Não é tudo código — esses ficaram comigo.
            </p>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.15}>
          <Button variant="ghost" render={<Link href="/games" />}>
            Ver todos
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </ScrollReveal>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game, idx) => (
          <ScrollReveal key={game.id} delay={idx * 0.08}>
            <GameCard game={game} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
