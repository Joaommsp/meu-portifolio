"use client"

import * as React from "react"
import { motion, type PanInfo } from "motion/react"
import {
  Calendar,
  ChartLine,
  ChevronDown,
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

/* ── Primitivas de rascunho ───────────────────────────────────
   Cinza de wireframe a partir do texto do tema; o accent só no que importa,
   então tudo segue a cor escolhida no seletor de tema. */

function Linha({ className }: { className?: string }) {
  return <span className={cn("block h-1.5 rounded-full bg-muted-foreground/20", className)} />
}

function Caixa({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("rounded-lg border border-border", className)}>{children}</div>
}

function Chave({ ligada }: { ligada?: boolean }) {
  return (
    <span
      className={cn(
        "relative h-3.5 w-6 shrink-0 rounded-full",
        ligada ? "bg-brand" : "bg-muted-foreground/25"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-2.5 rounded-full bg-card",
          ligada ? "left-3" : "left-0.5"
        )}
      />
    </span>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  )
}

/* ── Os wireframes ────────────────────────────────────────── */

function WireDashboard() {
  return (
    <div className="grid h-full grid-cols-[22%_1fr] grid-rows-[auto_1fr] gap-2.5">
      <div className="row-span-2 flex flex-col gap-2 rounded-lg bg-muted-foreground/8 p-2">
        <Linha className="w-3/4 bg-brand" />
        <Linha className="w-3/5" />
        <Linha className="w-2/5" />
        <Linha className="w-3/5" />
        <Linha className="w-1/4" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[false, false, true].map((destaque, i) => (
          <Caixa key={i} className="flex flex-col gap-1.5 p-2">
            <Linha className="w-1/3" />
            <span
              className={cn(
                "block h-3 w-3/4 rounded",
                destaque ? "bg-brand" : "bg-foreground/45"
              )}
            />
          </Caixa>
        ))}
      </div>
      <Caixa className="grid grid-cols-[1.6fr_1fr] gap-2 p-2">
        <div className="flex h-full items-end gap-1">
          {[40, 55, 35, 70, 90, 60, 75].map((h, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-t-sm", i === 4 ? "bg-brand" : "bg-muted-foreground/20")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div
          className="relative aspect-square self-center rounded-full"
          style={{
            background:
              "conic-gradient(var(--brand) 0 42%, oklch(from var(--muted-foreground) l c h / 0.3) 42% 70%, oklch(from var(--muted-foreground) l c h / 0.12) 70%)",
          }}
        >
          <span className="absolute inset-[26%] rounded-full bg-card" />
        </div>
      </Caixa>
    </div>
  )
}

const KPIS = [
  { valor: "1.284", delta: "+12%", sobe: true },
  { valor: "86%", delta: "+4 p.p.", sobe: true },
  { valor: "37", delta: null, sobe: true },
  { valor: "4,2 d", delta: "-0,3 d", sobe: false },
]

function WireKpis() {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-2.5">
      {KPIS.map(({ valor, delta, sobe }, i) => (
        <Caixa key={i} className="flex flex-col justify-between p-3">
          <Linha className={i % 2 ? "w-3/5" : "w-2/5"} />
          <span className="font-display text-xl font-bold tracking-tight text-foreground/75">
            {valor}
          </span>
          {delta ? (
            <span
              className={cn(
                "self-start rounded px-1.5 py-0.5 font-mono text-[10px]",
                sobe ? "bg-brand/15 text-brand" : "bg-muted-foreground/10 text-muted-foreground"
              )}
            >
              {delta}
            </span>
          ) : (
            <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 w-full" aria-hidden>
              <polyline
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                points="0,20 15,16 30,18 45,10 60,13 75,6 100,4"
              />
            </svg>
          )}
        </Caixa>
      ))}
    </div>
  )
}

function WireGraficos() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-2.5">
      <div className="inline-flex gap-0.5 justify-self-end rounded-lg border border-border p-0.5">
        {["Barras", "Linhas", "Área"].map((tipo) => (
          <span
            key={tipo}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[10px]",
              tipo === "Linhas" ? "bg-foreground text-card" : "text-muted-foreground"
            )}
          >
            {tipo}
          </span>
        ))}
      </div>
      <div
        className="relative border-b border-l border-muted-foreground/25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to top, transparent 0 24%, oklch(from var(--muted-foreground) l c h / 0.1) 24% 25%)",
        }}
      >
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <polyline
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            points="0,48 14,44 28,46 42,34 57,36 71,24 85,18 100,8"
          />
          <polyline
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
            points="0,52 14,50 28,47 42,45 57,42 71,40 85,37 100,34"
          />
        </svg>
      </div>
    </div>
  )
}

