"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  useThemeColor,
  ACCENTS,
  type Accent,
} from "@/contexts/ThemeColorContext"
import { cn } from "@/lib/utils"

const ACCENT_DATA: Record<Accent, { label: string; oklch: string }> = {
  green: { label: "Verde", oklch: "oklch(0.78 0.22 145)" },
  blue: { label: "Azul", oklch: "oklch(0.70 0.20 250)" },
  purple: { label: "Roxo", oklch: "oklch(0.70 0.22 290)" },
  red: { label: "Vermelho", oklch: "oklch(0.70 0.22 25)" },
  orange: { label: "Laranja", oklch: "oklch(0.78 0.19 60)" },
  cyan: { label: "Ciano", oklch: "oklch(0.82 0.16 195)" },
  pink: { label: "Rosa", oklch: "oklch(0.75 0.22 340)" },
  yellow: { label: "Amarelo", oklch: "oklch(0.90 0.18 95)" },
}

type Props = {
  align?: "start" | "center" | "end"
}

export function ThemeColorSwitcher({ align = "end" }: Props) {
  const { accent, setAccent } = useThemeColor()
  const [mounted, setMounted] = React.useState(false)

  // Após mount, é seguro derivar texto a partir do accent (DOM já estável)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentLabel = ACCENT_DATA[accent].label
  const triggerLabel = mounted
    ? `Trocar cor de destaque · atual: ${currentLabel}`
    : "Trocar cor de destaque"

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={triggerLabel}
          />
        }
      >
        <Palette className="size-4" />
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-3">
        <div className="space-y-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Cor de destaque
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((c) => {
              const { label, oklch } = ACCENT_DATA[c]
              const active = accent === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={label}
                  aria-pressed={active}
                  data-active={active}
                  className={cn(
                    "group relative flex size-9 items-center justify-center rounded-full",
                    "ring-2 ring-transparent ring-offset-2 ring-offset-popover transition-transform",
                    "hover:scale-110 focus-visible:outline-none focus-visible:ring-foreground/40",
                    "data-[active=true]:ring-foreground"
                  )}
                  style={{ background: oklch }}
                >
                  <span className="sr-only">{label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Selecionado:{" "}
            <span className="text-brand font-medium">{currentLabel}</span>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
