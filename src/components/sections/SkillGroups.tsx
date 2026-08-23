"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { TECH_ICONS, TECH_COLORS } from "@/components/icons/tech-icons"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useEdgeMask } from "@/hooks/useEdgeMask"
import { useDragScroll } from "@/hooks/useDragScroll"
import { cn } from "@/lib/utils"
import {
  SKILL_GROUPS,
  LEVEL_BARS,
  type Skill,
  type SkillGroup,
} from "@/lib/skills-content"

/** Cor de destaque da carta: do ícone oficial ou definida no conteúdo. */
function corDe(skill: Skill): string {
  if (skill.icon) return TECH_COLORS[skill.icon]
  return skill.color ?? "var(--brand)"
}

/** Iniciais de quem não tem logo próprio — "UI/UX" → "UX", "NestJS" → "NJ". */
function iniciais(nome: string): string {
  const partes = nome.split(/[\s/.]+/).filter(Boolean)
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase()
  return (partes[0]![0]! + partes[1]![0]!).toUpperCase()
}

function SkillCard({ skill }: { skill: Skill }) {
  const cor = corDe(skill)
  const Icon = skill.icon ? TECH_ICONS[skill.icon] : null
  const acesas = LEVEL_BARS[skill.level]

  return (
    <article
      className={cn(
        "relative flex h-full min-w-0 shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-2xl",
        "border border-border bg-card p-5",
        "w-[268px] sm:w-[292px]"
      )}
    >
      {/* glow discreto na cor da tecnologia */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 size-40 opacity-20"
        style={{
          background: `radial-gradient(circle, ${cor}, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background">
          {Icon ? (
            <Icon colored className="size-6" />
          ) : (
            <span
              aria-hidden
              className="font-mono text-[0.7rem] font-semibold tracking-tight"
              style={{ color: cor }}
            >
              {iniciais(skill.name)}
            </span>
          )}
        </span>

        <div className="min-w-0">
          <h4 className="truncate font-display text-lg font-semibold tracking-tight">
            {skill.name}
          </h4>
          <p
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em]"
            style={{ color: cor }}
          >
            {skill.level}
          </p>
          {/* nível em três barras: mais honesto que porcentagem */}
          <div
            className="mt-1 flex gap-[3px]"
            role="img"
            aria-label={`Nível ${skill.level}`}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-[3px] w-4 rounded-full"
                style={{
                  background: i < acesas ? cor : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="relative text-sm leading-relaxed text-muted-foreground">
        {skill.text}
      </p>

      <p className="relative mt-auto border-t border-border pt-3 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground/70">
        {skill.context}
      </p>
    </article>
  )
}

/** Um trilho independente por categoria — mexer num não move os outros. */
function GroupRail({ group, index }: { group: SkillGroup; index: number }) {
  const reduced = usePrefersReducedMotion()
  const railRef = React.useRef<HTMLDivElement>(null)
  const [page, setPage] = React.useState(0)
  const [pageCount, setPageCount] = React.useState(1)
  const [rolavel, setRolavel] = React.useState(false)

  const medir = React.useCallback(() => {
    const el = railRef.current
    if (!el) return
    // ceil, não round: 1,25 tela ainda esconde conteúdo e precisa de 2 páginas.
    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth))
    const max = el.scrollWidth - el.clientWidth
    setPageCount(total)
    // no fim do scroll a página é sempre a última — senão, com páginas
    // fracionárias, o arredondamento nunca chega lá e a seta fica acesa.
    setPage(
      el.scrollLeft >= max - 2
        ? total - 1
        : Math.round(el.scrollLeft / el.clientWidth)
    )
    // rolabilidade vem da medida real, não da contagem de páginas
    setRolavel(max > 2)
  }, [])

  React.useEffect(() => {
    medir()
    const el = railRef.current
    if (!el) return
    el.addEventListener("scroll", medir, { passive: true })
    window.addEventListener("resize", medir)
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => {
      el.removeEventListener("scroll", medir)
      window.removeEventListener("resize", medir)
      obs.disconnect()
    }
  }, [medir])

  function irPara(alvo: number) {
    const el = railRef.current
    if (!el) return
    const limite = Math.max(0, Math.min(alvo, pageCount - 1))
    el.scrollTo({
      left: limite * el.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  const edge = useEdgeMask(railRef)
  useDragScroll(railRef)

  return (
    <div className="mt-12 first:mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {group.label}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} · {group.skills.length}{" "}
          {group.skills.length === 1 ? "ferramenta" : "ferramentas"}
        </span>
      </div>

      <div
        ref={railRef}
        role="region"
        aria-label={`Tecnologias de ${group.label}`}
        tabIndex={0}
        className={cn(
          "mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
        style={edge.style}
      >
        {group.skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>

      {rolavel && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`${group.label}: grupo ${i + 1} de ${pageCount}`}
                aria-current={i === page}
                // alvo de 44px com o ponto visual pequeno
                className="grid h-11 w-9 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === page ? "w-7 bg-brand" : "w-2 bg-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Setas só no desktop: no toque o próprio scroll já navega. */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => irPara(page - 1)}
              disabled={page === 0}
              aria-label={`${group.label}: anteriores`}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => irPara(page + 1)}
              disabled={page >= pageCount - 1}
              aria-label={`${group.label}: próximas`}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SkillGroups() {
  return (
    <div className="container mx-auto max-w-5xl px-5 sm:px-6 select-none">
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          Skills
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Minhas experiências com algumas tecnologias
        </h2>
      </ScrollReveal>
      {SKILL_GROUPS.map((group, i) => (
        <GroupRail key={group.label} group={group} index={i} />
      ))}
    </div>
  )
}
