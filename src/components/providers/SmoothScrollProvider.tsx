"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/**
 * Quanto esperar o conteúdo novo ganhar altura antes de restaurar assim mesmo.
 * O `PageTransition` só monta a página seguinte depois do fade-out, então na
 * hora em que a rota muda o documento ainda tem a altura da anterior.
 */
const ESPERA_RESTAURACAO_MS = 900

/**
 * Janela em que o scroll deixa de ser anotado depois de trocar de rota. Cobre
 * o zero que o App Router dispara e o nosso próprio reset — sem ela, esses
 * dois apagariam a posição que a rota anterior tinha acabado de guardar.
 */
const SILENCIO_APOS_ROTA_MS = 700

/**
 * Smooth scroll global via Lenis — e o dono da posição de scroll do site.
 *
 * Respeita `prefers-reduced-motion` (não inicializa), e é por isso que tudo
 * aqui tem os dois caminhos: com Lenis e sem.
 *
 * PÁGINA ABRE NO TOPO. Duas coisas quebravam isso, e precisam das duas peças:
 *
 *  - No recarregamento, o navegador restaura a posição anterior sozinho, antes
 *    de qualquer código rodar. `scrollRestoration = "manual"` desliga isso.
 *  - Na navegação, o App Router chama `window.scrollTo(0, 0)`, mas o Lenis
 *    guarda a POSIÇÃO DELE em memória e no frame seguinte devolve a página pro
 *    ponto onde estava. Quem manda no scroll é quem tem que resetar.
 *
 * MAS VOLTAR NÃO É ABRIR. Com `"manual"` o navegador também para de restaurar
 * no botão voltar, e resetar toda troca de rota jogaria pro topo quem só quis
 * voltar pra lista de onde saiu. Por isso a posição de cada rota fica
 * guardada, e o `popstate` marca a volta, que restaura em vez de zerar.
 *
 * ONDE A POSIÇÃO É LIDA: no evento do PRÓPRIO Lenis, não no `scroll` do DOM.
 * Rolando 7000px, o DOM emitiu dois eventos de scroll — o Lenis move a página
 * pelo rAF dele e o navegador não anuncia frame a frame. Quem escuta o DOM
 * aqui anota quase nada, e o pouco que anota chega atrasado. O `scroll` do DOM
 * fica só pro caminho sem Lenis.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const reduced = usePrefersReducedMotion()
  const pathname = usePathname()
  const lenisRef = React.useRef<Lenis | null>(null)
  const posicoes = React.useRef(new Map<string, number>())
  const rotaAtual = React.useRef(pathname)
  const voltando = React.useRef(false)
  const silencioAte = React.useRef(0)

  const anotar = React.useCallback((y: number) => {
    if (performance.now() < silencioAte.current) return
    posicoes.current.set(rotaAtual.current, y)
  }, [])

  React.useEffect(() => {
    if (!("scrollRestoration" in window.history)) return
    const anterior = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    return () => {
      window.history.scrollRestoration = anterior
    }
  }, [])

  React.useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.1,
    })
    lenisRef.current = lenis
    lenis.on("scroll", () => anotar(lenis.scroll))

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced, anotar])

  React.useEffect(() => {
    const aoVoltar = () => {
      voltando.current = true
    }
    const aoRolar = () => {
      // Com Lenis no ar quem anota é o evento dele; este aqui chegaria tarde e
      // com a posição de antes.
      if (lenisRef.current) return
      anotar(window.scrollY)
    }
    window.addEventListener("popstate", aoVoltar)
    window.addEventListener("scroll", aoRolar, { passive: true })
    return () => {
      window.removeEventListener("popstate", aoVoltar)
      window.removeEventListener("scroll", aoRolar)
    }
  }, [anotar])

  React.useEffect(() => {
    silencioAte.current = performance.now() + SILENCIO_APOS_ROTA_MS
    rotaAtual.current = pathname

    // Link com âncora manda mais: quem pediu `/#secao` quer a seção.
    if (window.location.hash) return

    const alvo = voltando.current ? (posicoes.current.get(pathname) ?? 0) : 0
    voltando.current = false

    const irPara = (y: number) => {
      const lenis = lenisRef.current
      if (lenis) lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    }

    if (alvo === 0) {
      irPara(0)
      return
    }

    // Restaurar agora cortaria no fim da página antiga, que ainda é a que está
    // no DOM. Espera o documento comportar o destino — com teto, pra página
    // que encolheu (post apagado, filtro que voltou vazio) não travar aqui.
    const limite = performance.now() + ESPERA_RESTAURACAO_MS
    let raf = 0
    const tentar = () => {
      const cabe =
        document.documentElement.scrollHeight - window.innerHeight >= alvo
      if (cabe || performance.now() > limite) {
        irPara(alvo)
        return
      }
      raf = requestAnimationFrame(tentar)
    }
    raf = requestAnimationFrame(tentar)
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return <>{children}</>
}
