"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Briefcase,
  Eye,
  Plus,
  ArrowRight,
  Sparkles,
  Loader2,
  Database,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listPosts } from "@/lib/firebase/posts"
import { listProjects } from "@/lib/firebase/projects"
import { seedSampleData } from "@/lib/firebase/seed"
import type { Post } from "@/types/post"
import type { Project } from "@/types/project"
import { cn } from "@/lib/utils"

type DashboardData = {
  posts: Post[]
  projects: Project[]
  totalViews: number
}

export default function AdminDashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [seeding, setSeeding] = React.useState(false)

  const reload = React.useCallback(async () => {
    try {
      const [posts, projects] = await Promise.all([
        listPosts(),
        listProjects(),
      ])
      const totalViews = posts.reduce((sum, p) => sum + (p.views ?? 0), 0)
      setData({ posts, projects, totalViews })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }, [])

  React.useEffect(() => {
    reload()
  }, [reload])

  async function handleSeed() {
    setSeeding(true)
    try {
      const { posts, projects } = await seedSampleData()
      toast.success("Seed concluído", {
        description: `${posts} posts + ${projects} projetos criados.`,
      })
      await reload()
    } catch (err) {
      toast.error("Erro no seed", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="mb-2 font-mono text-[0.65rem] uppercase"
          >
            Dashboard
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão geral do seu conteúdo publicado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/admin/posts/novo" />}>
            <Plus className="size-4" data-icon="inline-start" />
            Novo post
          </Button>
          <Button variant="outline" render={<Link href="/admin/projetos/novo" />}>
            <Plus className="size-4" data-icon="inline-start" />
            Novo projeto
          </Button>
        </div>
      </header>

      {/* Stats */}
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Erro ao carregar dashboard: {error}
        </div>
      ) : !data ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<FileText className="size-4" />}
            label="Posts"
            value={data.posts.length}
            sub={`${data.posts.filter((p) => p.published).length} publicados`}
            href="/admin/posts"
          />
          <StatCard
            icon={<Briefcase className="size-4" />}
            label="Projetos"
            value={data.projects.length}
            sub={`${data.projects.filter((p) => p.featured).length} em destaque`}
            href="/admin/projetos"
          />
          <StatCard
            icon={<Eye className="size-4" />}
            label="Total de views"
            value={data.totalViews}
            sub="Soma de todos os posts"
          />
        </div>
      )}

      {/* Recent activity */}
      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          <RecentList
            title="Posts recentes"
            empty="Nenhum post ainda."
            emptyHref="/admin/posts/novo"
            emptyLabel="Criar primeiro post"
            seeAllHref="/admin/posts"
            items={data.posts.slice(0, 5).map((p) => ({
              id: p.id,
              title: p.title,
              meta: p.published ? "Publicado" : "Rascunho",
              metaActive: p.published,
              href: `/admin/posts/${p.id}/editar`,
              date: p.publishedAt ?? p.createdAt,
            }))}
          />
          <RecentList
            title="Projetos recentes"
            empty="Nenhum projeto ainda."
            emptyHref="/admin/projetos/novo"
            emptyLabel="Criar primeiro projeto"
            seeAllHref="/admin/projetos"
            items={data.projects.slice(0, 5).map((p) => ({
              id: p.id,
              title: p.title,
              meta: p.featured ? "Em destaque" : p.status,
              metaActive: p.featured,
              href: `/admin/projetos/${p.id}/editar`,
              date: p.startDate,
            }))}
          />
        </div>
      )}

      {/* Onboarding card (vazio total) */}
      {data && data.posts.length === 0 && data.projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand/10">
              <Sparkles className="size-6 text-brand" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Tudo zerado, hora de começar!
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Crie seu primeiro post ou projeto, ou popule o Firestore com
                dados de exemplo (3 posts + 3 projetos).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/admin/posts/novo" />}>
                <Plus className="size-4" data-icon="inline-start" />
                Novo post
              </Button>
              <Button
                variant="outline"
                render={<Link href="/admin/projetos/novo" />}
              >
                <Plus className="size-4" data-icon="inline-start" />
                Novo projeto
              </Button>
              <Button
                variant="ghost"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Database className="size-4" data-icon="inline-start" />
                )}
                Popular com exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ───────────────────────── Components ───────────────────────── */

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  href?: string
}

function StatCard({ icon, label, value, sub, href }: StatCardProps) {
  const inner = (
    <Card
      className={cn(
        "h-full transition-colors",
        href && "hover:border-brand/40"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Carregando…
        </div>
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

type RecentItem = {
  id: string
  title: string
  meta: string
  metaActive: boolean
  href: string
  date: Date
}

type RecentListProps = {
  title: string
  empty: string
  emptyHref: string
  emptyLabel: string
  seeAllHref: string
  items: RecentItem[]
}

function RecentList({
  title,
  empty,
  emptyHref,
  emptyLabel,
  seeAllHref,
  items,
}: RecentListProps) {
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
  return (
    <Card>
      <CardHeader className="flex-row items-baseline justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {items.length > 0 && (
          <Link
            href={seeAllHref}
            className="text-xs text-muted-foreground transition-colors hover:text-brand"
          >
            Ver todos
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="space-y-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">{empty}</p>
            <Button size="sm" variant="outline" render={<Link href={emptyHref} />}>
              {emptyLabel}
              <ArrowRight className="size-3.5" data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          <ul className="-mx-3 -mb-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "font-mono uppercase tracking-wider",
                          item.metaActive ? "text-success" : ""
                        )}
                      >
                        {item.meta}
                      </span>
                      <span>·</span>
                      <span>{dateFormatter.format(item.date)}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
