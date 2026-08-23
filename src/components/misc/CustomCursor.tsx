"use client"

import * as React from "react"

/** Elementos que fazem o anel crescer — tudo que é de fato clicável. */
const INTERATIVOS =
  'a, button, [role="button"], [role="tab"], input, select, textarea, label, summary, [data-cursor="hot"]'

/** Trilhos de carousel: o anel cresce e vira dica de arrastar. */
const ARRASTAVEIS = '[role="region"][aria-label], [data-cursor="drag"]'

/**
 * Cursor customizado: um anel que persegue o mouse com física de mola e
 * cresce ao encostar em algo clicável — o cursor confirma "aqui dá pra
 * clicar" antes do clique.
 *
 * Só existe onde faz sentido: monta apenas com mouse de verdade
 * (`hover: hover` + `pointer: fine`), some no toque, e com
 * `prefers-reduced-motion` acompanha sem interpolar.
 *
 * O cursor nativo só é escondido depois que este já está posicionado —
 * inverter a ordem deixa um instante sem cursor nenhum na tela.
 */
export function CustomCursor() {
  const ringRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    if (!fine.matches) return

    const semMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const ring = ringRef.current
    if (!ring) return

    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let vx = 0
    let vy = 0
    let raf = 0
    let rodando = false
    let primeiroMovimento = true

    function loop() {
      if (semMovimento) {
        x = tx
        y = ty
      } else {
        // mola: aceleração proporcional à distância, com amortecimento
        const k = 0.16
        const damp = 0.72
        vx = (vx + (tx - x) * k) * damp
        vy = (vy + (ty - y) * k) * damp
        x += vx
        y += vy
      }

      ring!.style.transform = `translate3d(${x}px, ${y}px, 0)`

      // para o loop quando assentou — evita rAF eterno à toa
      const parado =
        Math.abs(tx - x) < 0.1 &&
        Math.abs(ty - y) < 0.1 &&
        Math.abs(vx) < 0.1 &&
        Math.abs(vy) < 0.1
      if (parado) {
        rodando = false
        return
      }
      raf = requestAnimationFrame(loop)
    }

    function acordar() {
      if (rodando) return
      rodando = true
      raf = requestAnimationFrame(loop)
    }

    function onMove(e: PointerEvent) {
      tx = e.clientX
      ty = e.clientY

      if (primeiroMovimento) {
        // nasce sob o mouse: sem isso o anel "voa" do canto até a posição
        x = tx
        y = ty
        primeiroMovimento = false
        ring!.style.transform = `translate3d(${x}px, ${y}px, 0)`
        // só agora vale revelar o anel e esconder o cursor nativo
        ring!.dataset.pronto = "true"
        document.documentElement.classList.add("cursor-none-root")
      }

      const alvo = e.target as Element | null
      const arrastavel = alvo?.closest?.(ARRASTAVEIS)
      const clicavel = alvo?.closest?.(INTERATIVOS)
      ring!.dataset.estado = arrastavel
        ? "drag"
        : clicavel
          ? "hot"
          : "idle"

      acordar()
    }

    function onLeave() {
      ring!.dataset.fora = "true"
    }
    function onEnter() {
      ring!.dataset.fora = "false"
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    document.addEventListener("pointerenter", onEnter)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
      document.removeEventListener("pointerenter", onEnter)
      document.documentElement.classList.remove("cursor-none-root")
    }
  }, [])

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      data-estado="idle"
      data-fora="false"
      data-pronto="false"
      className="custom-cursor"
    />
  )
}
