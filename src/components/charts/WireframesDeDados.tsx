"use client"

import * as React from "react"
import { motion, type PanInfo } from "motion/react"
import {
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  ListFilter,
  Search,
  SlidersHorizontal,
  Table,
} from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"

/* ── Peças dos painéis ────────────────────────────────────────
   Painel escuro (`superficie-painel` reaponta os tokens), linhas de 1px,
   rótulos em mono e UM elemento aceso no accent por painel. As animações
   (globals.css, `wf-*`) tocam quando o slide entra, porque ele remonta. */

/** Atraso de cascata: um passo a cada `ms`. */
const atraso = (i: number, ms = 55, base = 120): React.CSSProperties => ({
  animationDelay: `${base + i * ms}ms`,
})

/** Entra fora de foco e assenta, na vez dele. */
function Entra({ i = 0, className, children }: { i?: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("wf-anima animate-[wf-entra_600ms]", className)} style={atraso(i)}>
      {children}
    </div>
  )
}

function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[10px] tracking-wide text-muted-foreground", className)}>{children}</span>
  )
}

function Pilula({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
      <span className="wf-anima size-1.5 animate-[wf-pulso_1.8s_infinite] rounded-full bg-brand" />
      {children}
    </span>
  )
}

/** Cabeçalho comum: título à esquerda, metadado em mono, pílula à direita. */
function Topo({ titulo, meta, pilula }: { titulo: string; meta: string; pilula?: string }) {
  return (
    <Entra className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <span className="truncate text-[13px] font-medium text-foreground">{titulo}</span>
        <Meta className="max-sm:hidden">{meta}</Meta>
      </div>
      {pilula && <Pilula>{pilula}</Pilula>}
    </Entra>
  )
}

/** Conta até o valor quando monta (o painel remonta a cada slide). */
function useContagem(alvo: number, ms = 1100, base = 250) {
  const reduzido = usePrefersReducedMotion()
  const [valor, setValor] = React.useState(0)
  React.useEffect(() => {
    let quadro = 0
    if (reduzido) {
      quadro = requestAnimationFrame(() => setValor(alvo))
      return () => cancelAnimationFrame(quadro)
    }
    const inicio = performance.now() + base
    const passo = (agora: number) => {
      const p = Math.min(1, Math.max(0, (agora - inicio) / ms))
      setValor(Math.round(alvo * (1 - Math.pow(1 - p, 3))))
      if (p < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, ms, base, reduzido])
  return valor
}

const milhar = new Intl.NumberFormat("pt-BR")

/* ── 1. Dashboard: uma terça vista do painel ──────────────── */

const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]
const CARGA = [5, 8, 6, 7, 4, 2, 1]

function WireDashboard() {
  const pct = useContagem(82)
  return (
    <div className="flex h-full flex-col gap-4">
      <Topo titulo="Uma terça no painel" meta="14:32 · 3 filas" pilula="ao vivo" />
      <div className="grid min-h-0 flex-1 grid-cols-[1.5fr_1fr] gap-4">
        <Entra i={1} className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <Meta>tarefas por dia</Meta>
          <div className="grid flex-1 grid-cols-7 items-end gap-1.5">
            {DIAS.map((d, i) => (
              <div key={d} className="flex h-full flex-col justify-end gap-1">
                <div className="flex flex-col-reverse gap-[3px]">
                  {Array.from({ length: CARGA[i]! }, (_, k) => (
                    <span
                      key={k}
                      className={cn(
                        "wf-anima block h-2 origin-bottom animate-[wf-cresce_420ms] rounded-[2px]",
                        i === 1 ? "bg-brand" : "bg-foreground/15"
                      )}
                      style={atraso(i * 2 + k, 28, 260)}
                    />
                  ))}
                </div>
                <span className={cn("text-center font-mono text-[9px]", i === 1 ? "text-brand" : "text-muted-foreground")}>
                  {d}
                </span>
              </div>
            ))}
          </div>
        </Entra>
        <Entra i={2} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-3">
          <div className="relative size-24">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="7" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="7"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.82 1"
                className="wf-anima animate-[wf-traco_1.1s]"
                style={atraso(0, 0, 300)}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold tabular-nums">
              {pct}%
            </span>
          </div>
          <Meta className="text-center">sem ninguém no meio</Meta>
        </Entra>
      </div>
      <Entra i={3} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {["oklch(0.7 0.08 40)", "oklch(0.65 0.06 250)", "oklch(0.72 0.07 150)"].map((c) => (
              <span key={c} className="size-5 rounded-full border-2 border-[var(--painel)]" style={{ background: c }} />
            ))}
          </div>
          <span className="text-xs text-foreground">3 aguardando você</span>
        </div>
        <Meta>maior espera 26 min</Meta>
      </Entra>
    </div>
  )
}

/* ── 2. KPIs: números que contam ──────────────────────────── */

function WireKpis() {
  const acessos = useContagem(61247)
  const dias = useContagem(11, 900)
  const prazo = useContagem(91)
  return (
    <div className="flex h-full flex-col gap-4">
      <Topo titulo="Números da semana" meta="atualizado agora" />
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <Entra i={1} className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3">
          <Meta>acessos</Meta>
          <span className="font-display text-2xl font-bold tracking-tight tabular-nums">{milhar.format(acessos)}</span>
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
            <polyline
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              className="wf-anima animate-[wf-traco_1.2s]"
              style={atraso(0, 0, 350)}
              points="0,26 12,22 24,24 36,16 48,18 60,10 72,13 84,6 100,3"
            />
          </svg>
        </Entra>
        <Entra i={2} className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3">
          <Meta>dias seguidos sem atraso</Meta>
          <span className="font-display text-2xl font-bold tracking-tight tabular-nums">{dias}</span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 14 }, (_, k) => (
              <span
                key={k}
                className={cn(
                  "wf-anima h-5 flex-1 origin-bottom animate-[wf-cresce_380ms] rounded-[2px]",
                  k < 11 ? "bg-brand" : "bg-foreground/12"
                )}
                style={atraso(k, 45, 300)}
              />
            ))}
          </div>
        </Entra>
        <Entra i={3} className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3">
          <Meta>entregas no prazo</Meta>
          <span className="font-display text-2xl font-bold tracking-tight tabular-nums">{prazo}%</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/12">
            <span
              className="wf-anima block h-full w-[91%] origin-left animate-[wf-enche_1.1s] rounded-full bg-brand"
              style={atraso(0, 0, 350)}
            />
          </div>
        </Entra>
      </div>
    </div>
  )
}

