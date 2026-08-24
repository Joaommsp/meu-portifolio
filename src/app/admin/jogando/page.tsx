"use client"

import * as React from "react"
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { TagsInput } from "@/components/admin/TagsInput"
import {
  listPlaying,
  createPlaying,
  updatePlaying,
  deletePlaying,
} from "@/lib/firebase/playing"
import {
  EMPTY_PLAYING,
  PLAYING_STATUS,
  PLAYING_STATUS_LABEL,
  type Playing,
  type PlayingInput,
  type PlayingStatus,
} from "@/types/playing"

/** Item em edição: existente (com id) ou novo (id nulo até salvar). */
type EmEdicao = PlayingInput & { id: string | null }

export default function JogandoAdminPage() {
  const [itens, setItens] = React.useState<EmEdicao[]>([])
  const [carregando, setCarregando] = React.useState(true)
  const [salvandoId, setSalvandoId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let vivo = true
    listPlaying()
      .then((lista: Playing[]) => {
        if (!vivo) return
        setItens(
          lista.map((j) => ({
            id: j.id,
            title: j.title,
            coverImage: j.coverImage,
            synopsis: j.synopsis,
            genres: j.genres,
            platform: j.platform,
            status: j.status,
            order: j.order,
            visible: j.visible,
          }))
        )
      })
      .catch(() => {
        toast.error("Não foi possível carregar", {
          description: "Verifique a conexão com o Firebase e recarregue.",
        })
      })
      .finally(() => {
        if (vivo) setCarregando(false)
      })
    return () => {
      vivo = false
    }
  }, [])

  function alterar<K extends keyof PlayingInput>(
    idx: number,
    campo: K,
    valor: PlayingInput[K]
  ) {
    setItens((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it))
    )
  }

  function adicionar() {
    setItens((prev) => [
      ...prev,
      { ...EMPTY_PLAYING, id: null, order: prev.length },
    ])
  }

  async function salvar(idx: number) {
    const item = itens[idx]!
    if (!item.title.trim()) {
      toast.error("Falta o título", {
        description: "O card precisa ao menos do nome do jogo.",
      })
      return
    }
    setSalvandoId(item.id ?? `novo-${idx}`)
    const { id, ...dados } = item
    try {
      if (id) {
        await updatePlaying(id, dados)
      } else {
        const novoId = await createPlaying(dados)
        setItens((prev) =>
          prev.map((it, i) => (i === idx ? { ...it, id: novoId } : it))
        )
      }
      toast.success("Salvo", { description: "A página /agora já está atualizada." })
    } catch {
      toast.error("Erro ao salvar", {
        description: "Confira as regras do Firestore e tente de novo.",
      })
    } finally {
      setSalvandoId(null)
    }
  }

  async function remover(idx: number) {
    const item = itens[idx]!
    if (item.id) {
      try {
        await deletePlaying(item.id)
      } catch {
        toast.error("Erro ao remover")
        return
      }
    }
    setItens((prev) => prev.filter((_, i) => i !== idx))
    toast.success("Removido")
  }

  if (carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Jogando agora
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Cards grandes da página <span className="font-mono">/agora</span>,
            com a capa do jogo ao fundo. É o que está rolando agora — quando
            terminar, remova ou desligue. O catálogo do que já jogou fica em{" "}
            <span className="font-mono">Games</span>.
          </p>
        </div>
        <Button onClick={adicionar}>
          <Plus className="size-4" data-icon="inline-start" />
          Adicionar
        </Button>
      </div>

      {itens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum jogo por aqui. A seção não aparece na página enquanto estiver
            vazia.
          </p>
          <Button className="mt-4" variant="outline" onClick={adicionar}>
            <Plus className="size-4" data-icon="inline-start" />
            Adicionar o primeiro
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {itens.map((item, idx) => (
            <section
              key={item.id ?? `novo-${idx}`}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="size-4" aria-hidden />
                  <span className="font-mono text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.visible ? "Visível" : "Oculto"}</span>
                    <Switch
                      checked={item.visible}
                      onCheckedChange={(v: boolean) =>
                        alterar(idx, "visible", v)
                      }
                      aria-label={`Mostrar ${item.title || "este jogo"} na página`}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remover(idx)}
                    aria-label={`Remover ${item.title || "jogo"}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <ImageUploader
                  value={item.coverImage}
                  onChange={(url) => alterar(idx, "coverImage", url)}
                  folder="jogando"
                  label="Capa do jogo"
                  description="Vira o fundo do card. Imagens largas funcionam melhor."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`titulo-${idx}`}>Título</Label>
                    <Input
                      id={`titulo-${idx}`}
                      value={item.title}
                      placeholder="Nome do jogo"
                      onChange={(e) => alterar(idx, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`plataforma-${idx}`}>Plataforma</Label>
                    <Input
                      id={`plataforma-${idx}`}
                      value={item.platform}
                      placeholder="PS5, PC, Switch…"
                      onChange={(e) => alterar(idx, "platform", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`sinopse-${idx}`}>Sinopse</Label>
                  <Textarea
                    id={`sinopse-${idx}`}
                    value={item.synopsis}
                    rows={3}
                    placeholder="Do que se trata, ou o que te prendeu nele."
                    onChange={(e) => alterar(idx, "synopsis", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Gêneros</Label>
                    <TagsInput
                      value={item.genres}
                      onChange={(tags) => alterar(idx, "genres", tags)}
                      placeholder="RPG, ação…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`status-${idx}`}>Status</Label>
                    <select
                      id={`status-${idx}`}
                      value={item.status}
                      onChange={(e) =>
                        alterar(idx, "status", e.target.value as PlayingStatus)
                      }
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      {PLAYING_STATUS.map((st) => (
                        <option key={st} value={st}>
                          {PLAYING_STATUS_LABEL[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => salvar(idx)}
                    disabled={salvandoId === (item.id ?? `novo-${idx}`)}
                  >
                    {salvandoId === (item.id ?? `novo-${idx}`) ? (
                      <Loader2
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <Save className="size-4" data-icon="inline-start" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
