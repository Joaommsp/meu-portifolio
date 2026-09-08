"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useThemeColor } from "@/contexts/ThemeColorContext"
import { ACCENT_ESCALAS, TINTA_PADRAO } from "@/lib/accent-colors"
import { lerOklch, misturarOklch, oklchParaRgba } from "@/lib/color"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/* Defaults da malha — todos ajustáveis por prop. */
const ESPACAMENTO = 26 // px entre pontos
const ALCANCE = 150 // px de raio em que o cursor ainda afeta um ponto
const RAIO_BASE = 1.15 // px — ponto em repouso
const RAIO_PICO = 4.2 // px — ponto sob o cursor
const SUAVIDADE = 0.14 // fração do caminho percorrida por frame na volta

/* Opacidade nas duas pontas. Em repouso a malha é textura, não desenho. */
const ALFA_BASE = 0.2
const ALFA_PICO = 0.95

/* Retina sim, 3x não: a partir daí o custo por frame não paga o ganho. */
const DPR_MAX = 2

/* Degraus de cor. Os pontos são agrupados por degrau e pintados em lote, então
   este é o número de trocas de fillStyle por frame — 25 em vez de ~900. */
const DEGRAUS = 24

/* Abaixo disso o ponto já chegou: para de contar como "ainda se movendo". */
const EPSILON = 0.001

type Ponto = { x: number; y: number; t: number }

type Props = {
  className?: string
  /** Distância entre pontos, em px. */
  espacamento?: number
  /** Raio de influência do cursor, em px. */
  alcance?: number
  /** Raio do ponto sob o cursor, em px. */
  raioPico?: number
  /** Fração do caminho percorrida por frame ao voltar ao repouso (0–1). */
  suavidade?: number
}

/**
 * Malha de pontos em canvas que floresce sob o cursor: quem está perto cresce,
 * assume a cor do accent e volta suave quando o ponteiro sai.
 *
 * Por que canvas e não DOM: o `ParticlesBackground` cria um elemento por
 * partícula. Aqui são ~900 pontos redesenhados a cada frame — em DOM isso
 * derruba o FPS.
 *
 * CONTRATO COM O PAI: o componente preenche o elemento pai, que precisa ser
 * `relative`. O pai também é a área de hover — os listeners ficam nele, não no
 * canvas, porque o canvas é `pointer-events-none` e o conteúdo da seção
 * engoliria os eventos. Como evento de ponteiro sobe, mover o mouse sobre o
 * texto continua alimentando a malha.
 *
 * DEPENDE DO `ThemeColorProvider` (via `useThemeColor`), diferente dos outros
 * fundos da pasta, que recebem cor por CSS var. É o preço de não poder ler
 * `--brand` do CSS: essa var tem transição de 300ms via @property e
 * `getComputedStyle` devolveria a cor no meio da animação.
 *
 * O rAF roda só enquanto algum ponto ainda se move. Cursor parado dentro da
 * seção não gera frame nenhum: quem reacorda o loop é pointermove, pointerleave
 * ou scroll.
 */