/* ── 3. Gráficos: barras isométricas ──────────────────────── */

const SEMANA = [
  { d: "seg", v: 0.42 },
  { d: "ter", v: 0.55 },
  { d: "qua", v: 0.5 },
  { d: "qui", v: 0.68 },
  { d: "sex", v: 0.74 },
  { d: "hoje", v: 1 },
]

/** Uma barra em 3D isométrico: frente, lado e topo. */
function Prisma({ x, altura, acesa }: { x: number; altura: number; acesa: boolean }) {
  const base = 150
  const w = 26
  const p = 9
  const topo = base - altura
  const cor = acesa ? "var(--brand)" : "currentColor"
  return (
    <g>
      <polygon points={`${x},${base} ${x + w},${base} ${x + w},${topo} ${x},${topo}`} fill={cor} fillOpacity={acesa ? 0.9 : 0.16} />
      <polygon
        points={`${x + w},${base} ${x + w + p},${base - p} ${x + w + p},${topo - p} ${x + w},${topo}`}
        fill={cor}
        fillOpacity={acesa ? 0.6 : 0.08}
      />
      <polygon
        points={`${x},${topo} ${x + w},${topo} ${x + w + p},${topo - p} ${x + p},${topo - p}`}
        fill={cor}
        fillOpacity={acesa ? 1 : 0.28}
      />
    </g>
  )
}

