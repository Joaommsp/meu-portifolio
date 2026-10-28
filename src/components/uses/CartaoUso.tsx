import { ArrowUpRight } from "lucide-react"

import { iconeDoUso } from "@/components/uses/icone-uso"
import type { UsesItem } from "@/types/uses"
import { cn } from "@/lib/utils"

/** Ferramenta fora da mesa (browser, extensões, apps) num cartão de vidro. */
export function CartaoUso({ item }: { item: UsesItem }) {
  const temLink = item.url.trim() !== "" && item.url.trim() !== "#"
  const externo = temLink && /^https?:/i.test(item.url)
  const classes = cn(
    "vidro vidro-sobe group flex h-full flex-col gap-1.5 rounded-2xl p-4",
    item.starred && "ring-1 ring-brand/35"
  )
  const { Icone, marca } = iconeDoUso(item.name, item.description)
  const corpo = (
    <>
      <span className="mb-1.5 grid size-10 place-items-center rounded-xl text-brand vidro-leve transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-rotate-6 group-hover:scale-105">
        <Icone aria-hidden className="size-5" {...(marca ? { colored: true } : {})} />
      </span>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug transition-colors group-hover:text-brand">{item.name}</h3>
        {temLink && (
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-[rotate,color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45 group-hover:text-brand" />
        )}
      </div>
      {item.description && (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      {item.starred && (
        <span className="mt-auto pt-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-brand">FAV</span>
      )}
    </>
  )
  if (!temLink) return <div className={classes}>{corpo}</div>
  return (
    <a href={item.url} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={classes}>
      {corpo}
    </a>
  )
}
