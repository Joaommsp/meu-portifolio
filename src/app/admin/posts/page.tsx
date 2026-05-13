"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  FileText,
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
import { listPosts, deletePost, updatePost } from "@/lib/firebase/posts"
import { POST_CATEGORIES, type PostCategory } from "@/types/post"
import type { Post } from "@/types/post"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<PostCategory, string> = {
  pensamento: "Pensamento",
  tutorial: "Tutorial",
  review: "Review",
  noticia: "Notícia",
  outro: "Outro",
}

type StatusFilter = "all" | "published" | "draft"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export default function AdminPostsPage() {
  const [posts, setPosts] = React.useState<Post[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<"all" | PostCategory>("all")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [confirmDelete, setConfirmDelete] = React.useState<Post | null>(null)
  const [actioning, setActioning] = React.useState<string | null>(null)

  const reload = React.useCallback(async () => {
    try {
      const data = await listPosts()
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar")
    }
  }, [])

  React.useEffect(() => {
    reload()
  }, [reload])

  const filtered = React.useMemo(() => {
    if (!posts) return null
    const term = search.trim().toLowerCase()
    return posts.filter((p) => {
      if (category !== "all" && p.category !== category) return false
      if (status === "published" && !p.published) return false
      if (status === "draft" && p.published) return false
      if (term) {
        const haystack = `${p.title} ${p.slug} ${p.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [posts, search, category, status])

  async function togglePublish(post: Post) {
    setActioning(post.id)
    try {
      await updatePost(post.id, { published: !post.published })
      toast.success(post.published ? "Despublicado" : "Publicado")
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
      await deletePost(confirmDelete.id)
      toast.success("Post excluído")
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
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
            Posts
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Gerenciar posts
          </h1>
        </div>
        <Button render={<Link href="/admin/posts/novo" />}>
          <Plus className="size-4" data-icon="inline-start" />
          Novo post
        </Button>
      </header>

      {/* Filtros */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, slug ou tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
              Todos os status
            </FilterPill>
            <FilterPill
              active={status === "published"}
              onClick={() => setStatus("published")}
            >
              Publicados
            </FilterPill>
            <FilterPill
              active={status === "draft"}
              onClick={() => setStatus("draft")}
            >
              Rascunhos
            </FilterPill>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              Todas as categorias
            </FilterPill>
            {POST_CATEGORIES.map((cat) => (
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

      {/* Tabela */}
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : !filtered ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando posts…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilter={search !== "" || category !== "all" || status !== "all"} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/admin/posts/${post.id}/editar`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {post.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      /{post.slug}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {CATEGORY_LABEL[post.category]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[0.65rem] uppercase",
                        post.published
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-warning/40 bg-warning/10 text-warning"
                      )}
                    >
                      {post.published ? "Publicado" : "Rascunho"}
                    </Badge>
                    {post.featured && (
                      <Badge
                        variant="outline"
                        className="ml-1 border-brand/40 bg-brand/10 font-mono text-[0.65rem] uppercase text-brand"
                      >
                        Destaque
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {dateFormatter.format(post.publishedAt ?? post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={post.published ? "Despublicar" : "Publicar"}
                        onClick={() => togglePublish(post)}
                        disabled={actioning === post.id}
                      >
                        {actioning === post.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : post.published ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </Button>
                      {post.published && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Ver no site"
                          render={
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                            />
                          }
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar"
                        render={
                          <Link href={`/admin/posts/${post.id}/editar`} />
                        }
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir"
                        onClick={() => setConfirmDelete(post)}
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

      {/* Confirm delete */}
      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir post?</DialogTitle>
            <DialogDescription>
              "{confirmDelete?.title}" será removido permanentemente. Essa ação
              não pode ser desfeita.
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

/* ─────────────────────────────────────────────────────────── */

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
      render={
        <button type="button" onClick={onClick} aria-pressed={active} />
      }
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
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            {hasFilter ? "Nenhum post bate com os filtros" : "Nenhum post ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasFilter
              ? "Ajuste a busca ou os filtros pra encontrar o que precisa."
              : "Crie seu primeiro post — pode salvar como rascunho e publicar depois."}
          </p>
        </div>
        {!hasFilter && (
          <Button render={<Link href="/admin/posts/novo" />}>
            <Plus className="size-4" data-icon="inline-start" />
            Criar primeiro post
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
