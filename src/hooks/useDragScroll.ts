"use client"

import * as React from "react"

/** Movimento a partir do qual o gesto vira arrasto, e não clique. */
const LIMIAR = 5

/**
 * Permite arrastar um trilho horizontal com o mouse, como já se faz com o
 * dedo no toque. No celular não faz nada: lá o scroll nativo é melhor que
 * qualquer emulação.
 *
 * Dois cuidados que fazem a diferença:
 *
 * - `scroll-snap` é desligado durante o arrasto. Com ele ligado, o trilho
 *   briga com o ponteiro e o movimento fica travado; ao soltar, o snap volta
 *   e assenta a carta.
 * - Um clique só é cancelado se o ponteiro andou mais que o limiar. Assim
 *   arrastar não dispara o link do card, e clicar continua funcionando.
 */
export function useDragScroll(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

    let arrastando = false
    let houveArrasto = false
    let xInicial = 0
    let scrollInicial = 0
    let snapOriginal = ""

    function onPointerDown(e: PointerEvent) {
      // só botão principal, e nunca em cima de um controle de formulário
      if (e.button !== 0) return
      const alvo = e.target as Element | null
      if (alvo?.closest("input, textarea, select")) return

      arrastando = true
      houveArrasto = false
      xInicial = e.clientX
      scrollInicial = el!.scrollLeft
      snapOriginal = el!.style.scrollSnapType
      el!.style.cursor = "grabbing"
    }

    function onPointerMove(e: PointerEvent) {
      if (!arrastando) return
      const delta = e.clientX - xInicial
      if (!houveArrasto && Math.abs(delta) > LIMIAR) {
        houveArrasto = true
        // desliga o snap só depois de confirmar que é arrasto
        el!.style.scrollSnapType = "none"
        el!.setPointerCapture?.(e.pointerId)
      }
      if (houveArrasto) {
        e.preventDefault()
        el!.scrollLeft = scrollInicial - delta
      }
    }

    function encerrar(e: PointerEvent) {
      if (!arrastando) return
      arrastando = false
      el!.style.cursor = ""
      el!.releasePointerCapture?.(e.pointerId)
      if (houveArrasto) {
        // devolve o snap: ele assenta a carta mais próxima
        el!.style.scrollSnapType = snapOriginal
      }
    }

    // Roda na fase de captura para impedir o clique antes de ele chegar ao card.
    function onClickCapture(e: MouseEvent) {
      if (houveArrasto) {
        e.preventDefault()
        e.stopPropagation()
        houveArrasto = false
      }
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", encerrar)
    el.addEventListener("pointercancel", encerrar)
    el.addEventListener("pointerleave", encerrar)
    el.addEventListener("click", onClickCapture, true)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", encerrar)
      el.removeEventListener("pointercancel", encerrar)
      el.removeEventListener("pointerleave", encerrar)
      el.removeEventListener("click", onClickCapture, true)
    }
  }, [ref])
}
