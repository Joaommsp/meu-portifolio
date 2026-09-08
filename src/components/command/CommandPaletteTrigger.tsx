"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { useCommandPalette } from "./CommandPaletteProvider"
import { cn } from "@/lib/utils"

/**
 * Botão de ícone que abre o Command Palette.
 *
 * Mesma caixa dos outros ícones do header (GitHub, cor do tema) pra os três
 * ficarem alinhados. O atalho não aparece mais na tela: vive no `title` e no
 * rótulo acessível, já que a pílula "Buscar… Ctrl K" pesava demais no topo.
 */
/* Detecta a plataforma sem setState em efeito (que dispara render em
   cascata): o snapshot do servidor assume Ctrl e o do cliente corrige.
   Mesmo padrão de GithubContributions. */
const SEM_INSCRICAO = () => () => {}
const NO_CLIENTE = () => /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const NO_SERVIDOR = () => false

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  const isMac = React.useSyncExternalStore(
    SEM_INSCRICAO,
    NO_CLIENTE,
    NO_SERVIDOR
  )

  const atalho = isMac ? "⌘K" : "Ctrl+K"

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Abrir busca (${atalho})`}
      title={`Buscar (${atalho})`}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <Search className="size-4" />
    </button>
  )
}
