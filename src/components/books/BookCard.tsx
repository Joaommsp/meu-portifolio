import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Star, BookOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Book, BookStatus } from "@/types/book"
import { cn } from "@/lib/utils"

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

type Props = {
  book: Book
}

export function BookCard({ book }: Props) {
  return (
    <Link
      href={`/livros/${book.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-brand/50"
    >
      {/* Cover — 2:3 ratio (book proportions) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={`Capa de ${book.title}`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
            sem capa
          </div>
        )}

        {/* Status badge */}
        <div className="absolute left-3 top-3">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[0.65rem] uppercase backdrop-blur-sm",
              STATUS_COLORS[book.status]
            )}
          >
            {STATUS_LABEL[book.status]}
          </Badge>
        </div>

        {/* Rating */}
        {book.rating != null && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs backdrop-blur-sm">
            <Star className="size-3 fill-brand text-brand" />
            <span className="font-semibold">{book.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Gradient bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/95 to-transparent"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-display text-base font-semibold leading-tight tracking-tight transition-colors group-hover:text-brand">
            {book.title}
          </h3>
          <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
            {book.author}
          </p>
        </div>

        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {book.shortDescription}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-[0.65rem] text-muted-foreground">
          <span>{book.yearRead}</span>
          {book.pages != null && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-2.5" />
              {book.pages}p
            </span>
          )}
        </div>

        <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
