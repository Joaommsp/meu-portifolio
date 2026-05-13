"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Label } from "@/components/ui/label"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
  folder?: string
  label?: string
  description?: string
}

/**
 * Upload de múltiplas imagens — galeria.
 * Cada upload bem-sucedido vai pro array; thumbnails têm botão pra remover.
 * Re-mounta o ImageUploader via key após cada upload pra resetar o estado.
 */
export function GalleryUploader({
  value,
  onChange,
  max = 20,
  folder = "portfolio/projects/gallery",
  label = "Galeria",
  description,
}: Props) {
  const [resetKey, setResetKey] = React.useState(0)

  function handleAdded(url: string) {
    if (!url || value.includes(url)) return
    onChange([...value, url])
    setResetKey((k) => k + 1) // re-mount ImageUploader
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  const isFull = value.length >= max

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-[0.65rem] uppercase text-muted-foreground">
          {value.length}/{max}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {value.map((url, idx) => (
            <li
              key={`${url}-${idx}`}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-md border border-border bg-card"
              )}
            >
              <img
                src={url}
                alt={`Galeria ${idx + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                onClick={() => remove(idx)}
                aria-label={`Remover imagem ${idx + 1}`}
                className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!isFull && (
        <ImageUploader
          key={resetKey}
          value=""
          onChange={handleAdded}
          folder={folder}
          label=""
        />
      )}
    </div>
  )
}
