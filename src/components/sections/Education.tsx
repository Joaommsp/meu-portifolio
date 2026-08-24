"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useEdgeMask } from "@/hooks/useEdgeMask"
import { useDragScroll } from "@/hooks/useDragScroll"
import { cn } from "@/lib/utils"
import {
  DEGREE,
  COURSES,
  COURSE_COUNT,
  type Course,
} from "@/lib/education-content"

/* ─────────────────────────────────────────────────────────── */
/* Wireframe do certificado                                     */
/* ─────────────────────────────────────────────────────────── */

/**
 * Certificado desenhado em SVG — moldura dupla, selo com fita e marcas de
 * registro. Os traços de destaque usam `currentColor`, então acompanham o
 * accent escolhido no site. `variant` troca a proporção: retrato na coluna
 * do desktop, paisagem quando empilha no mobile.
 */
function CertificateWireframe({
  variant = "portrait",
}: {
  variant?: "portrait" | "landscape"
}) {
  const landscape = variant === "landscape"
  return (
    <svg
      viewBox={landscape ? "0 0 200 96" : "0 0 200 150"}
      className="h-auto w-full text-brand"
      role="img"
      aria-label="Ilustração de um certificado"
    >
      {landscape ? (
        <>
          <path
            d="M6 12V6h6M188 6h6v6M194 84v6h-6M12 90H6v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
          />
          <rect
            x="12" y="12" width="176" height="72" rx="3"
            fill="none" className="stroke-border" strokeWidth="1" strokeDasharray="3 3"
          />
          <rect
            x="18" y="18" width="164" height="60" rx="2"
            fill="none" className="stroke-border" strokeWidth="1"
          />
          <rect x="90" y="26" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.55" />
          <rect x="60" y="36" width="80" height="6" rx="3" className="fill-muted-foreground/40" />
          <rect x="50" y="49" width="100" height="2.5" rx="1.25" className="fill-muted-foreground/30" />
          <rect x="62" y="56" width="76" height="2.5" rx="1.25" className="fill-muted-foreground/20" />
          <g transform="translate(48,68)">
            <path d="M-4 4 L-7 14 L0 10 L7 14 L4 4 Z" fill="currentColor" opacity="0.22" />
            <circle cx="0" cy="1" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
            <circle cx="0" cy="1" r="2" fill="currentColor" opacity="0.7" />
          </g>
          <rect x="100" y="68" width="44" height="2" rx="1" className="fill-muted-foreground/25" />
        </>
      ) : (
        <>
          <path
            d="M6 14V6h8M186 6h8v8M194 136v8h-8M14 144H6v-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
          />
          <rect
            x="14" y="14" width="172" height="122" rx="3"
            fill="none" className="stroke-border" strokeWidth="1" strokeDasharray="3 3"
          />
          <rect
            x="21" y="21" width="158" height="108" rx="2"
            fill="none" className="stroke-border" strokeWidth="1"
          />
          <rect x="88" y="32" width="24" height="4" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="52" y="46" width="96" height="7" rx="3.5" className="fill-muted-foreground/40" />
          <rect x="44" y="62" width="112" height="3" rx="1.5" className="fill-muted-foreground/30" />
          <rect x="56" y="70" width="88" height="3" rx="1.5" className="fill-muted-foreground/25" />
          <rect x="66" y="78" width="68" height="3" rx="1.5" className="fill-muted-foreground/20" />
          <g transform="translate(52,104)">
            <path d="M-5 6 L-9 20 L0 15 L9 20 L5 6 Z" fill="currentColor" opacity="0.22" />
            <circle cx="0" cy="2" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
            <circle cx="0" cy="2" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <circle cx="0" cy="2" r="2.5" fill="currentColor" opacity="0.7" />
          </g>
          <rect x="104" y="108" width="52" height="2" rx="1" className="fill-muted-foreground/25" />
          <rect x="112" y="115" width="36" height="2" rx="1" className="fill-muted-foreground/15" />
        </>
      )}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* Card de curso                                                */
/* ─────────────────────────────────────────────────────────── */

/** Card vira link só quando existe credencial pública pra abrir. */
function CourseCard({ course }: { course: Course }) {
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-2">
        <time className="font-mono text-[0.65rem] uppercase tracking-widest text-brand">
          {course.issued}
        </time>
        {course.credentialUrl && (
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
        )}
      </div>
      <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
        {course.title}
      </h3>
      <p className="text-sm text-muted-foreground">{course.issuer}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {course.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  )

  const base =
    "group flex h-full min-w-0 snap-start flex-col gap-2 rounded-xl border border-border bg-card p-5"

  if (!course.credentialUrl) {
    return <div className={base}>{conteudo}</div>
  }

  return (
    <a
      href={course.credentialUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver credencial: ${course.title} — ${course.issuer}`}
      className={cn(
        base,
        "outline-none transition-colors hover:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/50"
      )}
    >
      {conteudo}
    </a>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* Seção                                                        */
/* ─────────────────────────────────────────────────────────── */

export function Education() {
  const reduced = usePrefersReducedMotion()
  const railRef = React.useRef<HTMLDivElement>(null)
  const [page, setPage] = React.useState(0)
  const [pageCount, setPageCount] = React.useState(1)
  /** 0–1, acompanha o scroll real do trilho (usado quando há muitas páginas). */
  const [progress, setProgress] = React.useState(0)

  /** Acima disso, dots viram poluição visual — troca por barra de progresso. */
  const MAX_DOTS = 4

  // Páginas = quantas "telas" de scroll o trilho tem. Recalcula no resize
  // porque a quantidade de cards visíveis muda por breakpoint.
  const medir = React.useCallback(() => {
    const el = railRef.current
    if (!el) return
    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth))
    const max = el.scrollWidth - el.clientWidth
    setPageCount(total)
    // no fim do scroll a página é sempre a última — com páginas fracionárias
    // o arredondamento nunca chegaria lá.
    setPage(
      el.scrollLeft >= max - 2
        ? total - 1
        : Math.round(el.scrollLeft / el.clientWidth)
    )
    setProgress(max > 0 ? el.scrollLeft / max : 0)
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

  const edge = useEdgeMask(railRef)
  useDragScroll(railRef)

  function irPara(alvo: number) {
    const el = railRef.current
    if (!el) return
    const limite = Math.max(0, Math.min(alvo, pageCount - 1))
    el.scrollTo({
      left: limite * el.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  return (
    <section className="container mx-auto max-w-5xl px-5 py-24 sm:px-6">
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          Formação
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Formação acadêmica e cursos
        </h2>
      </ScrollReveal>

      {/* Diploma em destaque */}
      <ScrollReveal delay={0.1}>
        <DegreeCard />
      </ScrollReveal>

      {/* Trilho de cursos */}
      <div className="mt-12 select-none">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Cursos e certificações
          </p>
          <p className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
            {String(COURSE_COUNT).padStart(2, "0")} no total
          </p>
        </div>

        <div
          ref={railRef}
          role="region"
          aria-label="Cursos e certificações"
          tabIndex={0}
          className={cn(
            "mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 select-none",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
            // esconde a barra nativa sem perder o scroll
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
          style={edge.style}
        >
          {COURSES.map((course) => (
            <div
              key={`${course.title}-${course.issued}`}
              className="w-[74%] shrink-0 sm:w-[46%] lg:w-[31%]"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Controles */}
        <div className="mt-5 flex items-center justify-between gap-4">
          {pageCount <= MAX_DOTS ? (
            <div className="flex items-center">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => irPara(i)}
                  aria-label={`Ir para o grupo ${i + 1} de ${pageCount}`}
                  aria-current={i === page}
                  // Alvo de 44px com o ponto visual pequeno por dentro.
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
          ) : (
            /* Muitas páginas: barra de progresso lê melhor que uma fileira de
               dots — e não precisa ser tocável, já que o gesto é o scroll. */
            <div className="flex flex-1 items-center gap-3">
              <div
                className="h-1 w-full max-w-[140px] overflow-hidden rounded-full bg-muted-foreground/20"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-150"
                  style={{ width: `${Math.max(12, progress * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                {String(page + 1).padStart(2, "0")}/{String(pageCount).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Dica do gesto: só no toque e só antes de sair do começo. */}
          {page === 0 && (
            <span
              aria-hidden="true"
              className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground sm:hidden"
            >
              Arrasta
              <ChevronRight className="size-3" />
            </span>
          )}

          {/* Setas só no desktop: no toque o próprio scroll já navega. */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => irPara(page - 1)}
              disabled={page === 0}
              aria-label="Cursos anteriores"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => irPara(page + 1)}
              disabled={page >= pageCount - 1}
              aria-label="Próximos cursos"
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

/** Peça de abertura: o diploma, com o wireframe ao lado. */
function DegreeCard() {
  const conteudo = (
    <>
      <div className="relative min-w-0">
        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
          {DEGREE.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {DEGREE.institution}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground/60">Emissão</dt>
            <dd>{DEGREE.issued}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground/60">Credencial</dt>
            <dd className="tabular-nums">{DEGREE.credentialId}</dd>
          </div>
          {DEGREE.registry && (
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground/60">Registro</dt>
              <dd>{DEGREE.registry}</dd>
            </div>
          )}
        </dl>

        <ul className="mt-5 flex flex-wrap gap-2">
          {DEGREE.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative grid place-items-center rounded-xl border border-border bg-background/40 p-4">
        <span className="hidden md:block">
          <CertificateWireframe variant="portrait" />
        </span>
        <span className="block md:hidden">
          <CertificateWireframe variant="landscape" />
        </span>
      </div>
    </>
  )

  const base =
    "group relative mt-10 grid gap-6 overflow-hidden rounded-2xl border border-brand/25 bg-card p-6 md:grid-cols-[1fr_220px] md:p-8"

  if (!DEGREE.credentialUrl) {
    return <div className={base}>{conteudo}</div>
  }

  return (
    <a
      href={DEGREE.credentialUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver credencial: ${DEGREE.title} — ${DEGREE.institution}`}
      className={cn(
        base,
        "outline-none transition-colors hover:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/50"
      )}
    >
      {/* glow sutil atrás do conteúdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-24 size-64 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
        }}
      />
      {conteudo}
    </a>
  )
}
