import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { PostCard } from "@/components/blog/PostCard"
import { samplePosts } from "@/lib/mocks/sample-data"

export function LatestPosts() {
  const latest = samplePosts
    .filter((p) => p.published)
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    )
    .slice(0, 3)

  if (latest.length === 0) return null

  return (
    <section
      id="latest-posts"
      className="border-t border-border bg-card/30 scroll-mt-20"
    >
      <div className="container mx-auto max-w-6xl px-6 py-32">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <ScrollReveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
                04 · Blog
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Posts recentes
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.1}>
            <Button variant="ghost" render={<Link href="/blog" />}>
              Ver todos
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </ScrollReveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, idx) => (
            <ScrollReveal key={post.id} delay={idx * 0.1}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