function WireGraficos() {
  return (
    <div className="flex h-full flex-col gap-4">
      <Topo titulo="Execuções por dia" meta="últimos 6 dias" />
      <Entra i={1} className="flex items-center justify-between">
        <div className="inline-flex gap-0.5 rounded-lg border border-border p-0.5">
          {["Barras", "Linhas", "Área"].map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px]",
                t === "Barras" ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <Meta>+35% sobre a média</Meta>
      </Entra>
      <div className="relative min-h-0 flex-1 text-foreground">
        <svg viewBox="0 0 270 170" className="absolute inset-0 size-full" aria-hidden>
          {SEMANA.map(({ d, v }, i) => (
            <g
              key={d}
              className="wf-anima origin-bottom animate-[wf-cresce_700ms] [transform-box:fill-box]"
              style={atraso(i, 70, 250)}
            >
              <Prisma x={14 + i * 42} altura={v * 120} acesa={i === SEMANA.length - 1} />
            </g>
          ))}
          {SEMANA.map(({ d }, i) => (
            <text
              key={d}
              x={27 + i * 42}
              y={166}
              textAnchor="middle"
              className="fill-current font-mono text-[8px]"
              fillOpacity={i === SEMANA.length - 1 ? 1 : 0.5}
            >
              {d}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

/* ── 4. Filtros: a busca que responde ─────────────────────── */

const RESULTADOS = [
  { nome: "Contrato 0412 · Marques", dias: "34 dias" },
  { nome: "Contrato 0398 · Ribeiro", dias: "41 dias" },
  { nome: "Contrato 0377 · Andrade", dias: "52 dias" },
]

const FILTROS: readonly (readonly [string, boolean])[] = [
  ["Ativos", true],
  ["Este mês", true],
  ["Acima de R$ 5.000,00", false],
  ["Arquivados", false],
]

function WireFiltros() {
  const total = useContagem(23, 900, 1400)
  return (
    <div className="flex h-full flex-col gap-3.5">
      <Topo titulo="Carteira" meta="1.284 contratos" />
      <Entra i={1} className="flex h-9 items-center gap-2 rounded-xl border border-border px-3">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <span
          className="wf-anima inline-block w-[23ch] animate-[wf-digita_1.1s_steps(23)] overflow-hidden font-mono text-[11px] whitespace-nowrap text-foreground"
          style={atraso(0, 0, 350)}
        >
          inadimplência &gt; 30 dias
        </span>
        <span className="wf-anima h-3.5 w-px animate-[wf-cursor_1s_steps(1)_infinite] bg-brand" />
      </Entra>
      <Entra i={2} className="flex flex-wrap gap-1.5">
        {FILTROS.map(([nome, on]) => (
          <span
            key={nome}
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px]",
              on ? "border-brand bg-brand/15 text-brand" : "border-border text-muted-foreground"
            )}
          >
            {nome}
          </span>
        ))}
      </Entra>
      <Entra i={3} className="flex items-baseline justify-between border-t border-border pt-3">
        <Meta>resultados</Meta>
        <span className="font-display text-lg font-bold tabular-nums">{total}</span>
      </Entra>
      <div className="flex flex-col">
        {RESULTADOS.map(({ nome, dias }, i) => (
          <Entra key={nome} i={4 + i} className="flex items-center justify-between border-b border-border py-2 last:border-0">
            <span className="text-xs text-foreground">{nome}</span>
            <Meta className={i === 2 ? "text-brand" : undefined}>{dias}</Meta>
          </Entra>
        ))}
      </div>
    </div>
  )
}

/* ── 5. Visualização: a tela do jeito de cada um ──────────── */

function Chave({ i }: { i: number }) {
  return (
    <span className="relative h-4 w-7 shrink-0 overflow-hidden rounded-full bg-foreground/15">
      <span
        className="wf-anima absolute inset-0 origin-left animate-[wf-enche_300ms] rounded-full bg-brand"
        style={atraso(i, 160, 700)}
      />
      <span
        className="wf-anima absolute top-0.5 left-0.5 size-3 animate-[wf-desliza_300ms] rounded-full bg-background [--ate:12px] [animation-fill-mode:forwards]"
        style={atraso(i, 160, 700)}
      />
    </span>
  )
}

function WireVisualizacao() {
  const linhas = useContagem(50, 900, 500)
  return (
    <div className="flex h-full flex-col gap-4">
      <Topo titulo="Visualização" meta="salva por pessoa" />
      <Entra i={1} className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-foreground">Quantas linhas por página?</span>
          <span className="font-display text-base font-bold tabular-nums">{linhas}</span>
        </div>
        <div className="relative h-5">
          <span className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-foreground/12" />
          <span
            className="wf-anima absolute top-[calc(50%-2px)] h-1 w-1/2 origin-left animate-[wf-enche_900ms] rounded-full bg-brand"
            style={atraso(0, 0, 500)}
          />
          {/* A trilha inteira anda meia largura (translate em % do próprio
              trilho), levando o polegar até o meio sem animar layout. */}
          <span
            className="wf-anima absolute inset-0 animate-[wf-desliza_900ms] [--ate:50%] [animation-fill-mode:forwards]"
            style={atraso(0, 0, 500)}
          >
            <span className="absolute top-1/2 left-0 -mt-2 -ml-2 size-4 rounded-full border-2 border-brand bg-background" />
          </span>
        </div>
        <div className="flex justify-between">
          {["10", "25", "50", "100"].map((n) => (
            <Meta key={n}>{n}</Meta>
          ))}
        </div>
      </Entra>
      <div className="grid flex-1 grid-cols-2 gap-3">
        <Entra i={2} className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
          <Meta>colunas</Meta>
          {["Cliente", "Vencimento", "Valor"].map((c, i) => (
            <div key={c} className="flex items-center justify-between gap-2">
              <span className="text-xs text-foreground">{c}</span>
              <Chave i={i} />
            </div>
          ))}
        </Entra>
        <Entra i={3} className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
          <Meta>densidade</Meta>
          <div className="inline-flex gap-0.5 self-start rounded-lg border border-border p-0.5">
            {["Compacta", "Conforto"].map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-[10px]",
                  t === "Compacta" ? "bg-foreground text-background" : "text-muted-foreground"
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <span
            className="wf-anima mt-auto inline-flex animate-[wf-entra_500ms] items-center gap-1.5 self-start font-mono text-[10px] text-brand"
            style={atraso(0, 0, 1400)}
          >
            <Check className="size-3" />
            preferência salva
          </span>
        </Entra>
      </div>
    </div>
  )
}

/* ── 6. Tabelas: o registro das execuções ─────────────────── */

const EXECUCOES = [
  { hora: "14:32:08", nome: "Fechamento do caixa", ms: "rodando", fim: 0.62, viva: true },
  { hora: "14:31:51", nome: "Conciliação bancária", ms: "128 ms", fim: 1, viva: false },
  { hora: "14:30:12", nome: "Relatório semanal", ms: "306 ms", fim: 1, viva: false },
  { hora: "14:28:44", nome: "Cobrança automática", ms: "94 ms", fim: 1, viva: false },
  { hora: "14:25:03", nome: "Backup do banco", ms: "1,8 s", fim: 1, viva: false },
]

function WireTabela() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Topo titulo="Últimas execuções" meta="hoje" pilula="5 de 5" />
      <div className="flex flex-1 flex-col">
        {EXECUCOES.map(({ hora, nome, ms, fim, viva }, i) => (
          <Entra
            key={hora}
            i={1 + i}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border py-2.5 last:border-0"
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  viva ? "wf-anima animate-[wf-pulso_1.6s_infinite] bg-brand" : "bg-foreground/40"
                )}
              />
              <Meta>{hora}</Meta>
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-xs text-foreground">{nome}</span>
              <span className="h-0.5 overflow-hidden rounded-full bg-foreground/10">
                <span
                  className={cn(
                    "wf-anima block h-full origin-left animate-[wf-enche_900ms] rounded-full",
                    viva ? "bg-brand" : "bg-foreground/35"
                  )}
                  style={{ width: `${fim * 100}%`, ...atraso(i, 80, 400) }}
                />
              </span>
            </div>
            <Meta className={viva ? "text-brand" : undefined}>{ms}</Meta>
          </Entra>
        ))}
      </div>
    </div>
  )
}

