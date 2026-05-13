import Link from "next/link"
import { Clock, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Post } from "@/types/post"

const CATEGORY_LABEL: Record<Post["category"], string> = {
  pensamento: "Pensamento",
  tutorial: "Tutorial",
  review: "Review",
  noticia: "Notícia",
  outro: "Outro",
}

type Props = {
  post: Post
}

export function PostCard({ post }: Props) {
  const date = post.publishedAt ?? post.createdAt
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/50 hover:bg-card/80"
    >
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
          {CATEGORY_LABEL[post.category]}
        </Badge>
        <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
          <Clock className="size-3" />
          {post.readingTime} min
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-brand">
        {post.title}
      </h3>

      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
        <span className="font-mono">{formatted}</span>
        <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