function WireFiltros() {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <Caixa className="flex h-8 items-center gap-2 px-2.5">
        <Search className="size-3.5 text-muted-foreground" />
        <Linha className="w-3/5" />
      </Caixa>
      <div className="flex flex-wrap gap-1.5">
        {[
          ["Ativos", true],
          ["Pendentes", false],
          ["Este mês", true],
          ["Arquivados", false],
        ].map(([nome, on]) => (
          <span
            key={nome as string}
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px]",
              on ? "border-brand bg-brand/15 text-brand" : "border-border text-muted-foreground"
            )}
          >
            {nome}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Caixa className="flex h-8 items-center justify-between px-2.5">
          <Linha className="w-1/2" />
          <ChevronDown className="size-3 text-muted-foreground" />
        </Caixa>
        <Caixa className="flex h-8 items-center justify-between px-2.5">
          <Linha className="w-2/5" />
          <Calendar className="size-3 text-muted-foreground" />
        </Caixa>
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-2.5">
        <Linha />
        <Linha className="w-3/5" />
        <Linha />
        <Linha className="w-2/5" />
      </div>
    </div>
  )
}

function WireVisualizacao() {
  return (
    <div className="grid h-full grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Rotulo>Colunas</Rotulo>
        {[
          ["w-3/5", true],
          ["w-2/5", true],
          ["w-3/5", false],
          ["w-1/4", true],
        ].map(([w, on], i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <Linha className={w as string} />
            <Chave ligada={on as boolean} />
          </div>
        ))}
        <Rotulo>Ordenar por</Rotulo>
        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full border-4 border-brand" />
          <Linha className="w-3/5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full border-[1.5px] border-muted-foreground/40" />
          <Linha className="w-2/5" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Rotulo>Densidade</Rotulo>
        <div className="grid grid-cols-3 gap-1.5">
          {[2, 3, 4].map((n) => (
            <div
              key={n}
              className={cn(
                "flex flex-col gap-1 rounded-md border p-1.5",
                n === 3 ? "border-brand" : "border-border"
              )}
            >
              {Array.from({ length: n }, (_, i) => (
                <Linha key={i} className="h-1" />
              ))}
            </div>
          ))}
        </div>
        <Rotulo>Agrupar</Rotulo>
        <Caixa className="flex h-8 items-center justify-between px-2.5">
          <Linha className="w-1/2" />
          <ChevronDown className="size-3 text-muted-foreground" />
        </Caixa>
        <div className="flex items-center justify-between gap-2">
          <Linha className="w-3/5" />
          <Chave ligada />
        </div>
      </div>
    </div>
  )
}

const LINHAS_TABELA = [
  ["w-3/5", "w-2/5", true],
  ["w-full", "w-3/5", false],
  ["w-2/5", "w-2/5", true],
  ["w-3/5", "w-3/5", false],
] as const

function WireTabela() {
  const colunas = "grid grid-cols-[1.4fr_1fr_0.8fr_0.7fr] items-center gap-2.5"
  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-2.5">
      <div className="flex items-center justify-between">
        <Linha className="w-2/5" />
        <span className="h-5 w-16 rounded-md bg-muted-foreground/10" />
      </div>
      <div className={colunas}>
        {Array.from({ length: 4 }, (_, i) => (
          <Linha key={i} className="h-1 bg-muted-foreground/30" />
        ))}
      </div>
      <div className="flex flex-col">
        {LINHAS_TABELA.map(([a, b, ok], i) => (
          <div key={i} className={cn(colunas, "border-t border-border py-1.5")}>
            <Linha className={a} />
            <Linha className={b} />
            <span className={cn("h-3.5 w-4/5 rounded-full", ok ? "bg-brand/20" : "bg-muted-foreground/10")} />
            <Linha className="w-1/4" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Linha className="w-1/4" />
        <div className="flex gap-1">
          {[true, false, false].map((on, i) => (
            <span key={i} className={cn("size-4.5 rounded", on ? "bg-brand" : "bg-muted-foreground/10")} />
          ))}
        </div>
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
    Icone: ChartLine,
    Wire: WireGraficos,
    texto:
      "O mesmo dado em barras, linhas ou área, conforme a pergunta: comparar, ver a evolução ou somar o volume. A meta tracejada fica de referência.",
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
      "Lista longa com colunas claras, status em pílula e paginação. A ação de cada linha fica num ícone, sem empurrar o conteúdo para o lado.",
  },
] as const

const TOTAL = WIREFRAMES.length
const SWIPE_THRESHOLD = 70

/**
 * Carrossel de wireframes de interfaces de dados, no mesmo formato do
 * carrossel do Sobre na home: um slide por vez com o wireframe, ícone, título
 * e texto; arrasto, teclado, pontos com contador e setas.
 *
 * Os slides ficam empilhados na mesma célula do grid, então a altura é sempre
 * a do maior e não muda na troca. Os textos têm tamanho parecido de propósito.
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
        aria-label="Wireframes de interfaces de dados"
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
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
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
              <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
                <div
                  aria-hidden
                  className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card p-4"
                >
                  <Wire />
                </div>
                <div className="space-y-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
                    <Icone className="size-5" />
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {titulo}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground md:text-lg">{texto}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 flex select-none items-center justify-between">
        <div className="flex items-center" role="tablist" aria-label="Selecionar wireframe">
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
                  i === index
                    ? "w-7 bg-brand"
                    : "w-2 bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/60"
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
            aria-label="Wireframe anterior"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Próximo wireframe"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
