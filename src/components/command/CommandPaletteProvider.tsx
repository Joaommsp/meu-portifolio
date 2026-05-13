"use client"

import * as React from "react"

import { CommandPalette } from "./CommandPalette"

type CommandPaletteContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext =
  React.createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => setOpen((v) => !v), [])

  // Atalho global: ⌘K (Mac) / Ctrl+K (Windows/Linux)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  const value = React.useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle]
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error(
      "useCommandPalette deve ser usado dentro de CommandPaletteProvider"
    )
  }
  return ctx
}
