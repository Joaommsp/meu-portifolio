"use client"

import * as React from "react"

import { COMO_TRABALHO } from "@/lib/sobre-content"
import { cn } from "@/lib/utils"

/** "Como eu trabalho" do bento: quatro passos, um aberto por vez. */
export function ComoTrabalho() {
  const [ativo, setAtivo] = React.useState(0)
  const passo = COMO_TRABALHO[ativo]!

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Etapas" className="flex flex-wrap gap-1.5">
        {COMO_TRABALHO.map(({ nome }, i) => (
          <button
            key={nome}
            type="button"
            aria-pressed={i === ativo}
            onClick={() => setAtivo(i)}
            className={cn(
              "min-h-9 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
              i === ativo
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {String(i + 1).padStart(2, "0")} {nome}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="space-y-1.5">
        <p className="font-display text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {passo.destaque}
        </p>
        <p className="text-sm text-muted-foreground">{passo.texto}</p>
      </div>
    </div>
  )
}
