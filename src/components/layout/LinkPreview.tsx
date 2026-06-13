"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, ArrowRight } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Preview = { label: string; external: boolean }

/** Transforma o href cru num rótulo amigável. Retorna null se não vale exibir. */
function formatHref(raw: string): Preview | null {
  if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return null
  if (raw.startsWith("mailto:")) return { label: raw.slice(7), external: true }
  if (raw.startsWith("tel:")) return { label: raw.slice(4), external: true }

  try {
    const url = new URL(raw, window.location.origin)
    const external = url.origin !== window.location.origin
    if (external) {
      const path = url.pathname === "/" ? "" : url.pathname
      return { label: url.host + path, external }
    }
    return { label: url.pathname + url.search + url.hash, external }
  } catch {
    return { label: raw, external: false }
  }
}

/**
 * Prévia de link flutuante — substitui o status bar nativo do navegador.
 * Aparece no centro inferior da tela com borda na cor de destaque ao
 * passar o mouse (ou focar via teclado) sobre qualquer <a href>.
 *
 * Só ativa em dispositivos com hover fino (desktop) pra não piscar no touch.
 */
export function LinkPreview() {
  const reduced = usePrefersReducedMotion()
  const [preview, setPreview] = React.useState<Preview | null>(null)
  const currentAnchor = React.useRef<HTMLAnchorElement | null>(null)

  React.useEffect(() => {
    const hoverCapable = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches
    if (!hoverCapable) return

    function resolve(target: EventTarget | null) {
      const anchor =
        target instanceof Element
          ? (target.closest("a") as HTMLAnchorElement | null)
          : null
      if (anchor === currentAnchor.current) return
      currentAnchor.current = anchor
      setPreview(anchor ? formatHref(anchor.getAttribute("href") ?? "") : null)
    }

    function clear() {
      currentAnchor.current = null
      setPreview(null)
    }

    const onOver = (e: MouseEvent) => resolve(e.target)
    const onFocus = (e: FocusEvent) => resolve(e.target)

    document.addEventListener("mouseover", onOver)
    document.addEventListener("focusin", onFocus)
    window.addEventListener("blur", clear)
    document.documentElement.addEventListener("mouseleave", clear)

    return () => {
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("focusin", onFocus)
      window.removeEventListener("blur", clear)
      document.documentElement.removeEventListener("mouseleave", clear)
    }
  }, [])

  const Icon = preview?.external ? ArrowUpRight : ArrowRight

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
    >
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex max-w-[90vw] items-center gap-2 rounded-full border border-brand bg-card/90 px-4 py-2 font-mono text-xs text-foreground shadow-lg shadow-brand/10 backdrop-blur-md"
          >
            <Icon className="size-3.5 shrink-0 text-brand" />
            <span className="truncate">{preview.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
