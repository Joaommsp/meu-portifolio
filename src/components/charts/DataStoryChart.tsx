"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"

/* Dados fictícios — uma série que conta uma história (queda, recuperação, alta). */
type ChartDatum = { mes: string; valor: number; delta: number | null }

const RAW = [
  { mes: "Jan", valor: 320 },
  { mes: "Fev", valor: 280 },
  { mes: "Mar", valor: 410 },
  { mes: "Abr", valor: 530 },
  { mes: "Mai", valor: 495 },
  { mes: "Jun", valor: 640 },
  { mes: "Jul", valor: 760 },
  { mes: "Ago", valor: 910 },
] as const

const DATA: ChartDatum[] = RAW.map((d, i) => ({
  ...d,
  delta: i === 0 ? null : ((d.valor - RAW[i - 1]!.valor) / RAW[i - 1]!.valor) * 100,
}))

const TYPES = [
  { id: "bar", label: "Barras" },
  { id: "line", label: "Linhas" },
  { id: "area", label: "Área" },
] as const

type ChartType = (typeof TYPES)[number]["id"]

/* Tooltip custom — valor formatado + variação vs mês anterior. */
function ChartTooltip(props: {
  active?: boolean
  payload?: ReadonlyArray<{ payload: ChartDatum }>
}) {
  const { active, payload } = props
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0]!.payload
  const up = (d.delta ?? 0) >= 0
  return (
    <div className="rounded-lg border border-brand/40 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md">
      <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
        {d.mes}
      </p>
      <p className="mt-1 font-display text-lg font-semibold leading-none">
        {d.valor.toLocaleString("pt-BR")}{" "}
        <span className="text-xs font-normal text-muted-foreground">acessos</span>
      </p>
      {d.delta != null && (
        <p className={cn("mt-1.5 text-xs", up ? "text-success" : "text-warning")}>
          {up ? "▲" : "▼"} {Math.abs(d.delta).toFixed(1)}% vs mês anterior
        </p>
      )}
    </div>
  )
}

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }
// Margens enxutas: o gráfico é o conteúdo do card, não um elemento dentro dele.
const MARGIN = { top: 4, right: 2, bottom: 0, left: -22 }

export function DataStoryChart() {
  const reduced = usePrefersReducedMotion()
  const [type, setType] = React.useState<ChartType>("bar")

  const grid = (
    <CartesianGrid
      stroke="var(--border)"
      strokeDasharray="3 3"
      vertical={false}
    />
  )
  const xAxis = (
    <XAxis
      dataKey="mes"
      tick={AXIS_TICK}
      tickLine={false}
      axisLine={{ stroke: "var(--border)" }}
    />
  )
  const yAxis = (
    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
  )

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Acessos / mês · exemplo
        </p>
        <div
          role="tablist"
          aria-label="Tipo de gráfico"
          className="inline-flex rounded-lg border border-border p-0.5"
        >
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={type === t.id}
              onClick={() => setType(t.id)}
              className={cn(
                // min-h-11 dá o alvo tocável no mobile sem inchar o controle no desktop.
                "min-h-11 rounded-md px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wide transition-colors sm:min-h-0 sm:px-2.5",
                type === t.id
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* -mx-2/-mb-2 devolvem o padding do card pro gráfico; a altura sobe
          porque aqui o gráfico É o conteúdo. */}
      <div className="-mx-2 -mb-2 h-[230px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={DATA} margin={MARGIN}>
              {grid}
              {xAxis}
              {yAxis}
              <Tooltip
                cursor={{ fill: "var(--brand)", opacity: 0.07 }}
                content={<ChartTooltip />}
              />
              <Bar
                dataKey="valor"
                fill="var(--brand)"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
                isAnimationActive={!reduced}
              />
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={DATA} margin={MARGIN}>
              {grid}
              {xAxis}
              {yAxis}
              <Tooltip
                cursor={{ stroke: "var(--brand)", strokeOpacity: 0.4 }}
                content={<ChartTooltip />}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--brand)"
                strokeWidth={2.5}
                dot={{ fill: "var(--brand)", r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reduced}
              />
            </LineChart>
          ) : (
            <AreaChart data={DATA} margin={MARGIN}>
              <defs>
                <linearGradient id="dataStoryArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              {xAxis}
              {yAxis}
              <Tooltip
                cursor={{ stroke: "var(--brand)", strokeOpacity: 0.4 }}
                content={<ChartTooltip />}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="var(--brand)"
                strokeWidth={2.5}
                fill="url(#dataStoryArea)"
                isAnimationActive={!reduced}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