const WIREFRAMES = [
  {
    titulo: "Dashboard",
    Icone: LayoutDashboard,
    Wire: WireDashboard,
    texto:
      "Visão geral numa tela: o que mudou, o que pede atenção e onde clicar para entender. Os números mais importantes primeiro, o detalhe a um clique.",
  },
  {
    titulo: "Cards de KPI",
    Icone: Gauge,
    Wire: WireKpis,
    texto:
      "Cada indicador com valor, variação e tendência. A cor só aparece quando o número pede atenção, para o olho achar o que importa sem ler tudo.",
  },
  {
    titulo: "Gráficos",
    Icone: ChartColumn,
    Wire: WireGraficos,
    texto:
      "O mesmo dado em barras, linhas ou área, conforme a pergunta: comparar, ver a evolução ou somar o volume. O dia que importa fica aceso.",
  },
  {
    titulo: "Filtros",
    Icone: ListFilter,
    Wire: WireFiltros,
    texto:
      "Busca, chips e período que respondem na hora. Os filtros ativos ficam à vista e fáceis de limpar, para ninguém se perder no recorte dos dados.",
  },
  {
    titulo: "Configurações de visualização",
    Icone: SlidersHorizontal,
    Wire: WireVisualizacao,
    texto:
      "Cada pessoa monta a tela do jeito que trabalha: colunas, densidade, agrupamento e ordem. A preferência fica salva para a próxima visita.",
  },
  {
    titulo: "Tabelas",
    Icone: Table,
    Wire: WireTabela,
    texto:
      "Lista longa com colunas claras, status ao vivo e o tempo de cada linha. O que está rodando pisca; o resto fica quieto e legível.",
  },
] as const

