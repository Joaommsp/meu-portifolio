"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Estado de tocar/pausar de um vídeo que roda sozinho em loop.
 *
 * O vídeo tem `autoPlay`, então ele já começou a tocar quando o React hidrata:
 * o evento `play` disparou antes de existir listener, e o botão ficava dizendo
 * "Reproduzir" com o vídeo rodando. O ref callback (`montar`) roda no commit e
 * lê o estado real do elemento.
 */
export function useVideoPausavel() {
  const ref = React.useRef<HTMLVideoElement | null>(null)
  const [tocando, setTocando] = React.useState(false)

  const montar = React.useCallback((node: HTMLVideoElement | null) => {
    ref.current = node
    if (node) setTocando(!node.paused)
  }, [])

  const alternar = React.useCallback(() => {
    const video = ref.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }, [])

  return {
    ref,
    montar,
    tocando,
    alternar,
    aoTocar: () => setTocando(true),
    aoPausar: () => setTocando(false),
  }
}

/**
 * O botão de pausar/reproduzir.
 *
 * NÃO É OPCIONAL. A WCAG 2.2.2 exige um jeito de parar qualquer coisa que se
 * mova sozinha por mais de 5 segundos, e os vídeos rodam em loop infinito.
 * Alvo de 44px (`size-11`).
 */
export function BotaoPausa({
  tocando,
  onClick,
  className,
}: {
  tocando: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tocando ? "Pausar a animação" : "Reproduzir a animação"}
      className={cn(
        "absolute z-10 size-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-brand",
        className
      )}
    >
      {tocando ? (
        <Pause className="size-4" aria-hidden />
      ) : (
        <Play className="size-4" aria-hidden />
      )}
    </button>
  )
}
