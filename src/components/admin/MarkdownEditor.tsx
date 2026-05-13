"use client"

import * as React from "react"
import { Eye, Pencil, Columns2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownContent } from "@/components/markdown/MarkdownContent"
import { cn } from "@/lib/utils"

type Mode = "edit" | "preview" | "split"

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
  error?: string
}

const MODES: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "edit", label: "Editor", icon: Pencil },
  { id: "split", label: "Split", icon: Columns2 },
  { id: "preview", label: "Preview", icon: Eye },
]

export function MarkdownEditor({
  value,
  onChange,
  label = "Conteúdo",
  placeholder = "Escreva em markdown — # heading, **bold**, ```code```…",
  rows = 16,
  error,
}: Props) {
  const [mode, setMode] = React.useState<Mode>("edit")

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {label && <Label>{label}</Label>}
        <div className="flex rounded-md border border-border bg-card p-0.5">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3",
          mode === "split" && "md:grid-cols-2"
        )}
      >
        {(mode === "edit" || mode === "split") && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              "resize-y font-mono text-sm leading-relaxed",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div
            className={cn(
              "rounded-md border border-border bg-card p-4 overflow-auto",
              mode === "split" ? "min-h-[400px]" : "min-h-[400px]"
            )}
            style={{ maxHeight: `${rows * 1.5}rem` }}
          >
            {value.trim() ? (
              <MarkdownContent>{value}</MarkdownContent>
            ) : (
              <p className="text-sm text-muted-foreground">
                Preview vazio — comece a escrever no editor.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Suporta markdown completo + GFM (tabelas, listas com checkbox, autolinks).
        Code blocks com ``` ` ``` ` ` `language ``` ` ``` ` ` ` `.
      </p>
    </div>
  )
}
