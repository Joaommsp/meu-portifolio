"use client"

import * as React from "react"
import { X, FolderX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectCardSkeleton } from "@/components/projects/ProjectCardSkeleton"
import { ScrollReveal } from "@/components/animations"
import { CampoBusca } from "@/components/listagem/CampoBusca"
import { EstadoListagem } from "@/components/listagem/EstadoListagem"
import { FilterChip, FiltroGrupo } from "@/components/listagem/filtros"
import {
  contagem,
  rotuloContador,
  useListagem,
} from "@/components/listagem/useListagem"
import { contarRotulos, temTodosRotulos } from "@/components/listagem/rotulos"
import { PageHero } from "@/components/sections/PageHero"
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

/** Referência estável: um `?? []` inline criaria um array novo a cada render. */
const SEM_PROJETOS: Project[] = []

/* Estável e estrito: uma consulta que falha aparece como erro, e não como
   lista vazia (ver useListagem). */
const carregarProjetos = () => getAllProjects({ estrito: true })

export default function ProjetosPage() {
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("all")
  const [activeTechs, setActiveTechs] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)

  /* No celular as tecnologias ficam recolhidas: são uns 15 chips, e abertos
     eles empurravam o primeiro projeto pra depois da primeira tela. */
  const [mostrarTechs, setMostrarTechs] = React.useState(false)
  const idTecnologias = React.useId()

  const { itens: projects, erro, carregando, tentarDeNovo } =
    useListagem(carregarProjetos)

  const sourceProjects = projects ?? SEM_PROJETOS

  // Lista única de techs ordenada por frequência
  const allTechs = React.useMemo(
    () => contarRotulos(sourceProjects, (p) => p.technologies),
    [sourceProjects]
  )

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return sourceProjects.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false
      if (activeTechs.size > 0) {
        if (!temTodosRotulos(p.technologies, activeTechs)) return false
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
      <PageHero
        rotulo="Projetos"
        janela="projetos"
        titulo="O que ando construindo"
        descricao={
          <>
            {/* Sem número enquanto carrega ou com zero. */}
            {sourceProjects.length > 0
              ? contagem(sourceProjects.length, "projeto", "projetos")
              : "Projetos"}{" "}
            entre clientes, side-projects e experimentos. Use os filtros pra
            refinar.
          </>
        }
      />

      {/* Filtros + lista */}
      <section className="container mx-auto max-w-6xl px-5 sm:px-6 pt-12 pb-24">
        <div className="space-y-6 rounded-2xl border border-border bg-card/50 p-6">
          {/* Search */}
          <CampoBusca
            valor={search}
            onChange={setSearch}
            placeholder="Buscar por título, descrição ou tech…"
            rotulo="Buscar projetos"
          />

          {/* Categorias */}
          <FiltroGrupo rotulo="Categoria">
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
          </FiltroGrupo>

          {/* Techs: recolhidas no celular, sempre abertas a partir de md */}
          {allTechs.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                aria-expanded={mostrarTechs}
                aria-controls={idTecnologias}
                onClick={() => setMostrarTechs((v) => !v)}
              >
                {mostrarTechs
                  ? "Esconder tecnologias"
                  : `Filtrar por tecnologia${activeTechs.size > 0 ? ` (${activeTechs.size})` : ""}`}
              </Button>
              <div
                id={idTecnologias}
                className={cn(!mostrarTechs && "max-md:hidden")}
              >
                <FiltroGrupo rotulo="Tecnologias">
                  {allTechs.map((tech) => (
                    <FilterChip
                      key={tech.chave}
                      active={activeTechs.has(tech.chave)}
                      onClick={() => toggleTech(tech.chave)}
                    >
                      {tech.rotulo}
                    </FilterChip>
                  ))}
                </FiltroGrupo>
              </div>
            </>
          )}

          {/* Status */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === sourceProjects.length ? (
                <>{rotuloContador({ carregando, erro }, filtered.length, "projeto", "projetos")}</>
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
        {/* Os cards usam h3; sem este h2 a página pulava do h1 direto pra eles. */}
        <h2 className="sr-only">Projetos</h2>
        {carregando ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, idx) => (
              <ScrollReveal key={project.id} delay={Math.min(idx, 5) * 0.05}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EstadoListagem
            icone={FolderX}
            carregando={false}
            erro={erro}
            onTentarDeNovo={tentarDeNovo}
            temConteudo={sourceProjects.length > 0}
            vazio={{
              titulo: "Ainda não há projetos por aqui",
              texto: "Os projetos aparecem aqui assim que forem publicados.",
            }}
            semResultado="Nenhum projeto encontrado"
            onLimpar={clearFilters}
          />
        )}
      </section>
    </>
  )
}
