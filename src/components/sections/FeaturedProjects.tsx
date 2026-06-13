import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { getAllProjects } from "@/lib/data/projects"

export async function FeaturedProjects() {
  const all = await getAllProjects()
  // Tenta featured primeiro, cai pros 3 mais recentes se ninguém marcado
  const marked = all.filter((p) => p.featured)
  const featured =
    marked.length > 0 ? marked.slice(0, 3) : all.slice(0, 3)

  // Se não tem projeto nenhum, não renderiza a seção
  if (featured.length === 0) return null

  return (
    <section
      id="featured-projects"
      className="container mx-auto max-w-6xl scroll-mt-20 px-6 py-32"
    >
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              03 · Projetos
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Em destaque
            </h2>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1}>
          <Button variant="ghost" render={<Link href="/projetos" />}>
            Ver todos
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </ScrollReveal>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((project, idx) => (
          <ScrollReveal key={project.id} delay={idx * 0.1}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
