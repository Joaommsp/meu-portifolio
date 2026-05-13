"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ProjectForm,
  projectToFormValues,
} from "@/components/admin/ProjectForm"
import { getProject } from "@/lib/firebase/projects"
import type { Project } from "@/types/project"

export default function EditarProjetoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = React.useState<Project | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getProject(params.id)
        if (cancelled) return
        if (!data) {
          toast.error("Projeto não encontrado")
          router.replace("/admin/projetos")
          return
        }
        setProject(data)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando…
      </div>
    )
  }

  const initialValues = projectToFormValues(project)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/projetos" />}
            className="mb-3"
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Voltar
          </Button>
          <Badge
            variant="outline"
            className="mb-2 font-mono text-[0.65rem] uppercase"
          >
            Editar projeto
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ID: {project.id} · Criado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(project.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/projetos/${project.slug}`} target="_blank" />}
        >
          <ExternalLink className="size-3.5" data-icon="inline-start" />
          Ver no site
        </Button>
      </div>

      <ProjectForm projectId={project.id} initialValues={initialValues} />
    </div>
  )
}
