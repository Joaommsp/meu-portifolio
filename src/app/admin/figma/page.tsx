"use client"

import * as React from "react"
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUploader } from "@/components/admin/ImageUploader"
import {
  listFigmaFiles,
  createFigmaFile,
  updateFigmaFile,
  deleteFigmaFile,
} from "@/lib/firebase/figma"
import {
  EMPTY_FIGMA_FILE,
  FIGMA_PROFILE_URL,
  type FigmaFile,
  type FigmaFileInput,
} from "@/types/figma"

/** Item em edição: existente (com id) ou novo (id nulo até salvar). */
type EmEdicao = FigmaFileInput & { id: string | null }

/** Campo numérico que aceita vazio enquanto se digita, sem virar NaN. */
function numero(valor: string): number {
  const n = Number(valor.replace(/\D/g, ""))
  return Number.isFinite(n) ? n : 0
}

export default function FigmaAdminPage() {
  const [itens, setItens] = React.useState<EmEdicao[]>([])
  const [carregando, setCarregando] = React.useState(true)
  const [salvandoId, setSalvandoId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let vivo = true
    listFigmaFiles()
      .then((lista: FigmaFile[]) => {
        if (!vivo) return
        setItens(
          lista.map((f) => ({
            id: f.id,
            title: f.title,
            coverImage: f.coverImage,
            url: f.url,
            likes: f.likes,
            users: f.users,
            order: f.order,
            visible: f.visible,
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

  function alterar<K extends keyof FigmaFileInput>(
    idx: number,
    campo: K,
    valor: FigmaFileInput[K]
  ) {
    setItens((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it))
    )
  }

  function adicionar() {
    setItens((prev) => [
      ...prev,
      { ...EMPTY_FIGMA_FILE, id: null, order: prev.length },
    ])
  }

  async function salvar(idx: number) {
    const item = itens[idx]!
    if (!item.title.trim()) {
      toast.error("Falta o título", {
        description: "O card precisa ao menos do nome do arquivo.",
      })
      return
    }
    setSalvandoId(item.id ?? `novo-${idx}`)
    const { id, ...dados } = item
    try {
      if (id) {
        await updateFigmaFile(id, dados)
      } else {
        const novoId = await createFigmaFile(dados)
        setItens((prev) =>
          prev.map((it, i) => (i === idx ? { ...it, id: novoId } : it))
        )
      }
      toast.success("Salvo", { description: "A página /figma já está atualizada." })
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
        await deleteFigmaFile(item.id)
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
            Figma Community
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Os arquivos que aparecem na página{" "}
            <span className="font-mono">/figma</span>. É cadastro manual porque
            o Figma não expõe API de perfil da Community — os números vêm do
            que estiver no{" "}
            <a
              href={FIGMA_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              seu perfil
            </a>{" "}
            no dia em que você preencher.
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
            Nenhum arquivo cadastrado. A página mostra só o convite pro perfil
            enquanto estiver vazia.
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
                      onCheckedChange={(v: boolean) => alterar(idx, "visible", v)}
                      aria-label={`Mostrar ${item.title || "este arquivo"} na página`}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remover(idx)}
                    aria-label={`Remover ${item.title || "arquivo"}`}
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
                  folder="figma"
                  label="Capa do arquivo"
                  description="A mesma miniatura que aparece na Community."
                />

                <div className="space-y-1.5">
                  <Label htmlFor={`titulo-${idx}`}>Título</Label>
                  <Input
                    id={`titulo-${idx}`}
                    value={item.title}
                    placeholder="Nome do arquivo na Community"
                    onChange={(e) => alterar(idx, "title", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`url-${idx}`}>Link</Label>
                  <Input
                    id={`url-${idx}`}
                    value={item.url}
                    placeholder="https://www.figma.com/community/file/..."
                    onChange={(e) => alterar(idx, "url", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`likes-${idx}`}>Curtidas</Label>
                    <Input
                      id={`likes-${idx}`}
                      inputMode="numeric"
                      value={String(item.likes)}
                      onChange={(e) =>
                        alterar(idx, "likes", numero(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`users-${idx}`}>Pessoas que usaram</Label>
                    <Input
                      id={`users-${idx}`}
                      inputMode="numeric"
                      value={String(item.users)}
                      onChange={(e) =>
                        alterar(idx, "users", numero(e.target.value))
                      }
                    />
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
