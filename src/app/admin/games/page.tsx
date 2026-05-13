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
  Gamepad2,
  ExternalLink,
  Star,
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
import { listGames, deleteGame, updateGame } from "@/lib/firebase/games"
import { GAME_STATUSES, type GameStatus } from "@/types/game"
import type { Game } from "@/types/game"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<GameStatus, string> = {
  jogando: "Jogando",
  concluido: "Concluído",
  rejogando: "Rejogando",
  wishlist: "Wishlist",
  abandonado: "Abandonado",
}

type VisibilityFilter = "all" | "published" | "draft"

export default function AdminGamesPage() {
  const [games, setGames] = React.useState<Game[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<"all" | GameStatus>("all")
  const [visibility, setVisibility] = React.useState<VisibilityFilter>("all")
  const [confirmDelete, setConfirmDelete] = React.useState<Game | null>(null)
  const [actioning, setActioning] = React.useState<string | null>(null)

  const reload = React.useCallback(async () => {
    try {
      const data = await listGames()
      setGames(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar")
    }
  }, [])

  React.useEffect(() => {
    reload()
  }, [reload])

  const filtered = React.useMemo(() => {
    if (!games) return null
    const term = search.trim().toLowerCase()
    return games.filter((g) => {
      if (status !== "all" && g.status !== status) return false
      if (visibility === "published" && !g.published) return false
      if (visibility === "draft" && g.published) return false
      if (term) {
        const haystack =
          `${g.title} ${g.slug} ${g.platforms.join(" ")} ${g.genres.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [games, search, status, visibility])

  async function togglePublish(game: Game) {
    setActioning(game.id)
    try {
      await updateGame(game.id, { published: !game.published })
      toast.success(game.published ? "Despublicado" : "Publicado")
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
      await deleteGame(confirmDelete.id)
      toast.success("Jogo excluído")
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
          <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
            Games
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Gerenciar jogos
          </h1>
        </div>
        <Button render={<Link href="/admin/games/novo" />}>
          <Plus className="size-4" data-icon="inline-start" />
          Novo jogo
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, slug, plataforma ou gênero…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={visibility === "all"} onClick={() => setVisibility("all")}>
              Todos os status
            </FilterPill>
            <FilterPill
              active={visibility === "published"}
              onClick={() => setVisibility("published")}
            >
              Publicados
            </FilterPill>
            <FilterPill
              active={visibility === "draft"}
              onClick={() => setVisibility("draft")}
            >
              Rascunhos
            </FilterPill>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
              Todos
            </FilterPill>
            {GAME_STATUSES.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {STATUS_LABEL[s]}
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
          Carregando jogos…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilter={search !== "" || status !== "all" || visibility !== "all"}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <Link
                      href={`/admin/games/${game.id}/editar`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {game.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      /{game.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-[0.65rem] uppercase"
                    >
                      {STATUS_LABEL[game.status]}
                    </Badge>
                    {game.published ? (
                      <Badge
                        variant="outline"
                        className="ml-1 border-success/40 bg-success/10 font-mono text-[0.65rem] uppercase text-success"
                      >
                        Publicado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="ml-1 border-warning/40 bg-warning/10 font-mono text-[0.65rem] uppercase text-warning"
                      >
                        Rascunho
                      </Badge>
                    )}
                    {game.featured && (
                      <Badge
                        variant="outline"
                        className="ml-1 border-brand/40 bg-brand/10 font-mono text-[0.65rem] uppercase text-brand"
                      >
                        Destaque
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {game.yearPlayed}
                  </TableCell>
                  <TableCell>
                    {game.rating != null ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        <Star className="size-3 fill-brand text-brand" />
                        {game.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={game.published ? "Despublicar" : "Publicar"}
                        onClick={() => togglePublish(game)}
                        disabled={actioning === game.id}
                      >
                        {actioning === game.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : game.published ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </Button>
                      {game.published && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Ver no site"
                          render={
                            <Link href={`/games/${game.slug}`} target="_blank" />
                          }
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar"
                        render={<Link href={`/admin/games/${game.id}/editar`} />}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir"
                        onClick={() => setConfirmDelete(game)}
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
            <DialogTitle>Excluir jogo?</DialogTitle>
            <DialogDescription>
              &ldquo;{confirmDelete?.title}&rdquo; será removido permanentemente.
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
          <Gamepad2 className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            {hasFilter ? "Nenhum jogo bate com os filtros" : "Nenhum jogo ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasFilter
              ? "Ajuste a busca ou os filtros."
              : "Cadastre seu primeiro jogo favorito."}
          </p>
        </div>
        {!hasFilter && (
          <Button render={<Link href="/admin/games/novo" />}>
            <Plus className="size-4" data-icon="inline-start" />
            Adicionar primeiro jogo
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
