"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Loader2,
  Briefcase,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  listProjects,
  deleteProject,
  updateProject,
} from "@/lib/firebase/projects"
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  type ProjectCategory,
  type ProjectStatus,
} from "@/types/project"
import type { Project } from "@/types/project"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  design: "Design",
  outro: "Outro",
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  concluido: "Concluído",
  arquivado: "Arquivado",
}

const STATUS_COLOR: Record<ProjectStatus, string> = {
  "em-desenvolvimento": "border-warning/40 bg-warning/10 text-warning",
  concluido: "border-success/40 bg-success/10 text-success",
  arquivado: "border-muted-foreground/40 bg-muted text-muted-foreground",
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
})

export default function AdminProjectsPage() {
  const [projects, setProjects] = React.useState<Project[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<"all" | ProjectCategory>(
    "all"
  )
  const [status, setStatus] = React.useState<"all" | ProjectStatus>("all")
  const [confirmDelete, setConfirmDelete] = React.useState<Project | null>(
    null
  )
  const [actioning, setActioning] = React.useState<string | null>(null)

  const reload = React.useCallback(async () => {
    try {
      const data = await listProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar")
    }
  }, [])

  React.useEffect(() => {
    reload()
  }, [reload])

  const filtered = React.useMemo(() => {
    if (!projects) return null
    const term = search.trim().toLowerCase()
    return projects.filter((p) => {
      if (category !== "all" && p.category !== category) return false
      if (status !== "all" && p.status !== status) return false
      if (term) {
        const haystack = `${p.title} ${p.slug} ${p.technologies.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [projects, search, category, status])

  async function toggleFeatured(project: Project) {
    setActioning(project.id)
    try {
      await updateProject(project.id, { featured: !project.featured })
      toast.success(
        project.featured ? "Removido dos destaques" : "Adicionado aos destaques"
      )
      await reload()
    } catch (err) {
      toast.error("Erro", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setActioning(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setActioning(confirmDelete.id)
    try {
      await deleteProject(confirmDelete.id)
      toast.success("Projeto excluído")
      setConfirmDelete(null)
      await reload()
    } catch (err) {
      toast.error("Erro ao excluir", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setActioning(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="mb-2 font-mono text-[0.65rem] uppercase"
          >
            Projetos
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Gerenciar projetos
          </h1>
        </div>
        <Button render={<Link href="/admin/projetos/novo" />}>
          <Plus className="size-4" data-icon="inline-start" />
          Novo projeto
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, slug ou tecnologia…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
              Todos os status
            </FilterPill>
            {PROJECT_STATUSES.map((s) => (
              <FilterPill
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
              >
                {STATUS_LABEL[s]}
              </FilterPill>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              Todas as categorias
            </FilterPill>
            {PROJECT_CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}
              </FilterPill>
            ))}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : !filtered ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando projetos…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilter={search !== "" || category !== "all" || status !== "all"}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Início</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/admin/projetos/${project.id}/editar`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {project.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      /{project.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[0.65rem] uppercase",
                        STATUS_COLOR[project.status]
                      )}
                    >
                      {STATUS_LABEL[project.status]}
                    </Badge>
                    {project.featured && (
                      <Badge
                        variant="outline"
                        className="ml-1 border-brand/40 bg-brand/10 font-mono text-[0.65rem] uppercase text-brand"
                      >
                        Destaque
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {CATEGORY_LABEL[project.category]}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {dateFormatter.format(project.startDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          project.featured
                            ? "Remover dos destaques"
                            : "Marcar como destaque"
                        }
                        onClick={() => toggleFeatured(project)}
                        disabled={actioning === project.id}
                      >
                        {actioning === project.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : project.featured ? (
                          <StarOff className="size-3.5" />
                        ) : (
                          <Star className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Ver no site"
                        render={
                          <Link
                            href={`/projetos/${project.slug}`}
                            target="_blank"
                          />
                        }
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar"
                        render={
                          <Link
                            href={`/admin/projetos/${project.id}/editar`}
                          />
                        }
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir"
                        onClick={() => setConfirmDelete(project)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir projeto?</DialogTitle>
            <DialogDescription>
              "{confirmDelete?.title}" será removido permanentemente. Essa
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
              disabled={actioning !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actioning !== null}
            >
              {actioning && <Loader2 className="size-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "cursor-pointer select-none px-3 py-1 font-mono text-xs transition-all",
        active
          ? "bg-brand text-brand-foreground hover:bg-brand-hover"
          : "hover:border-brand/60 hover:text-brand"
      )}
      render={<button type="button" onClick={onClick} aria-pressed={active} />}
    >
      {children}
    </Badge>
  )
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Briefcase className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            {hasFilter
              ? "Nenhum projeto bate com os filtros"
              : "Nenhum projeto ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasFilter
              ? "Ajuste a busca ou os filtros pra encontrar o que precisa."
              : "Crie seu primeiro projeto. Pode marcar como em desenvolvimento e atualizar depois."}
          </p>
        </div>
        {!hasFilter && (
          <Button render={<Link href="/admin/projetos/novo" />}>
            <Plus className="size-4" data-icon="inline-start" />
            Criar primeiro projeto
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
