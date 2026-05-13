"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { useCommandPalette } from "./CommandPaletteProvider"
import { cn } from "@/lib/utils"

/**
 * Botão compacto que abre o Command Palette. Mostra o atalho ⌘K
 * em desktop, só ícone em mobile.
 */
export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
  }, [])

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Abrir busca"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground transition-colors",
        "hover:border-border hover:bg-muted/50 hover:text-foreground",
        className
      )}
    >
      <Search className="size-3.5" />
      <span className="hidden md:inline">Buscar…</span>
      <kbd className="ml-2 hidden rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[0.65rem] md:inline">
        {isMac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  )
}
