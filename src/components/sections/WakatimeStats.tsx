import { Clock, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"
import {
  fetchWakatimeStats,
  fetchWakatimeToday,
  getLangColor,
} from "@/lib/wakatime"

export async function WakatimeStats() {
  const [stats, today] = await Promise.all([
    fetchWakatimeStats("last_7_days"),
    fetchWakatimeToday(),
  ])

  // Falha de API ou perfil privado: não renderiza
  if (!stats || !stats.is_visible) return null

  const hasData = stats.total_seconds > 0
  const topEditor = stats.editors[0]
  const topOs = stats.operating_systems[0]

  return (
    <section
      id="wakatime"
      className="container mx-auto max-w-6xl scroll-mt-20 px-6 py-32"
    >
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              04 · Coding stats
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Onde tô gastando teclado
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Tempo real de código rastreado pelo{" "}
              <a
                href="https://wakatime.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                WakaTime
              </a>{" "}
              · {stats.human_readable_range}.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {!hasData ? (
        <ScrollReveal>
          <EmptyState />
        </ScrollReveal>
      ) : (
        <div className="space-y-8">
          {/* Big stats */}
          <ScrollReveal>
            <div className="grid gap-3 sm:grid-cols-2">
              <BigStat
                icon={<Clock className="size-4" />}
                label="Total nos últimos 7 dias"
                value={stats.human_readable_total}
              />
              <BigStat
                icon={<Zap className="size-4" />}
                label="Tempo de hoje"
                value={today?.human_readable ?? "Sem dados"}
                isLive={!!today && today.total_seconds > 0}
              />
            </div>
          </ScrollReveal>

          {/* Languages bars */}
          {stats.languages.length > 0 && (
            <ScrollReveal delay={0.05}>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Linguagens
                </h3>
                <ul className="space-y-3">
                  {stats.languages.slice(0, 6).map((lang) => (
                    <LanguageBar
                      key={lang.name}
                      name={lang.name}
                      percent={lang.percent}
                      text={lang.text}
                      color={getLangColor(lang.name)}
                    />
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          )}

          {/* Editor + OS */}
          <ScrollReveal delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              {topEditor && (
                <RankCard
                  label="Editor mais usado"
                  name={topEditor.name}
                  percent={topEditor.percent}
                  text={topEditor.text}
                />
              )}
              {topOs && (
                <RankCard
                  label="Sistema operacional"
                  name={topOs.name}
                  percent={topOs.percent}
                  text={topOs.text}
                />
              )}
            </div>
          </ScrollReveal>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */

function BigStat({
  icon,
  label,
  value,
  isLive = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  isLive?: boolean
}) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
        {isLive && (
          <span className="ml-auto inline-flex items-center gap-1 text-brand">
            <span className="size-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_8px_var(--brand-glow)]" />
            <span className="text-[0.6rem]">ao vivo</span>
          </span>
        )}
      </p>
      <p className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        {value}
      </p>
    </div>
  )
}

function LanguageBar({
  name,
  percent,
  text,
  color,
}: {
  name: string
  percent: number
  text: string
  color: string
}) {
  return (
    <li>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span
            aria-hidden
            className="inline-block size-2.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          {name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {percent.toFixed(1)}% · {text}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: color,
          }}
        />
      </div>
    </li>
  )
}

function RankCard({
  label,
  name,
  percent,
  text,
}: {
  label: string
  name: string
  percent: number
  text: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {name}
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {percent.toFixed(1)}% · {text}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/30 p-12 text-center">
      <Badge
        variant="outline"
        className="font-mono text-[0.65rem] uppercase"
      >
        Iniciando rastreamento
      </Badge>
      <p className="text-sm text-muted-foreground">
        Plugin WakaTime acabou de ser instalado. Stats aparecem aqui
        conforme o tempo de código for sendo registrado — basta codar
        normalmente, é tudo automático.
      </p>
      <p className="font-mono text-xs text-muted-foreground/70">
        Atualiza a cada 30min ↻
      </p>
    </div>
  )
}
