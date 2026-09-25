"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { TECH_ICONS, TECH_COLORS } from "@/components/icons/tech-icons"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useEdgeMask } from "@/hooks/useEdgeMask"
import { useDragScroll } from "@/hooks/useDragScroll"
import { cn } from "@/lib/utils"
import { STACK, STACK_COUNT } from "@/lib/stack-content"

/**
 * Cover-flow da stack: cada tecnologia é uma carta, e a carta em foco tinge
 * o fundo da seção com a cor da própria marca. Navegação por scroll-snap —
 * o swipe no toque vem do browser, sem JS de drag.
 */
export function Skills() {
  const reduced = usePrefersReducedMotion()
  const railRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)

  // A carta ativa é a que estiver mais perto do centro do trilho.
  const aoRolar = React.useCallback(() => {
    const el = railRef.current
    if (!el) return
    const centro = el.scrollLeft + el.clientWidth / 2
    let melhor = 0
    let menorDist = Infinity
    Array.from(el.children).forEach((filho, i) => {
      const node = filho as HTMLElement
      const meio = node.offsetLeft + node.offsetWidth / 2
      const dist = Math.abs(meio - centro)
      if (dist < menorDist) {
        menorDist = dist
        melhor = i
      }
    })
    setActive(melhor)
  }, [])

  React.useEffect(() => {
    const el = railRef.current
    if (!el) return
    aoRolar()
    el.addEventListener("scroll", aoRolar, { passive: true })
    window.addEventListener("resize", aoRolar)
    return () => {
      el.removeEventListener("scroll", aoRolar)
      window.removeEventListener("resize", aoRolar)
    }
  }, [aoRolar])

  function irPara(i: number) {
    const el = railRef.current
    if (!el) return
    const alvo = el.children[Math.max(0, Math.min(i, STACK_COUNT - 1))] as
      | HTMLElement
      | undefined
    if (!alvo) return
    el.scrollTo({
      left: alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  const edge = useEdgeMask(railRef)
  useDragScroll(railRef)

  const corAtiva = TECH_COLORS[STACK[active]!]

  return (
    <section
      id="skills"
      className="relative overflow-hidden border-y border-border bg-card/30 py-16 select-none md:py-24"
    >
      {/* Wash: assume a cor da marca em foco. Mais lento que a carta, pra cor
          chegar depois do movimento em vez de competir com ele. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-500 ease-out"
        style={{
          background: `radial-gradient(600px 320px at 40% 38%, ${corAtiva}22, transparent 70%)`,
        }}
      />

      <div className="relative">
        <div className="container mx-auto max-w-6xl px-5 sm:px-6">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              03 · Stack
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Tecnologias do dia-a-dia
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 max-w-xl text-muted-foreground">
              As ferramentas que eu uso pra entregar projeto em produção.
            </p>
          </ScrollReveal>
        </div>

        {/* Trilho.
            O padding lateral é meia tela menos meia carta: sem ele, a primeira
            e a última nunca chegam ao centro e ficam inalcançáveis pelo snap. */}
        <div
          ref={railRef}
          role="region"
          aria-label="Tecnologias que eu uso"
          tabIndex={0}
          className={cn(
            "mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 select-none",
            "px-[calc(50%-75px)] sm:px-[calc(50%-85px)]",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
          style={edge.style}
        >
          {STACK.map((name, i) => {
            const Icon = TECH_ICONS[name]
            const cor = TECH_COLORS[name]
            const on = i === active
            return (
              <button
                key={name}
                type="button"
                onClick={() => irPara(i)}
                aria-label={name}
                aria-current={on}
                className={cn(
                  "group relative flex shrink-0 snap-center flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border",
                  "size-[150px] outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:size-[170px]",
                  // profundidade por escala + opacidade (blur suja no escuro)
                  !reduced && "transition-[transform,opacity,border-color]",
                  "duration-[380ms] ease-[cubic-bezier(.23,1,.32,1)]",
                  on
                    ? "border-border/80 bg-card opacity-100 sm:scale-100"
                    : "border-border bg-card/60 opacity-80 sm:scale-[0.9] sm:opacity-70"
                )}
              >
                {/* glow da marca, só na carta em foco */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-16 h-36 transition-opacity duration-[400ms]"
                  style={{
                    background: `radial-gradient(circle, ${cor}, transparent 70%)`,
                    opacity: on ? 0.3 : 0,
                  }}
                />

                <Icon
                  colored
                  className={cn(
                    "relative",
                    !reduced && "transition-all duration-[320ms]",
                    on ? "size-14" : "size-11"
                  )}
                />

                <span
                  className={cn(
                    "relative text-center font-display font-semibold tracking-tight",
                    !reduced && "transition-all duration-[320ms]",
                    on ? "text-lg" : "text-base text-muted-foreground"
                  )}
                >
                  {name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Controles */}
        <div className="container mx-auto mt-6 flex max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          {/* Desktop: 13 dots cabem e o ponto colorido vale o detalhe. */}
          <div className="hidden items-center sm:flex">
            {STACK.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ir para ${name}`}
                aria-current={i === active}
                // alvo de 44px de altura; o ponto visual fica pequeno
                className="grid h-11 w-[22px] place-items-center outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={
                    i === active
                      ? { width: 22, background: TECH_COLORS[name] }
                      : { width: 6, background: "var(--muted-foreground)", opacity: 0.3 }
                  }
                />
              </button>
            ))}
          </div>

          {/* Mobile: 13 dots não cabem na linha — barra de progresso conta a
              mesma coisa e ainda assume a cor da tech em foco. */}
          <div className="flex flex-1 items-center gap-3 sm:hidden">
            <div className="h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-muted-foreground/20">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((active + 1) / STACK_COUNT) * 100}%`,
                  background: corAtiva,
                }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(active + 1).padStart(2, "0")}/{STACK_COUNT}
            </span>
          </div>

          {/* Dica do gesto: só no toque, e só antes de sair da primeira carta. */}
          {active === 0 && (
            <span
              aria-hidden="true"
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:hidden"
            >
              Arrasta
              <ChevronRight className="size-3" />
            </span>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => irPara(active - 1)}
              disabled={active === 0}
              aria-label="Tecnologia anterior"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => irPara(active + 1)}
              disabled={active >= STACK_COUNT - 1}
              aria-label="Próxima tecnologia"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
