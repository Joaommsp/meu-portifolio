import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { getAllProjects } from "@/lib/data/projects"
import { CABECALHO_SECAO_HOME, SECAO_HOME, TITULO_SECAO_HOME } from "@/components/sections/secao"
import { cn } from "@/lib/utils"

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
      className={cn(SECAO_HOME, "scroll-mt-20")}
    >
      <ScrollReveal>
        <div className={cn(CABECALHO_SECAO_HOME, "flex items-end justify-between gap-4")}>
          <h2 className={TITULO_SECAO_HOME}>Projetos</h2>
          <Button variant="ghost" render={<Link href="/projetos" />}>
            Ver todos
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
