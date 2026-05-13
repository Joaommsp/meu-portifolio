"use client"

import * as React from "react"
import { Search, X, FolderX } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectCardSkeleton } from "@/components/projects/ProjectCardSkeleton"
import { GridBackground, GradientOrbs } from "@/components/backgrounds"
import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { getAllProjects } from "@/lib/data/projects"
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/types/project"
import type { Project } from "@/types/project"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  design: "Design",
  outro: "Outros",
}

type CategoryFilter = ProjectCategory | "all"

export default function ProjetosPage() {
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("all")
  const [activeTechs, setActiveTechs] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  const [projects, setProjects] = React.useState<Project[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    getAllProjects().then((data) => {
      if (!cancelled) setProjects(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const sourceProjects = projects ?? []

  // Lista única de techs ordenada por frequência
  const allTechs = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of sourceProjects) {
      for (const t of p.technologies) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
  }, [sourceProjects])

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return sourceProjects.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false
      if (activeTechs.size > 0) {
        const hasAll = Array.from(activeTechs).every((t) =>
          p.technologies.includes(t)
        )
        if (!hasAll) return false
      }
      if (term) {
        const haystack = `${p.title} ${p.shortDescription} ${p.technologies.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [activeCategory, activeTechs, deferredSearch, sourceProjects])

  const hasActiveFilter =
    activeCategory !== "all" || activeTechs.size > 0 || search.trim() !== ""

  function toggleTech(tech: string) {
    setActiveTechs((prev) => {
      const next = new Set(prev)
      if (next.has(tech)) next.delete(tech)
      else next.add(tech)
      return next
    })
  }

  function clearFilters() {
    setActiveCategory("all")
    setActiveTechs(new Set())
    setSearch("")
  }

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs />

        <div className="container relative mx-auto max-w-5xl px-6 py-24 md:py-28">
          <FadeIn>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Projetos
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              O que ando construindo
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {sourceProjects.length} projeto{sourceProjects.length === 1 ? "" : "s"}{" "}
              entre clientes, side-projects e experimentos. Use os filtros pra
              refinar.
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Filtros + lista */}
      <section className="container mx-auto max-w-6xl px-6 pb-24">
        <div className="space-y-6 rounded-2xl border border-border bg-card/50 p-6">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, descrição ou tech…"
              className="pl-9"
              aria-label="Buscar projetos"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Categorias */}
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              Categoria
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              >
                Todos
              </FilterChip>
              {PROJECT_CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                >
                  {CATEGORY_LABEL[cat]}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Techs */}
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              Tecnologias
            </p>
            <div className="flex flex-wrap gap-2">
              {allTechs.map((tech) => (
                <FilterChip
                  key={tech}
                  active={activeTechs.has(tech)}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === sourceProjects.length ? (
                <>{filtered.length} projetos</>
              ) : (
                <>
                  Mostrando{" "}
                  <span className="text-foreground">{filtered.length}</span> de{" "}
                  {sourceProjects.length}
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

        {/* Grid */}
        {!projects ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, idx) => (
              <ScrollReveal key={project.id} delay={Math.min(idx, 5) * 0.05}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FolderX className="size-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              Nenhum projeto encontrado
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros ou{" "}
              <button
                onClick={clearFilters}
                className="text-brand underline-offset-2 hover:underline"
              >
                limpe tudo
              </button>{" "}
              pra ver os {sourceProjects.length} projetos.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

type FilterChipProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "cursor-pointer select-none px-3 py-1 font-mono text-xs transition-all",
        active
          ? "bg-brand text-brand-foreground hover:bg-brand-hover"
          : "hover:border-brand/60 hover:text-brand"
      )}
      render={
        <button type="button" onClick={onClick} aria-pressed={active} />
      }
    >
      {children}
    </Badge>
  )
}
