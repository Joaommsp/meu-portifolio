import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { PostCard } from "@/components/blog/PostCard"
import { getAllPublishedPosts } from "@/lib/data/posts"
import { cn } from "@/lib/utils"
import { CABECALHO_SECAO_HOME, SECAO_HOME, TITULO_SECAO_HOME } from "@/components/sections/secao"

export async function LatestPosts() {
  const posts = await getAllPublishedPosts()
  const latest = [...posts]
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    )
    .slice(0, 2)

  if (latest.length === 0) return null

  return (
    <section
      id="latest-posts"
      className="border-t border-border bg-card/30 scroll-mt-20"
    >
      <div className={SECAO_HOME}>
        <ScrollReveal>
          <div className={cn(CABECALHO_SECAO_HOME, "flex items-end justify-between gap-4")}>
            <h2 className={TITULO_SECAO_HOME}>Blog</h2>
            <Button variant="ghost" render={<Link href="/blog" />}>
              Ver todos
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {latest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
