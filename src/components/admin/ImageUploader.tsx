"use client"

import * as React from "react"
import { Upload, X, Loader2, ImageIcon, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  uploadToCloudinary,
  cloudinaryConfigured,
  CloudinaryError,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (url: string) => void
  /** Pasta dentro do bucket Cloudinary (override do default). */
  folder?: string
  label?: string
  description?: string
}

export function ImageUploader({
  value,
  onChange,
  folder,
  label = "Imagem de capa",
  description,
}: Props) {
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)
  const [showUrlInput, setShowUrlInput] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!cloudinaryConfigured) {
      toast.error("Cloudinary não configurado", {
        description:
          "Use o campo URL embaixo ou preencha NEXT_PUBLIC_CLOUDINARY_*.",
      })
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadToCloudinary(file, {
        folder,
        onProgress: (p) => setProgress(p.percent),
      })
      onChange(result.url)
      toast.success("Imagem enviada", {
        description: `${(result.bytes / 1024).toFixed(0)} KB · ${result.width}×${result.height}`,
      })
    } catch (err) {
      const message =
        err instanceof CloudinaryError
          ? err.message
          : "Erro inesperado no upload"
      toast.error("Falha no upload", { description: message })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = "" // permite re-upload do mesmo arquivo
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clearImage() {
    onChange("")
    setShowUrlInput(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {!cloudinaryConfigured && (
          <span className="font-mono text-[0.65rem] uppercase text-warning">
            Cloudinary off — só URL
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value ? (
        // Preview da imagem atual
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          <img
            src={value}
            alt="Preview"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={clearImage}
              aria-label="Remover imagem"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="border-t border-border p-2">
            <p className="truncate font-mono text-[0.65rem] text-muted-foreground">
              {value}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Drop zone */}
          {cloudinaryConfigured && !showUrlInput && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  inputRef.current?.click()
                }
              }}
              className={cn(
                "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 p-6 text-center transition-colors",
                "hover:border-brand/50 hover:bg-card",
                dragOver && "border-brand bg-brand/5"
              )}
              aria-busy={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-6 animate-spin text-brand" />
                  <div className="w-full max-w-xs space-y-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-brand transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {progress.toFixed(0)}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Clica ou arrasta uma imagem
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG, WebP ou GIF · até 10MB
                    </p>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleInputChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
          )}

          {/* URL input */}
          {(showUrlInput || !cloudinaryConfigured) && (
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://… (URL pública da imagem)"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Toggle URL input */}
          {cloudinaryConfigured && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput((s) => !s)}
              className="text-xs"
            >
              {showUrlInput ? (
                <>
                  <ImageIcon className="size-3.5" data-icon="inline-start" />
                  Voltar pro upload
                </>
              ) : (
                <>
                  <LinkIcon className="size-3.5" data-icon="inline-start" />
                  Ou colar URL externa
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
