import Link from "next/link"
import Image from "next/image"
import { Globe } from "lucide-react"

import { GithubIcon } from "@/components/icons/brand-icons"
import { PROJECT_STATUS_COLOR } from "@/components/projects/project-status"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PROJECT_STATUS_LABEL, type Project } from "@/types/project"

type Props = {
  project: Project
}

/**
 * Card de projeto. No hover só a borda muda de cor.
 * Sem imagem, a capa fica numa superfície lisa.
 */
export function ProjectCard({ project }: Props) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand/50">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-secondary">
        {project.coverImage ? (
          <>
            {/*
              `alt` vazio de propósito: o título do projeto vem logo abaixo,
              como link, e repetir aqui só faria o leitor de tela ouvir o mesmo
              nome duas vezes.
            */}
            <Image
              src={project.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            />
            {/*
              Véu no topo para o selo de status continuar legível sobre capa
              clara — a maioria das capturas do portfólio tem fundo claro.
            */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-foreground/30 to-transparent"
            />
          </>
        ) : null}

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs uppercase tracking-wider",
              PROJECT_STATUS_COLOR[project.status]
            )}
          >
            {PROJECT_STATUS_LABEL[project.status]}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link
          href={`/projetos/${project.slug}`}
          className="font-display text-xl font-semibold tracking-tight transition-colors hover:text-brand"
        >
          {project.title}
        </Link>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>

        {/* Techs */}
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links externos */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex gap-2 pt-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub do projeto ${project.title}`}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand pointer-coarse:size-11"
              >
                <GithubIcon className="size-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Site do projeto ${project.title}`}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand pointer-coarse:size-11"
              >
                <Globe className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