export function DotMesh({
  className,
  espacamento = ESPACAMENTO,
  alcance = ALCANCE,
  raioPico = RAIO_PICO,
  suavidade = SUAVIDADE,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduzido = usePrefersReducedMotion()
  const { accent } = useThemeColor()

  React.useEffect(() => {
    const canvas = canvasRef.current
    const pai = canvas?.parentElement
    if (!canvas || !pai) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Consts locais: o narrowing dos guards acima não alcança as funções
    // declaradas abaixo (que são hoisted), e sem isso o TS reclama de null.
    const pincel = ctx
    const area = pai
    const tela = canvas

    // Cor de repouso vem de `--pattern-line`, o mesmo token que GridBackground
    // e DotPattern usam. Não é registrada via @property, então não tem
    // transição e getComputedStyle devolve o valor final — ao contrário de
    // `--brand`, que por isso vem da escala em TS.
    const tinta =
      lerOklch(getComputedStyle(canvas).getPropertyValue("--pattern-line")) ??
      lerOklch(TINTA_PADRAO)
    const marca = lerOklch(ACCENT_ESCALAS[accent].base)
    if (!tinta || !marca) return

    const paleta = Array.from({ length: DEGRAUS + 1 }, (_, i) => {
      const t = i / DEGRAUS
      return oklchParaRgba(
        misturarOklch(tinta, marca, t),
        ALFA_BASE + (ALFA_PICO - ALFA_BASE) * t
      )
    })

    // Alocados uma vez: repopular por frame geraria 25 arrays de lixo a 60fps.
    const baldes: Ponto[][] = Array.from({ length: DEGRAUS + 1 }, () => [])

    let pontos: Ponto[] = []
    let larg = 0
    let alt = 0
    let raf = 0
    // Cursor em espaço de VIEWPORT; a conversão pro espaço da seção acontece na
    // hora de desenhar. Com o scroll suave do Lenis a página anda sem disparar
    // pointermove, e coordenadas já convertidas ficariam grudadas no conteúdo
    // em vez de seguirem o cursor.
    let cursorX = 0
    let cursorY = 0
    let dentro = false

    function desenhar() {
      pincel.clearRect(0, 0, larg, alt)
      for (const balde of baldes) balde.length = 0
      for (const p of pontos) {
        const balde = baldes[Math.round(p.t * DEGRAUS)]
        if (balde) balde.push(p)
      }

      baldes.forEach((balde, i) => {
        const cor = paleta[i]
        if (!cor || balde.length === 0) return
        pincel.fillStyle = cor
        pincel.beginPath()
        for (const p of balde) {
          const raio = RAIO_BASE + (raioPico - RAIO_BASE) * p.t
          pincel.moveTo(p.x + raio, p.y)
          pincel.arc(p.x, p.y, raio, 0, Math.PI * 2)
        }
        pincel.fill()
      })
    }

    function montar(largura: number, altura: number) {
      if (largura === 0 || altura === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
      larg = largura
      alt = altura
      tela.width = Math.round(larg * dpr)
      tela.height = Math.round(alt * dpr)
      pincel.setTransform(dpr, 0, 0, dpr, 0, 0)

      const colunas = Math.floor(larg / espacamento) + 1
      const linhas = Math.floor(alt / espacamento) + 1
      const sobraX = (larg - (colunas - 1) * espacamento) / 2
      const sobraY = (alt - (linhas - 1) * espacamento) / 2
      pontos = []
      for (let i = 0; i < colunas; i++) {
        for (let j = 0; j < linhas; j++) {
          pontos.push({
            x: sobraX + i * espacamento,
            y: sobraY + j * espacamento,
            t: 0,
          })
        }
      }
      desenhar()
    }

    function passo() {
      const r = area.getBoundingClientRect()
      const mx = cursorX - r.left
      const my = cursorY - r.top
      let vivo = false

      for (const p of pontos) {
        let alvo = 0
        if (dentro) {
          const dx = p.x - mx
          const dy = p.y - my
          const d2 = dx * dx + dy * dy
          if (d2 < alcance * alcance) {
            const k = 1 - Math.sqrt(d2) / alcance
            alvo = k * k // queda quadrática: concentra o brilho perto do cursor
          }
        }
        const dif = alvo - p.t
        if (Math.abs(dif) > EPSILON) {
          p.t += dif * suavidade
          vivo = true
        } else {
          p.t = alvo
        }
      }

      desenhar()
      // Só `vivo`: com o cursor parado nada muda, e manter o loop redesenharia
      // ~900 arcos idênticos a 60fps.
      raf = vivo ? requestAnimationFrame(passo) : 0
    }

    function acordar() {
      if (!raf) raf = requestAnimationFrame(passo)
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
      // A página andou sob um cursor imóvel: a posição relativa mudou.
      if (dentro) acordar()
    }

    const semMouse = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const interativo = !reduzido && !semMouse

    if (interativo) {
      area.addEventListener("pointermove", aoMover)
      area.addEventListener("pointerleave", aoSair)
      window.addEventListener("scroll", aoRolar, { passive: true })
    }

    // O observer dispara já no observe(), então é ele quem faz a montagem
    // inicial — chamar montar() aqui também alocaria os ~900 pontos duas vezes.
    const observador = new ResizeObserver(([entrada]) => {
      if (!entrada) return
      const { width, height } = entrada.contentRect
      montar(width, height)
    })
    observador.observe(area)

    return () => {
      if (interativo) {
        area.removeEventListener("pointermove", aoMover)
        area.removeEventListener("pointerleave", aoSair)
        window.removeEventListener("scroll", aoRolar)
      }
      observador.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [accent, reduzido, espacamento, alcance, raioPico, suavidade])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 size-full",
        className
      )}
    />
  )
}
