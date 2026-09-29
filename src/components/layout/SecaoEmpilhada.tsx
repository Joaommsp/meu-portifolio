"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { IndicadorRolagem } from "@/components/layout/IndicadorRolagem"
import { useRolarPara } from "@/components/providers/SmoothScrollProvider"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useTopoFixo } from "@/hooks/useTopoFixo"
import { cn } from "@/lib/utils"

/** Do começo ao fim da cobertura pela seção seguinte. */
const PROGRESSO = [0, 1]
/** Encolhe um pouco ao ser coberta. */
const ESCALA = [1, 0.94]
/** E escurece: opacidade da camada de tinta por cima. */
const SOMBRA = [0, 0.2]
/** Folga pro header fixo ao levar uma âncora ou o foco até a camada. */
const RECUO_HEADER_PX = 80

type Props = {
  children: React.ReactNode
  /**
   * Se esta camada sobe POR CIMA da anterior (topo arredondado + sombra). A
   * primeira, o hero, não cobre nada.
   */
  cobre?: boolean
  /** "Role" + seta no pé da camada (o hero da home). */
  comIndicador?: boolean
}

/**
 * Posição NO FLUXO de um elemento dentro de uma camada da pilha, pronta pra
 * rolar até ele.
 *
 * O navegador mede a caixa PRESA: com a camada seguinte cobrindo, ele acha
 * que o elemento está na tela e não rola (âncora `/#services` clicada lá
 * embaixo, foco de teclado voltando com Shift+Tab). O marcador antes da camada
 * não é sticky, então diz onde ela começa de verdade. O destino também para
 * antes de a camada começar a ser coberta.
 */
function posicaoNoFluxo(alvo: Element): number | null {
  const camada = alvo.closest<HTMLElement>("[data-camada]")
  const inicio = camada?.previousElementSibling
  if (!camada || !(inicio instanceof HTMLElement)) return null
  const inicioY = inicio.getBoundingClientRect().top + window.scrollY
  const deslocamento = alvo.getBoundingClientRect().top - camada.getBoundingClientRect().top
  const antesDeCobrir = inicioY + camada.offsetHeight - window.innerHeight
  return Math.max(0, Math.min(inicioY + deslocamento - RECUO_HEADER_PX, Math.max(inicioY, antesDeCobrir)))
}

/**
 * Uma camada da pilha da home: cada seção sobe e cobre a anterior, no formato
 * da landing do front-barber.
 *
 * - Sem `z-index`: elementos posicionados pintam na ordem do DOM, então a
 *   seguinte cobre a anterior. Fundo opaco obrigatório, senão a de baixo
 *   aparece através; `overflow-clip` recorta no arredondado o fundo próprio
 *   das seções (bordas, `bg-card`).
 * - `top` vem do `useTopoFixo`: seção mais alta que a tela prende com top
 *   negativo, pra ser lida inteira antes de ser coberta.
 * - O progresso da cobertura é medido numa sentinela logo DEPOIS da seção:
 *   medir a própria seção não serve, presa a posição dela não muda.
 * - Encolhe a partir do topo (`origin-top`): do centro, abria uma faixa em
 *   cima por onde aparecia a seção de baixo.
 * - Movimento reduzido: a sobreposição continua (é layout, não animação);
 *   saem a escala e o escurecimento, e o CSS garante isso antes da hidratação.
 * - Seção que não renderiza nada (sem posts, sem jogos) some com a camada
 *   (`has-[[data-conteudo]:empty]:hidden`), em vez de virar folha em branco.
 * - Marcador, camada e sentinela são irmãos, SEM wrapper: o sticky só prende
 *   dentro do pai, e um pai do tamanho da própria camada nunca deixaria ela
 *   prender.
 */
export function SecaoEmpilhada({ children, cobre = true, comIndicador = false }: Props) {
  const camada = React.useRef<HTMLDivElement>(null)
  const sonda = React.useRef<HTMLDivElement>(null)
  const sentinela = React.useRef<HTMLDivElement>(null)
  const topo = useTopoFixo(camada, sonda)
  const reduzido = usePrefersReducedMotion()
  const rolarPara = useRolarPara()

  const { scrollYProgress } = useScroll({
    target: sentinela,
    offset: ["start end", "start start"],
  })
  const scale = useTransform(scrollYProgress, PROGRESSO, ESCALA)
  const opacity = useTransform(scrollYProgress, PROGRESSO, SOMBRA)

  /* Foco de teclado numa camada já coberta: leva a página até ela. */
  const revelarFoco = (evento: React.FocusEvent) => {
    const base = sentinela.current?.getBoundingClientRect().top
    if (base === undefined || base >= window.innerHeight) return
    const y = posicaoNoFluxo(evento.target)
    if (y !== null) rolarPara(y, { imediato: true })
  }

  return (
    <>
      <div aria-hidden className="h-0" />
      <motion.div
        ref={camada}
        data-camada
        onFocusCapture={revelarFoco}
        style={reduzido ? { top: topo } : { top: topo, scale }}
        className={cn(
          "sticky origin-top motion-reduce:transform-none! has-[[data-conteudo]:empty]:hidden",
          cobre ? "folha-conteudo overflow-clip" : "fundo-pagina"
        )}
      >
        <div
          ref={sonda}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 h-(--altura-palco) w-px"
        />
        <div data-conteudo>{children}</div>
        {comIndicador && <IndicadorRolagem />}
        {/* Sempre no DOM: o HTML do servidor e o do cliente têm a mesma
            estrutura; só a opacidade muda. */}
        <motion.div
          aria-hidden
          style={reduzido ? undefined : { opacity }}
          className={cn(
            "pointer-events-none absolute inset-0 bg-foreground opacity-0 motion-reduce:hidden",
            cobre && "rounded-t-[inherit]"
          )}
        />
      </motion.div>
      <div ref={sentinela} aria-hidden className="h-0" />
    </>
  )
}

/**
 * Âncora pra uma seção da pilha, clicada na própria página (o "Serviços" do
 * menu, estando na home). O Next rolaria pela caixa presa e pararia com a
 * seção ainda coberta; aqui a rolagem vai pela posição no fluxo.
 *
 * Vindo de outra rota não precisa: a página abre no topo, nada está preso, e o
 * caminho normal do Next acerta.
 */
export function AncorasDaPilha() {
  const rolarPara = useRolarPara()

  React.useEffect(() => {
    const aoClicar = (evento: MouseEvent) => {
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      const link = (evento.target as Element | null)?.closest?.("a[href]")
      if (!(link instanceof HTMLAnchorElement)) return
      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return
      const alvo = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      const y = alvo && posicaoNoFluxo(alvo)
      if (y === null || y === undefined) return
      evento.preventDefault()
      history.pushState(null, "", url.hash)
      rolarPara(y)
    }
    // Captura: roda antes do onClick do <Link>, que respeita o preventDefault.
    document.addEventListener("click", aoClicar, true)
    return () => document.removeEventListener("click", aoClicar, true)
  }, [rolarPara])

  return null
}
