import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Star, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Game, GameStatus } from "@/types/game"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<GameStatus, string> = {
  jogando: "Jogando",
  concluido: "Concluído",
  rejogando: "Rejogando",
  wishlist: "Wishlist",
  abandonado: "Abandonado",
}

const STATUS_COLORS: Record<GameStatus, string> = {
  jogando: "border-brand/40 bg-brand/10 text-brand",
  concluido: "border-success/40 bg-success/10 text-success",
  rejogando: "border-brand/40 bg-brand/10 text-brand",
  wishlist: "border-info/40 bg-info/10 text-info",
  abandonado: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
}

type Props = {
  game: Game
}

export function GameCard({ game }: Props) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-brand/50"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={`Capa de ${game.title}`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
            sem capa
          </div>
        )}

        {/* Status flutuante */}
        <div className="absolute left-3 top-3">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[0.65rem] uppercase backdrop-blur-sm",
              STATUS_COLORS[game.status]
            )}
          >
            {STATUS_LABEL[game.status]}
          </Badge>
        </div>

        {/* Rating no canto */}
        {game.rating != null && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs backdrop-blur-sm">
            <Star className="size-3 fill-brand text-brand" />
            <span className="font-semibold">{game.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Gradient overlay no bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/95 to-transparent"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight transition-colors group-hover:text-brand">
            {game.title}
          </h3>
          <p className="font-mono text-[0.65rem] text-muted-foreground">
            {game.yearPlayed}
            {game.hoursPlayed != null && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Clock className="size-2.5" />
                {game.hoursPlayed}h
              </span>
            )}
          </p>
        </div>

        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {game.shortDescription}
        </p>

        {game.platforms.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {game.platforms.slice(0, 3).map((p) => (
              <span
                key={p}
                className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground"
              >
                {p}
              </span>
            ))}
            {game.platforms.length > 3 && (
              <span className="font-mono text-[0.6rem] text-muted-foreground">
                +{game.platforms.length - 3}
              </span>
            )}
          </div>
        )}

        <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
