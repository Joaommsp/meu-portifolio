"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

import { MesaSvg, type TipoObjeto } from "@/components/uses/MesaSvg"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { lerFicha } from "@/lib/uses-ficha"
import type { UsesCategory, UsesItem } from "@/types/uses"
import { cn } from "@/lib/utils"

/** Liga um item do admin ao objeto da mesa pelo nome. Sem par, fica só na lista. */
const TIPOS: readonly [TipoObjeto, RegExp][] = [
  ["notebook", /notebook|laptop|macbook/i],
  ["monitor", /monitor|tela externa|display/i],
  ["teclado", /teclado|keyboard/i],
  ["mouse", /mouse/i],
  ["gabinete", /desktop|gabinete|\bpc\b|torre/i],
]

function tipoDoItem(nome: string): TipoObjeto | null {
  return TIPOS.find(([, re]) => re.test(nome))?.[0] ?? null
}

/** Altura do conteúdo, medida a cada mudança, pra animar o contêiner até ela. */
function useAltura<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [altura, setAltura] = React.useState<number | "auto">("auto")
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setAltura(e!.contentRect.height))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, altura] as const
}

function Ficha({ item }: { item: UsesItem }) {
  const linhas = lerFicha(item.description)
  const specs = linhas.filter((l) => "rotulo" in l)
  const textos = linhas.filter((l) => "texto" in l)
  const temLink = item.url.trim() !== "" && item.url.trim() !== "#"

  return (
    <div className="wf-anima grid animate-[wf-entra_450ms] gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">{item.name}</h3>
        {temLink && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver ${item.name}`}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
      {item.starred && (
        <span className="justify-self-start rounded-md border-[1.5px] border-brand px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-brand">
          FAV
        </span>
      )}
      {specs.length > 0 && (
        <dl className="font-mono text-xs leading-normal">
          {specs.map((l) =>
            "rotulo" in l ? (
              <div key={l.rotulo + l.valor} className="flex justify-between gap-4 border-t border-dotted border-border py-2">
                <dt className="text-muted-foreground">{l.rotulo}</dt>
                <dd className="text-right">{l.valor}</dd>
              </div>
            ) : null
          )}
        </dl>
      )}
      {textos.length > 0 && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {textos.map((l) => ("texto" in l ? l.texto : "")).join(" ")}
        </p>
      )}
    </div>
  )
}

/**
 * A categoria de hardware como a mesa de trabalho vista de cima. Cada objeto
 * desenhado corresponde a um item do admin (ligado pelo nome); passar o mouse,
 * focar ou clicar troca a ficha de vidro ao lado. A lista dentro da ficha faz
 * o mesmo e cobre itens que não têm objeto na mesa.
 *
 * A ficha muda de tamanho conforme o item; a altura anima até a nova medida
 * em vez de pular.
 */
export function Bancada({ categoria }: { categoria: UsesCategory }) {
  const reduzido = usePrefersReducedMotion()
  const itens = categoria.items
  const [indice, setIndice] = React.useState(0)
  const [conteudo, altura] = useAltura<HTMLDivElement>()

  const porTipo = React.useMemo(() => {
    const mapa = new Map<TipoObjeto, number>()
    itens.forEach((it, i) => {
      const t = tipoDoItem(it.name)
      if (t && !mapa.has(t)) mapa.set(t, i)
    })
    return mapa
  }, [itens])

  const presentes = React.useMemo(() => new Set(porTipo.keys()), [porTipo])
  const rotulos = React.useMemo(
    () => Object.fromEntries([...porTipo].map(([t, i]) => [t, itens[i]!.name])) as Partial<Record<TipoObjeto, string>>,
    [porTipo, itens]
  )
  const ativoTipo = tipoDoItem(itens[indice]?.name ?? "")
  const item = itens[indice]
  if (!item) return null

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-7">
      <div className="relative overflow-hidden rounded-3xl shadow-[inset_0_0_0_1px_oklch(0.4_0.04_60/.15),0_40px_70px_-40px_oklch(0.3_0.04_50/.55)]">
        <MesaSvg
          presentes={presentes}
          ativo={ativoTipo && porTipo.get(ativoTipo) === indice ? ativoTipo : null}
          rotulos={rotulos}
          aoEscolher={(t) => {
            const i = porTipo.get(t)
            if (i !== undefined) setIndice(i)
          }}
        />
        <span className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] tracking-wide text-[oklch(0.35_0.03_60/.75)]">
          {presentes.size > 0 ? "toque num objeto" : ""}
        </span>
      </div>

      <div className="vidro grid gap-4 rounded-3xl p-5 md:p-6">
        <div className="flex justify-between gap-3 font-mono text-[11px] tracking-wide text-muted-foreground">
          <span>
            {categoria.title.toUpperCase()} · {String(indice + 1).padStart(2, "0")} / {String(itens.length).padStart(2, "0")}
          </span>
          {categoria.description && <span className="truncate max-sm:hidden">{categoria.description}</span>}
        </div>

        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{ height: altura }}
          transition={reduzido ? { duration: 0 } : { duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          <div ref={conteudo}>
            <Ficha key={indice} item={item} />
          </div>
        </motion.div>

        <ul className="grid">
          {itens.map((it, i) => (
            <li key={it.name}>
              <button
                type="button"
                onClick={() => setIndice(i)}
                onMouseEnter={() => setIndice(i)}
                aria-pressed={i === indice}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-t border-border py-2.5 text-left text-sm outline-none transition-[color,padding] duration-300 ease-[cubic-bezier(.23,1,.32,1)] hover:pl-1.5 focus-visible:ring-2 focus-visible:ring-brand/50",
                  i === indice && "text-brand"
                )}
              >
                <span>{it.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
