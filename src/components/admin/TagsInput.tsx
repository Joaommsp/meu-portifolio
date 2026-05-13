"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  error?: string
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Digite e pressione Enter…",
  maxTags = 10,
  error,
}: Props) {
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    if (value.includes(tag)) return
    if (value.length >= maxTags) return
    onChange([...value, tag])
    setInput("")
  }

  function removeTag(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          error && "border-destructive"
        )}
      >
        {value.map((tag, idx) => (
          <Badge
            key={`${tag}-${idx}`}
            variant="secondary"
            className="gap-1 px-2 py-0.5 font-mono text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              aria-label={`Remover ${tag}`}
              className="-mr-0.5 transition-opacity hover:opacity-70"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={value.length >= maxTags}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags · Enter ou vírgula pra adicionar
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
