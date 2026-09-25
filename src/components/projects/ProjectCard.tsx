"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import { ArrowUpRight, Globe } from "lucide-react"

import { GithubIcon } from "@/components/icons/brand-icons"
import { PROJECT_STATUS_COLOR } from "@/components/projects/project-status"
import { Badge } from "@/components/ui/badge"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"
import { PROJECT_STATUS_LABEL, type Project } from "@/types/project"

type Props = {
  project: Project
}

/**
 * Card de projeto com tilt 3D no hover (mouse-tracking).
 * Sem imagem? Usa gradient brand como cover decorativo.
 */
export function ProjectCard({ project }: Props) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 25,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const xv = (e.clientX - rect.left) / rect.width - 0.5
    const yv = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xv)
    y.set(yv)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand/50"
    >
      {/*
        Cover area. O gradiente e a grade abaixo são a reserva para projeto sem
        capa; quando há `coverImage`, a imagem cobre os dois.
      */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 20% 30%, var(--brand-glow) 0%, transparent 60%),
              radial-gradient(at 80% 70%, var(--brand-hover) 0%, transparent 55%),
              linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)
            `,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(to right, oklch(from var(--pattern-line) l c h / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(from var(--pattern-line) l c h / 0.05) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

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
          className="inline-flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight transition-colors hover:text-brand"
        >
          {project.title}
          <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
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

      {/* Brand glow no hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, var(--brand-glow) 0%, transparent 70%)`,
          opacity: 0,
        }}
      />
    </motion.div>
  )
}
