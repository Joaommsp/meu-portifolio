"use client"

import * as React from "react"
import Link from "next/link"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import { ArrowUpRight, Globe } from "lucide-react"

import { GithubIcon } from "@/components/icons/brand-icons"
import { Badge } from "@/components/ui/badge"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

const STATUS_LABEL: Record<Project["status"], string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  concluido: "Concluído",
  arquivado: "Arquivado",
}

const STATUS_COLOR: Record<Project["status"], string> = {
  "em-desenvolvimento": "bg-warning/15 text-warning border-warning/30",
  concluido: "bg-success/15 text-success border-success/30",
  arquivado: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
}

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
      {/* Cover area com gradient brand */}
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
            backgroundImage: `linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[0.65rem] uppercase tracking-widest",
              STATUS_COLOR[project.status]
            )}
          >
            {STATUS_LABEL[project.status]}
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
              className="rounded-md border border-border px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
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
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
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
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
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
