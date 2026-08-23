"use client"

import * as React from "react"
import { BookOpen, Headphones, Lightbulb, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getCurrently, saveCurrently } from "@/lib/firebase/currently"
import {
  CURRENTLY_SLOTS,
  CURRENTLY_LABELS,
  EMPTY_CURRENTLY,
  type CurrentlySlot,
  type CurrentlyItem,
} from "@/types/currently"

const ICONES: Record<
  CurrentlySlot,
  React.ComponentType<{ className?: string }>
> = {
  lendo: BookOpen,
  ouvindo: Headphones,
  estudando: Lightbulb,
}

/** Dica de preenchimento por categoria — evita campo genérico demais. */
const EXEMPLOS: Record<CurrentlySlot, { title: string; subtitle: string }> = {
  lendo: { title: "Nome do livro", subtitle: "Autor" },
  ouvindo: { title: "Álbum, playlist ou podcast", subtitle: "Artista ou canal" },
  estudando: { title: "Tecnologia ou assunto", subtitle: "Pra quê / onde aplica" },
}

export default function AtualmenteAdminPage() {
  const [dados, setDados] = React.useState(EMPTY_CURRENTLY)
  const [carregando, setCarregando] = React.useState(true)
  const [salvando, setSalvando] = React.useState(false)

  React.useEffect(() => {
    let vivo = true
    getCurrently()
      .then((v) => {
        if (vivo) setDados(v)
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

  function atualizar(
    slot: CurrentlySlot,
    campo: keyof CurrentlyItem,
    valor: string | boolean
  ) {
    setDados((prev) => {
      const item = { ...prev[slot], [campo]: valor }
      // Escrever um título num card vazio liga a visibilidade: preencher é a
      // intenção de mostrar. Desligar continua sendo escolha manual.
      if (
        campo === "title" &&
        typeof valor === "string" &&
        valor.trim().length > 0 &&
        prev[slot].title.trim().length === 0
      ) {
        item.visible = true
      }
      return { ...prev, [slot]: item }
    })
  }

  async function salvar() {
    setSalvando(true)
    try {
      await saveCurrently(dados)
      toast.success("Salvo", {
        description: "A página /sobre já mostra o conteúdo novo.",
      })
    } catch {
      toast.error("Erro ao salvar", {
        description: "Tente de novo. Se persistir, confira as regras do Firestore.",
      })
    } finally {
      setSalvando(false)
    }
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          O que tá rolando
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Os três cards da página <span className="font-mono">/sobre</span>.
          Desligue o que não estiver atual — card desligado some da página, o
          que é melhor do que deixar informação velha no ar.
        </p>
      </div>

      <div className="space-y-4">
        {CURRENTLY_SLOTS.map((slot) => {
          const Icone = ICONES[slot]
          const item = dados[slot]
          return (
            <section
              key={slot}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icone className="size-4" />
                  </span>
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    {CURRENTLY_LABELS[slot]}
                  </h2>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.visible ? "Visível" : "Oculto"}</span>
                  <Switch
                    checked={item.visible}
                    onCheckedChange={(v: boolean) =>
                      atualizar(slot, "visible", v)
                    }
                    aria-label={`Mostrar o card ${CURRENTLY_LABELS[slot]} na página`}
                  />
                </label>
              </div>

              {!item.visible && item.title.trim().length > 0 && (
                <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  Este card está preenchido, mas oculto — não aparece na página.
                  Ligue o botão acima para publicá-lo.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${slot}-title`}>Título</Label>
                  <Input
                    id={`${slot}-title`}
                    value={item.title}
                    placeholder={EXEMPLOS[slot].title}
                    onChange={(e) => atualizar(slot, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${slot}-subtitle`}>Subtítulo</Label>
                  <Input
                    id={`${slot}-subtitle`}
                    value={item.subtitle}
                    placeholder={EXEMPLOS[slot].subtitle}
                    onChange={(e) => atualizar(slot, "subtitle", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${slot}-link`}>Link (opcional)</Label>
                  <Input
                    id={`${slot}-link`}
                    type="url"
                    value={item.link}
                    placeholder="https://…"
                    onChange={(e) => atualizar(slot, "link", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Com link, o card inteiro vira clicável.
                  </p>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {dados.updatedAt
            ? `Última edição em ${dados.updatedAt.toLocaleDateString("pt-BR")}`
            : "Ainda não salvo"}
        </p>
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Save className="size-4" data-icon="inline-start" />
          )}
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </div>
  )
}