const TOTAL = WIREFRAMES.length
const SWIPE_THRESHOLD = 70

/**
 * Carrossel de painéis de dados, no formato do carrossel do Sobre na home:
 * um slide por vez com o painel, ícone, título e texto; arrasto, teclado,
 * pontos com contador e setas.
 *
 * Os painéis são micro-interfaces escuras com luz: rótulos em mono, linhas
 * de 1px e um único elemento aceso. O painel ativo remonta, então a entrada
 * em cascata e as contagens tocam a cada troca. Os slides ficam na mesma
 * célula do grid: a altura é a do maior e não muda.
 */
export function WireframesDeDados() {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const paginate = React.useCallback((dir: number) => {
    setDirection(dir)
    setIndex((prev) => (prev + dir + TOTAL) % TOTAL)
  }, [])

  const goTo = React.useCallback((target: number) => {
    setIndex((prev) => {
      if (target === prev) return prev
      setDirection(target > prev ? 1 : -1)
      return target
    })
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      paginate(-1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      paginate(1)
    }
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) paginate(1)
    else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1)
  }

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carrossel"
        aria-label="Painéis de interfaces de dados"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="grid rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        {WIREFRAMES.map(({ titulo, texto, Icone, Wire }, i) => {
          const ativo = i === index
          return (
            <motion.div
              key={titulo}
              className={cn(
                "col-start-1 row-start-1 select-none",
                !ativo && "pointer-events-none",
                ativo && !reduced && "cursor-grab active:cursor-grabbing"
              )}
              animate={
                reduced
                  ? { opacity: ativo ? 1 : 0 }
                  : { opacity: ativo ? 1 : 0, x: ativo ? 0 : direction >= 0 ? -56 : 56 }
              }
              initial={false}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              drag={ativo && !reduced ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={ativo && !reduced ? handleDragEnd : undefined}
              role="group"
              aria-roledescription="slide"
              aria-hidden={!ativo}
              inert={!ativo}
              aria-label={`${i + 1} de ${TOTAL}: ${titulo}`}
            >
              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
                {/* O painel: escuro, com a luz derivando por trás. */}
                <div
                  aria-hidden
                  className="superficie-painel relative isolate aspect-[4/3] overflow-hidden rounded-(--raio-vidro) border border-[var(--painel-borda)] bg-[var(--painel)] p-4 text-foreground shadow-[0_30px_60px_-30px_var(--vidro-sombra)] sm:p-5"
                >
                  <div
                    className="wf-anima pointer-events-none absolute -inset-1/4 -z-10 animate-[aurora-deriva_14s_ease-in-out_infinite_alternate] opacity-60"
                    style={{
                      background:
                        "radial-gradient(40% 30% at 70% 20%, oklch(from var(--brand) l c h / 0.35), transparent 70%), radial-gradient(30% 40% at 15% 90%, oklch(from var(--brand) l c h / 0.18), transparent 70%)",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(1_0_0/0.06)_1px,transparent_1.2px)] bg-[length:18px_18px]" />
                  {/* remonta quando fica ativo: a entrada toca de novo */}
                  <Wire key={ativo ? `ativo-${i}` : `parado-${i}`} />
                </div>
                <div className="space-y-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
                    <Icone className="size-5" />
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{titulo}</h3>
                  <p className="leading-relaxed text-muted-foreground md:text-lg">{texto}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 flex select-none items-center justify-between">
        <div className="flex items-center" role="tablist" aria-label="Selecionar painel">
          {WIREFRAMES.map(({ titulo }, i) => (
            <button
              key={titulo}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir para: ${titulo}`}
              onClick={() => goTo(i)}
              className="group/dot grid h-11 w-9 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-brand" : "w-2 bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/60"
                )}
              />
            </button>
          ))}
          <span className="ml-3 font-mono text-xs tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
        </div>

        <div className={cn("items-center gap-2", reduced ? "flex" : "hidden sm:flex")}>
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Painel anterior"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-150 hover:border-brand/60 hover:text-brand active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Próximo painel"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-150 hover:border-brand/60 hover:text-brand active:scale-[0.97]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
