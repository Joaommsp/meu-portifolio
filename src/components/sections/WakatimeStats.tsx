import { Clock, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"
import {
  fetchWakatimeStats,
  fetchWakatimeToday,
  getLangColor,
} from "@/lib/wakatime"

/** Horas de código da semana, na /now. Some se a API falhar ou o perfil for privado. */
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
    <section id="wakatime" className="container mx-auto max-w-5xl scroll-mt-20 px-5 py-12 sm:px-6">
      <ScrollReveal>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Horas de código
        </h2>
        <p className="mt-2 mb-6 text-muted-foreground">
          Últimos 7 dias, via{" "}
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline-offset-2 hover:underline"
          >
            WakaTime
          </a>
          .
        </p>

        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <BigStat
                icon={<Clock className="size-4" />}
                label="Semana"
                value={stats.human_readable_total}
              />
              <BigStat
                icon={<Zap className="size-4" />}
                label="Hoje"
                value={today?.human_readable ?? "Sem dados"}
              />
            </div>

            {stats.languages.length > 0 && (
              <div className="vidro rounded-(--raio-vidro) p-6">
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
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {topEditor && (
                <RankCard
                  label="Editor"
                  name={topEditor.name}
                  percent={topEditor.percent}
                  text={topEditor.text}
                />
              )}
              {topOs && (
                <RankCard
                  label="Sistema"
                  name={topOs.name}
                  percent={topOs.percent}
                  text={topOs.text}
                />
              )}
            </div>
          </div>
        )}
      </ScrollReveal>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */

function BigStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="vidro luz-borda relative rounded-(--raio-vidro) p-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
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
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
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
    <div className="vidro rounded-(--raio-vidro) p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
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
    <div className="vidro flex flex-col items-center gap-3 rounded-(--raio-vidro) p-12 text-center">
      <Badge
        variant="outline"
        className="font-mono text-xs uppercase"
      >
        Iniciando rastreamento
      </Badge>
      <p className="text-sm text-muted-foreground">
        Os números aparecem aqui conforme o tempo de código é registrado.
      </p>
      <p className="font-mono text-xs text-muted-foreground/70">
        Atualiza a cada 30min ↻
      </p>
    </div>
  )
}
