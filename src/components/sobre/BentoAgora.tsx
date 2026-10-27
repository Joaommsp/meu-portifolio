import { BookOpen, Briefcase, Code, GraduationCap, Music, Workflow } from "lucide-react"

import { ComoTrabalho } from "@/components/sobre/ComoTrabalho"
import { TITULO_SOBRE } from "@/components/sobre/secao"
import { getCurrently } from "@/lib/data/currently"
import { fetchWakatimeStats } from "@/lib/wakatime"
import { BASE, TRAJETORIA } from "@/lib/sobre-content"
import { CURRENTLY_EMPTY_TEXT, temItemAtual, type CurrentlyItem } from "@/types/currently"
import { cn } from "@/lib/utils"

const CARTAO = "relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5"

function Etiqueta({ icone: Icone, children }: { icone: typeof Code; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      <Icone className="size-3.5 text-brand" />
      {children}
    </span>
  )
}

/** Lendo, ouvindo, estudando: vêm do admin; desligado ou vazio vira "Nada no momento". */
function Agora({ item }: { item: CurrentlyItem }) {
  if (!temItemAtual(item)) {
    return <p className="text-sm text-muted-foreground">{CURRENTLY_EMPTY_TEXT}</p>
  }
  const corpo = (
    <>
      <p className="font-semibold leading-snug tracking-tight">{item.title}</p>
      {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
    </>
  )
  return item.link ? (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="space-y-0.5 hover:text-brand">
      {corpo}
    </a>
  ) : (
    <div className="space-y-0.5">{corpo}</div>
  )
}

async function horasDaSemana() {
  try {
    const stats = await fetchWakatimeStats("last_7_days")
    if (!stats?.is_visible || !stats.total_seconds) return null
    return {
      total: stats.human_readable_total,
      linguagens: stats.languages.slice(0, 2),
    }
  } catch {
    return null
  }
}

/**
 * Bento "Agora" do /sobre: trajetória, o que está lendo, ouvindo e
 * estudando, como eu trabalho, a base e as horas de código da semana.
 *
 * Desktop em 3 colunas (a trajetória ocupa duas linhas); celular em 2, com os
 * cartões largos ocupando a linha inteira.
 */
export async function BentoAgora() {
  const [agora, horas] = await Promise.all([getCurrently(), horasDaSemana()])

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-14 sm:px-6 md:pt-20">
      <h2 className={cn(TITULO_SOBRE, "mb-8")}>Agora</h2>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3.5">
        <div className={cn(CARTAO, "col-span-2 md:col-span-1 md:row-span-2")}>
          <Etiqueta icone={Briefcase}>Trajetória</Etiqueta>
          <ol className="relative mt-1 space-y-4 pl-5 before:absolute before:top-1.5 before:bottom-1.5 before:left-1 before:w-px before:bg-border">
            {TRAJETORIA.map(({ periodo, titulo, org, atual }) => (
              <li key={titulo} className="relative">
                <span
                  className={cn(
                    "absolute top-1 -left-5 size-2.5 rounded-full border-2",
                    atual ? "border-brand bg-brand" : "border-muted-foreground bg-card"
                  )}
                />
                <span className="font-mono text-[11px] text-muted-foreground">{periodo}</span>
                <p className="text-sm font-semibold">{titulo}</p>
                <p className="text-xs text-muted-foreground">{org}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={CARTAO}>
          <Etiqueta icone={BookOpen}>Lendo</Etiqueta>
          <Agora item={agora.lendo} />
        </div>

        <div className={CARTAO}>
          <Etiqueta icone={Music}>Ouvindo</Etiqueta>
          <Agora item={agora.ouvindo} />
        </div>

        <div className={cn(CARTAO, "col-span-2")}>
          <Etiqueta icone={Workflow}>Como eu trabalho</Etiqueta>
          <ComoTrabalho />
        </div>

        <div className={cn(CARTAO, "col-span-2 gap-0 p-0 md:col-span-1 md:p-0")}>
          <svg viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" aria-hidden className="h-32 w-full">
            <g fill="none" stroke="currentColor" strokeOpacity="0.12">
              <path d="M0 30 Q80 20 150 40 T300 30" />
              <path d="M0 70 Q90 60 160 80 T300 75" />
              <path d="M0 105 Q70 95 140 112 T300 108" />
              <path d="M40 0 Q50 60 30 130" />
              <path d="M120 0 Q110 70 130 130" />
              <path d="M210 0 Q220 60 200 130" />
              <path d="M270 0 Q260 70 280 130" />
            </g>
            {/* o São Francisco */}
            <path
              d="M0 92 C60 70 100 110 150 84 S240 60 300 78"
              fill="none"
              stroke="var(--brand)"
              strokeOpacity="0.55"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="152" cy="62" r="13" fill="var(--brand)" fillOpacity="0.18" />
            <circle cx="152" cy="62" r="6" fill="var(--brand)" />
          </svg>
          <div className="px-4 pb-4 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em]">{BASE.cidade}</p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">{BASE.detalhe}</p>
          </div>
        </div>

        <div className={CARTAO}>
          <Etiqueta icone={GraduationCap}>Estudando</Etiqueta>
          <Agora item={agora.estudando} />
        </div>

        <div className={CARTAO}>
          <Etiqueta icone={Code}>Código na semana</Etiqueta>
          {horas ? (
            <>
              <p className="font-display text-2xl font-bold tracking-tight tabular-nums md:text-3xl">
                {horas.total}
              </p>
              <p className="text-xs text-muted-foreground">
                {horas.linguagens.map((l) => `${l.name} ${Math.round(l.percent)}%`).join(" · ")} · via
                WakaTime
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem registro esta semana</p>
          )}
        </div>
      </div>
    </section>
  )
}
