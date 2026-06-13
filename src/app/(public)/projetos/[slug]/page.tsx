import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Globe,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { ScrollReveal, FadeIn, SlideIn } from "@/components/animations"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { MarkdownContent } from "@/components/markdown/MarkdownContent"
import { GithubIcon } from "@/components/icons/brand-icons"
import { StructuredData } from "@/components/seo/StructuredData"
import {
  findProjectBySlug,
  getAllProjectSlugs,
  getAllProjects,
} from "@/lib/data/projects"
import { TECH_ICONS, type TechName } from "@/components/icons/tech-icons"
import type { Project } from "@/types/project"
import { cn } from "@/lib/utils"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await findProjectBySlug(slug)
  if (!project) return { title: "Projeto não encontrado" }

  const url = `${SITE_URL}/projetos/${project.slug}`

  // OG image é gerada dinamicamente via opengraph-image.tsx ao lado deste page.
  // Next pega automaticamente — não precisa setar `images` aqui.
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.shortDescription,
    },
  }
}

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

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
})

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await findProjectBySlug(slug)
  if (!project) notFound()

  const allProjects = await getAllProjects()
  const suggestions = allProjects
    .filter((p) => p.id !== project.id)
    .sort((a, b) => {
      const aMatch = a.category === project.category ? 0 : 1
      const bMatch = b.category === project.category ? 0 : 1
      return aMatch - bMatch
    })
    .slice(0, 2)

  const url = `${SITE_URL}/projetos/${project.slug}`

  // JSON-LD CreativeWork + BreadcrumbList
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    image: project.coverImage || undefined,
    dateCreated: project.startDate.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    keywords: project.technologies.join(", "),
    creator: {
      "@type": "Person",
      name: "João Marcos",
      url: "https://github.com/Joaommsp",
    },
    url,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projetos",
        item: `${SITE_URL}/projetos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: url,
      },
    ],
  }

  return (
    <>
      <StructuredData data={creativeWorkSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 500,
              x: "20%",
              y: "30%",
              color: "var(--brand)",
              duration: 20,
              delay: 0,
              opacity: 0.3,
            },
            {
              size: 400,
              x: "70%",
              y: "60%",
              color: "var(--brand-glow)",
              duration: 24,
              delay: 2,
              opacity: 0.25,
            },
          ]}
        />
        <NoiseTexture opacity={0.05} />

        <div className="container relative mx-auto max-w-4xl px-6 py-20 md:py-28">
          <FadeIn>
            <Button
              variant="ghost"
              size="sm"
              className="mb-8"
              render={<Link href="/projetos" />}
            >
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Todos os projetos
            </Button>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[0.65rem] uppercase tracking-widest",
                  STATUS_COLOR[project.status]
                )}
              >
                {STATUS_LABEL[project.status]}
              </Badge>
              <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
                {project.category}
              </Badge>
              <Badge variant="outline" className="gap-1 font-mono text-[0.65rem]">
                <Calendar className="size-3" />
                {dateFormatter.format(project.startDate)}
                {project.endDate && (
                  <>
                    {" → "}
                    {dateFormatter.format(project.endDate)}
                  </>
                )}
              </Badge>
            </div>
          </FadeIn>

          <SlideIn direction="up" delay={0.1}>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-7xl">
              {project.title}
            </h1>
          </SlideIn>

          <SlideIn direction="up" delay={0.15}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {project.shortDescription}
            </p>
          </SlideIn>

          <SlideIn direction="up" delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && (
                <Button
                  render={
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Globe className="size-4" data-icon="inline-start" />
                  Ver site
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  variant="outline"
                  render={
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <GithubIcon className="size-4" />
                  Ver código
                </Button>
              )}
            </div>
          </SlideIn>
        </div>
      </section>

      {/* Cover */}
      <section className="container mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={`Capa de ${project.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 64rem, 100vw"
                priority
              />
            ) : (
              <PlaceholderCover />
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* Stack + Conteúdo */}
      <section className="container mx-auto max-w-4xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[200px_1fr] md:items-start">
          <ScrollReveal direction="left">
            <aside className="md:sticky md:top-24">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Stack
              </p>
              <ul className="space-y-2">
                {project.technologies.map((tech) => {
                  const Icon = TECH_ICONS[tech as TechName]
                  return (
                    <li
                      key={tech}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      {Icon ? (
                        <Icon colored className="size-4 shrink-0" />
                      ) : (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                      )}
                      <span>{tech}</span>
                    </li>
                  )
                })}
              </ul>
            </aside>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div>
              {project.fullDescription ? (
                <MarkdownContent>{project.fullDescription}</MarkdownContent>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
                  Descrição completa ainda não escrita pra esse projeto.
                </div>
              )}

              {project.gallery.length > 0 ? (
                <div className="mt-12">
                  <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Galeria
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {project.gallery.map((url, i) => (
                      <div
                        key={url}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
                      >
                        <Image
                          src={url}
                          alt={`${project.title} — galeria ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(min-width: 640px) 30rem, 100vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-12">
                  <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Galeria
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] overflow-hidden rounded-xl border border-border"
                      >
                        <PlaceholderCover seed={i} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="border-t border-border bg-card/30 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <ScrollReveal>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
                    Continue explorando
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={0.05}>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                    Outros projetos
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

            <div className="grid gap-6 md:grid-cols-2">
              {suggestions.map((p, idx) => (
                <ScrollReveal key={p.id} delay={idx * 0.05}>
                  <ProjectCard project={p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function PlaceholderCover({ seed = 0 }: { seed?: number }) {
  const angles = [135, 200, 60, 290]
  const angle = angles[seed % angles.length]
  return (
    <div
      aria-hidden
      className="relative size-full"
      style={{
        background: `
          radial-gradient(at 20% 30%, var(--brand-glow) 0%, transparent 60%),
          radial-gradient(at 80% 70%, var(--brand-hover) 0%, transparent 55%),
          linear-gradient(${angle}deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)
        `,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  )
}
