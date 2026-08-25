"use client"

import * as React from "react"
import {
  ChevronDown,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  listUsesCategories,
  createUsesCategory,
  updateUsesCategory,
  deleteUsesCategory,
} from "@/lib/firebase/uses"
import {
  EMPTY_USES_CATEGORY,
  EMPTY_USES_ITEM,
  type UsesCategory,
  type UsesCategoryInput,
  type UsesItem,
} from "@/types/uses"
import { cn } from "@/lib/utils"

/** Categoria em edição: existente (com id) ou nova (id nulo até salvar). */
type EmEdicao = UsesCategoryInput & { id: string | null }

function ItemEditor({
  item,
  onAlterar,
  onRemover,
  prefixo,
}: {
  item: UsesItem
  onAlterar: <K extends keyof UsesItem>(campo: K, valor: UsesItem[K]) => void
  onRemover: () => void
  prefixo: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="grid gap-3">
        <div className="flex items-start gap-2">
          <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor={`${prefixo}-nome`} className="text-xs">
                Nome
              </Label>
              <Input
                id={`${prefixo}-nome`}
                value={item.name}
                placeholder="VS Code"
                onChange={(e) => onAlterar("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${prefixo}-url`} className="text-xs">
                Link
              </Label>
              <Input
                id={`${prefixo}-url`}
                value={item.url}
                placeholder="https://…"
                onChange={(e) => onAlterar("url", e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemover}
            aria-label={`Remover ${item.name || "item"}`}
            className="mt-6 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${prefixo}-desc`} className="text-xs">
            Descrição
          </Label>
          <Textarea
            id={`${prefixo}-desc`}
            value={item.description}
            rows={2}
            placeholder="Por que você usa, e pra quê."
            onChange={(e) => onAlterar("description", e.target.value)}
          />
        </div>

        {/* <div>, não <label>: o Switch já trata o clique, e um <label> em
            volta reencaminharia o mesmo clique ao controle — disparando duas
            vezes e voltando ao estado original. Na prática, clicar no switch
            não fazia nada. O `aria-label` já dá o nome acessível. */}
        <div className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={item.starred}
            onCheckedChange={(v: boolean) => onAlterar("starred", v)}
            aria-label={`Marcar ${item.name || "item"} como favorito`}
          />
          <Star
            className={cn(
              "size-3.5",
              item.starred ? "fill-brand text-brand" : "text-muted-foreground"
            )}
          />
          Favorito da categoria
        </div>
      </div>
    </div>
  )
}

export default function UsesAdminPage() {
  const [categorias, setCategorias] = React.useState<EmEdicao[]>([])
  const [carregando, setCarregando] = React.useState(true)
  const [salvandoId, setSalvandoId] = React.useState<string | null>(null)
  const [abertas, setAbertas] = React.useState<Set<number>>(new Set([0]))

  React.useEffect(() => {
    let vivo = true
    listUsesCategories()
      .then((lista: UsesCategory[]) => {
        if (!vivo) return
        setCategorias(
          lista.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            items: c.items,
            order: c.order,
            visible: c.visible,
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

  function alterarCategoria<K extends keyof UsesCategoryInput>(
    idx: number,
    campo: K,
    valor: UsesCategoryInput[K]
  ) {
    setCategorias((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [campo]: valor } : c))
    )
  }

  function alterarItem<K extends keyof UsesItem>(
    idxCat: number,
    idxItem: number,
    campo: K,
    valor: UsesItem[K]
  ) {
    setCategorias((prev) =>
      prev.map((c, i) =>
        i !== idxCat
          ? c
          : {
              ...c,
              items: c.items.map((it, j) =>
                j === idxItem ? { ...it, [campo]: valor } : it
              ),
            }
      )
    )
  }

  function adicionarCategoria() {
    setCategorias((prev) => {
      setAbertas((a) => new Set(a).add(prev.length))
      return [...prev, { ...EMPTY_USES_CATEGORY, id: null, order: prev.length }]
    })
  }

  function adicionarItem(idxCat: number) {
    setCategorias((prev) =>
      prev.map((c, i) =>
        i === idxCat ? { ...c, items: [...c.items, { ...EMPTY_USES_ITEM }] } : c
      )
    )
  }

  function removerItem(idxCat: number, idxItem: number) {
    setCategorias((prev) =>
      prev.map((c, i) =>
        i === idxCat
          ? { ...c, items: c.items.filter((_, j) => j !== idxItem) }
          : c
      )
    )
  }

  function alternar(idx: number) {
    setAbertas((prev) => {
      const nova = new Set(prev)
      if (nova.has(idx)) nova.delete(idx)
      else nova.add(idx)
      return nova
    })
  }

  async function salvar(idx: number) {
    const cat = categorias[idx]!
    if (!cat.title.trim()) {
      toast.error("Falta o título", {
        description: "A categoria precisa de um nome.",
      })
      return
    }
    setSalvandoId(cat.id ?? `nova-${idx}`)
    const { id, ...dados } = cat
    // Item sem nome não vai pro banco: seria uma linha em branco na página.
    const limpo = {
      ...dados,
      items: dados.items.filter((i) => i.name.trim() !== ""),
    }
    try {
      if (id) {
        await updateUsesCategory(id, limpo)
      } else {
        const novoId = await createUsesCategory(limpo)
        setCategorias((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, id: novoId } : c))
        )
      }
      toast.success("Salvo", { description: "A página /uses já está atualizada." })
    } catch {
      toast.error("Erro ao salvar", {
        description: "Confira as regras do Firestore e tente de novo.",
      })
    } finally {
      setSalvandoId(null)
    }
  }

  async function removerCategoria(idx: number) {
    const cat = categorias[idx]!
    if (cat.id) {
      try {
        await deleteUsesCategory(cat.id)
      } catch {
        toast.error("Erro ao remover")
        return
      }
    }
    setCategorias((prev) => prev.filter((_, i) => i !== idx))
    toast.success("Removida")
  }

  if (carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalItens = categorias.reduce((t, c) => t + c.items.length, 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Uses
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Hardware, editor, design e o resto do setup da página{" "}
            <span className="font-mono">/uses</span>. Cada categoria tem sua
            própria lista de itens.
            {categorias.length > 0 && (
              <>
                {" "}
                Hoje: {categorias.length} categorias, {totalItens} itens.
              </>
            )}
          </p>
        </div>
        <Button onClick={adicionarCategoria}>
          <Plus className="size-4" data-icon="inline-start" />
          Categoria
        </Button>
      </div>

      {categorias.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria ainda. A página fica com o aviso de &ldquo;ainda
            montando&rdquo; enquanto estiver vazia.
          </p>
          <Button className="mt-4" variant="outline" onClick={adicionarCategoria}>
            <Plus className="size-4" data-icon="inline-start" />
            Criar a primeira
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categorias.map((cat, idx) => {
            const aberta = abertas.has(idx)
            return (
              <section
                key={cat.id ?? `nova-${idx}`}
                className="rounded-xl border border-border bg-card"
              >
                {/* Cabeçalho: sempre visível, pra dar pra reordenar e ligar/desligar
                    sem abrir a categoria inteira. */}
                <div className="flex items-center gap-3 p-4">
                  <GripVertical
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => alternar(idx)}
                    aria-expanded={aberta}
                    className="flex flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  >
                    <span className="font-medium">
                      {cat.title || (
                        <span className="text-muted-foreground">
                          Categoria sem nome
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cat.items.length}{" "}
                      {cat.items.length === 1 ? "item" : "itens"}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "ml-auto size-4 text-muted-foreground transition-transform",
                        aberta && "rotate-180"
                      )}
                    />
                  </button>

                  <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <span className="hidden sm:inline">
                      {cat.visible ? "Visível" : "Oculta"}
                    </span>
                    <Switch
                      checked={cat.visible}
                      onCheckedChange={(v: boolean) =>
                        alterarCategoria(idx, "visible", v)
                      }
                      aria-label={`Mostrar ${cat.title || "esta categoria"} na página`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removerCategoria(idx)}
                    aria-label={`Remover ${cat.title || "categoria"}`}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {aberta && (
                  <div className="grid gap-4 border-t border-border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`cat-titulo-${idx}`}>Título</Label>
                        <Input
                          id={`cat-titulo-${idx}`}
                          value={cat.title}
                          placeholder="Hardware"
                          onChange={(e) =>
                            alterarCategoria(idx, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cat-ordem-${idx}`}>Ordem</Label>
                        <Input
                          id={`cat-ordem-${idx}`}
                          inputMode="numeric"
                          value={String(cat.order)}
                          onChange={(e) =>
                            alterarCategoria(
                              idx,
                              "order",
                              Number(e.target.value.replace(/\D/g, "")) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`cat-desc-${idx}`}>Descrição</Label>
                      <Input
                        id={`cat-desc-${idx}`}
                        value={cat.description}
                        placeholder="O que tem em cima da mesa enquanto codo."
                        onChange={(e) =>
                          alterarCategoria(idx, "description", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Itens</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarItem(idx)}
                        >
                          <Plus className="size-3.5" data-icon="inline-start" />
                          Item
                        </Button>
                      </div>

                      {cat.items.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                          Categoria sem itens ainda.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cat.items.map((item, j) => (
                            <ItemEditor
                              key={j}
                              item={item}
                              prefixo={`c${idx}-i${j}`}
                              onAlterar={(campo, valor) =>
                                alterarItem(idx, j, campo, valor)
                              }
                              onRemover={() => removerItem(idx, j)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => salvar(idx)}
                        disabled={salvandoId === (cat.id ?? `nova-${idx}`)}
                      >
                        {salvandoId === (cat.id ?? `nova-${idx}`) ? (
                          <Loader2
                            className="size-4 animate-spin"
                            data-icon="inline-start"
                          />
                        ) : (
                          <Save className="size-4" data-icon="inline-start" />
                        )}
                        Salvar categoria
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
