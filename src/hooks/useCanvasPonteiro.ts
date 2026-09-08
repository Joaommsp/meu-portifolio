"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/* Retina sim, 3x não: acima disso o custo por quadro não paga o ganho. */
const DPR_MAX = 2

export type AmbienteCanvas = {
  ctx: CanvasRenderingContext2D
  /** Medidas em px de CSS (o contexto já está escalado pelo DPR). */
  larg: number
  alt: number
  /** Ponteiro em coordenadas do elemento. Longe daqui quando `dentro` é falso. */
  mx: number
  my: number
  dentro: boolean
  /** Verdadeiro no primeiro quadro após montar ou redimensionar. */
  remontou: boolean
}

/** Pinta um quadro. Devolve `true` se ainda há movimento a animar. */
export type Pintor = (ambiente: AmbienteCanvas) => boolean

type Opcoes = {
  /** Roda mesmo com o ponteiro parado (ex.: partículas à deriva). */
  continuo?: boolean
}

/**
 * Ciclo de vida de um canvas que reage ao ponteiro.
 *
 * Nasceu de duplicação: `DotMesh` e `SpotlightGrid` repetiam o mesmo
 * maquinário — dimensionar pelo DPR, ouvir o ponteiro, ligar e desligar o rAF.
 * Só o desenho difere, e é isso que `pintar` recebe.
 *
 * CONTRATO COM O PAI: o canvas preenche o elemento pai, que precisa ser
 * `relative`. O pai também é a área de hover — os listeners ficam nele, não no
 * canvas, porque o canvas é `pointer-events-none` e o conteúdo em cima
 * engoliria os eventos. Como evento de ponteiro sobe, mover o mouse sobre o
 * texto continua alimentando o desenho.
 *
 * O rAF roda só enquanto `pintar` disser que há movimento (ou sempre, com
 * `continuo`). Para quando o ponteiro sai, quando o elemento sai da tela e em
 * `prefers-reduced-motion` — nesse caso desenha um quadro parado e encerra.
 */
export function useCanvasPonteiro(pintar: Pintor, { continuo = false }: Opcoes = {}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduzido = usePrefersReducedMotion()

  // Ref para o pintor não entrar nas dependências do efeito: ele é recriado a
  // cada render do consumidor, e o efeito remontaria o canvas em todo render.
  const pintarRef = React.useRef(pintar)
  React.useEffect(() => {
    pintarRef.current = pintar
  })

  React.useEffect(() => {
    const canvas = canvasRef.current
    const pai = canvas?.parentElement
    if (!canvas || !pai) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pincel = ctx
    const area = pai
    const tela = canvas

    let larg = 0
    let alt = 0
    let raf = 0
    let remontou = true
    let visivel = true
    // Ponteiro em coordenadas de VIEWPORT: a conversão acontece no quadro.
    // Com scroll suave a página anda sem disparar pointermove, e coordenadas
    // já convertidas ficariam grudadas no conteúdo em vez de seguir o cursor.
    let cursorX = 0
    let cursorY = 0
    let dentro = false

    function quadro() {
      const r = area.getBoundingClientRect()
      const vivo = pintarRef.current({
        ctx: pincel,
        larg,
        alt,
        mx: dentro ? cursorX - r.left : -99999,
        my: dentro ? cursorY - r.top : -99999,
        dentro,
        remontou,
      })
      remontou = false
      raf = vivo || continuo ? requestAnimationFrame(quadro) : 0
    }

    function acordar() {
      if (!raf) raf = requestAnimationFrame(quadro)
    }

    function montar(largura: number, altura: number) {
      if (largura === 0 || altura === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
      larg = largura
      alt = altura
      tela.width = Math.round(larg * dpr)
      tela.height = Math.round(alt * dpr)
      pincel.setTransform(dpr, 0, 0, dpr, 0, 0)
      remontou = true
      acordar()
    }

    function aoMover(e: PointerEvent) {
      cursorX = e.clientX
      cursorY = e.clientY
      dentro = true
      acordar()
    }
    function aoSair() {
      dentro = false
      acordar()
    }
    function aoRolar() {
      if (dentro) acordar()
    }

    const semMouse = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const interativo = !reduzido && !semMouse

    if (interativo) {
      area.addEventListener("pointermove", aoMover)
      area.addEventListener("pointerleave", aoSair)
      window.addEventListener("scroll", aoRolar, { passive: true })
    }

    // Sem isto o rAF seguiria rodando com o hero fora da tela — e o hero passa
    // a maior parte do tempo fora dela.
    const observadorTela = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada?.isIntersecting ?? true
        if (visivel) acordar()
        else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 }
    )
    observadorTela.observe(area)

    // O observer dispara já no observe(), então é ele quem faz a montagem
    // inicial — chamar montar() aqui também dimensionaria duas vezes.
    const observadorTamanho = new ResizeObserver(([entrada]) => {
      if (!entrada) return
      const { width, height } = entrada.contentRect
      montar(width, height)
    })
    observadorTamanho.observe(area)

    return () => {
      if (interativo) {
        area.removeEventListener("pointermove", aoMover)
        area.removeEventListener("pointerleave", aoSair)
        window.removeEventListener("scroll", aoRolar)
      }
      observadorTela.disconnect()
      observadorTamanho.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [reduzido, continuo])

  return canvasRef
}
