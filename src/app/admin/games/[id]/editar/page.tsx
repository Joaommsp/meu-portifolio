"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameForm } from "@/components/admin/GameForm"
import { getGame } from "@/lib/firebase/games"
import type { Game, GameInput } from "@/types/game"

export default function EditarGamePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [game, setGame] = React.useState<Game | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getGame(params.id)
        if (cancelled) return
        if (!data) {
          toast.error("Jogo não encontrado")
          router.replace("/admin/games")
          return
        }
        setGame(data)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando…
      </div>
    )
  }

  const initialValues: GameInput = {
    slug: game.slug,
    title: game.title,
    shortDescription: game.shortDescription,
    history: game.history,
    whyILikeIt: game.whyILikeIt,
    coverImage: game.coverImage,
    gallery: game.gallery,
    platforms: game.platforms,
    genres: game.genres,
    status: game.status,
    yearPlayed: game.yearPlayed,
    hoursPlayed: game.hoursPlayed,
    rating: game.rating,
    featured: game.featured,
    published: game.published,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/games" />}
            className="mb-3"
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Voltar
          </Button>
          <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
            Editar jogo
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {game.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ID: {game.id} · Criado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(game.createdAt)}
          </p>
        </div>
        {game.published && (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/games/${game.slug}`} target="_blank" />}
          >
            <ExternalLink className="size-3.5" data-icon="inline-start" />
            Ver no site
          </Button>
        )}
      </div>

      <GameForm gameId={game.id} initialValues={initialValues} />
    </div>
  )
}
