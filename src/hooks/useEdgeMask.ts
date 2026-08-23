"use client"

import * as React from "react"

/**
 * Dissolve as bordas de um trilho horizontal em vez de cortá-las em seco,
 * dando a impressão de que o conteúdo continua para fora da tela.
 *
 * Usa `mask-image` em vez de um gradiente sobreposto porque a máscara torna
 * o pixel realmente transparente — funciona sobre fundo translúcido
 * (`bg-card/30`) sem precisar casar cor nenhuma.
 *
 * A máscara é condicional: só existe do lado que tem conteúdo escondido.
 * Fadear a esquerda no início do scroll seria mentira visual.
 *
 * @param fade largura da dissolvência, em px
 */
export function useEdgeMask(
  ref: React.RefObject<HTMLElement | null>,
  fade = 40
) {
  const [edges, setEdges] = React.useState({ start: false, end: false })

  const medir = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    // tolerância de 2px: scroll fracionário não deve manter a máscara acesa
    setEdges({
      start: el.scrollLeft > 2,
      end: el.scrollLeft < max - 2,
    })
  }, [ref])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    medir()
    el.addEventListener("scroll", medir, { passive: true })
    window.addEventListener("resize", medir)
    // conteúdo pode chegar depois (fonte, imagem, dado assíncrono)
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => {
      el.removeEventListener("scroll", medir)
      window.removeEventListener("resize", medir)
      obs.disconnect()
    }
  }, [ref, medir])

  const left = edges.start ? fade : 0
  const right = edges.end ? fade : 0

  const mask =
    left === 0 && right === 0
      ? undefined
      : `linear-gradient(to right, transparent 0, #000 ${left}px, #000 calc(100% - ${right}px), transparent 100%)`

  return {
    /** Aplique no elemento que tem overflow-x: auto. */
    style: mask
      ? ({ maskImage: mask, WebkitMaskImage: mask } as React.CSSProperties)
      : ({} as React.CSSProperties),
    edges,
  }
}
