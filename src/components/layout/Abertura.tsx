"use client"

import * as React from "react"

import { CHAVE_ABERTURA } from "@/components/layout/abertura-script"

/** Tempo mínimo da contagem até 100, em ms. */
const DURACAO_CONTAGEM = 1300
/** Teto: se a página demorar a carregar, a abertura sai assim mesmo. */
const TETO_MS = 4000
/** Raio do anel no viewBox de 132. */
const RAIO = 60
const CIRCUNFERENCIA = 2 * Math.PI * RAIO


/**
 * Abertura do site: um anel no accent conta a página de 0 a 100 e voa até o
 * logo do cabeçalho, onde se desfaz. Só na primeira visita da sessão.
 *
 * O logo é achado por `[data-logo]`; sem ele, o anel só some no lugar. O
 * script que pula a abertura mora no layout (`SCRIPT_ABERTURA`), e a camada
 * tem saída só em CSS (`abertura-sai`) caso o JS quebre antes de tirá-la.
 */
export function Abertura() {
  const [fim, setFim] = React.useState(false)
  const camada = React.useRef<HTMLDivElement>(null)
  const anel = React.useRef<HTMLDivElement>(null)
  const arco = React.useRef<SVGCircleElement>(null)
  const numero = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    // Já vista, ou movimento reduzido: o CSS esconde a camada; nada a animar.
    if (document.documentElement.classList.contains("sem-abertura")) return
    try {
      sessionStorage.setItem(CHAVE_ABERTURA, "1")
    } catch {}

    const inicio = performance.now()
    let carregou = document.readyState === "complete"
    const aoCarregar = () => {
      carregou = true
    }
    window.addEventListener("load", aoCarregar)

    let quadro = 0
    let saida = 0
    const passo = (agora: number) => {
      const decorrido = agora - inicio
      // segura em 90% até a página terminar de carregar (ou estourar o teto)
      const limite = carregou || decorrido > TETO_MS ? 1 : 0.9
      const p = Math.min(limite, decorrido / DURACAO_CONTAGEM)
      const e = 1 - Math.pow(1 - p, 3)
      if (arco.current) arco.current.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - e))
      if (numero.current) numero.current.textContent = String(Math.round(e * 100))
      if (p < 1) {
        quadro = requestAnimationFrame(passo)
        return
      }
      voarParaOLogo()
    }

    const voarParaOLogo = () => {
      const a = anel.current
      const logo = document.querySelector<HTMLElement>("[data-logo]")
      if (a && logo) {
        const ra = a.getBoundingClientRect()
        const rl = logo.getBoundingClientRect()
        const dx = rl.left + rl.width / 2 - (ra.left + ra.width / 2)
        const dy = rl.top + rl.height / 2 - (ra.top + ra.height / 2)
        a.style.transform = `translate(${dx}px, ${dy}px) scale(${rl.width / ra.width})`
        a.style.opacity = "0"
      }
      camada.current?.classList.add("opacity-0", "pointer-events-none")
      saida = window.setTimeout(() => setFim(true), 900)
    }

    quadro = requestAnimationFrame(passo)
    return () => {
      cancelAnimationFrame(quadro)
      window.clearTimeout(saida)
      window.removeEventListener("load", aoCarregar)
    }
  }, [])

  if (fim) return null

  return (
    <>
      <noscript>
        <style>{".abertura{display:none}"}</style>
      </noscript>
      <div
        ref={camada}
        aria-hidden
        className="abertura fixed inset-0 z-[200] grid place-items-center bg-background transition-opacity delay-300 duration-500 animate-[abertura-sai_0s_6s_forwards] [.sem-abertura_&]:hidden"
      >
        <div
          ref={anel}
          className="relative size-32 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] [transition-delay:0ms,500ms]"
        >
          <svg viewBox="0 0 132 132" className="size-full -rotate-90">
            <circle cx="66" cy="66" r={RAIO} fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              ref={arco}
              cx="66"
              cy="66"
              r={RAIO}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA}
            />
          </svg>
          <span
            ref={numero}
            className="absolute inset-0 grid place-items-center font-mono text-xl tabular-nums"
          >
            0
          </span>
        </div>
      </div>
    </>
  )
}
