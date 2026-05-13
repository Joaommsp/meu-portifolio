"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCommandPalette } from "@/components/command/CommandPaletteProvider"

export function NotFoundActions() {
  const { setOpen } = useCommandPalette()

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={() => setOpen(true)}
    >
      <Search className="size-4" data-icon="inline-start" />
      Buscar
    </Button>
  )
}
