import Image from "next/image"
import Link from "next/link"
import { Download, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DISPONIBILIDADE } from "@/lib/site"

/** As linhas do crachá: rótulo em mono à esquerda, valor à direita. */
const LINHAS = [
  { rotulo: "Agora", valor: "GFI · produto principal" },
  { rotulo: "Foco", valor: "dashboards e relatórios" },
] as const

/**
 * Crachá de vidro do hero do /sobre: foto do GitHub, nome, função, o que faz
 * agora, disponibilidade e as duas ações. Levemente inclinado no desktop
 * (endireita no hover); reto no celular, onde fica abaixo do título.
 */
export function CrachaSobre() {
  return (
    <div className="vidro relative mt-3 grid w-full gap-4 rounded-[22px] p-[18px] transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] sm:w-[320px] md:rotate-[2.5deg] md:hover:rotate-0">
      {/* a presilha do crachá */}
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-2 w-12 -translate-x-1/2 rounded-t-md bg-foreground/15"
      />

      <div className="flex items-center gap-3.5">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
          <Image
            src="https://github.com/Joaommsp.png"
            alt="Foto de João Marcos"
            fill
            sizes="64px"
            className="object-cover grayscale"
            priority
          />
        </span>
        <div>
          <p className="font-semibold">João Marcos</p>
          <p className="text-sm text-muted-foreground">Frontend e UI/UX</p>
        </div>
      </div>

      <dl className="grid gap-2 border-y border-dashed border-border py-3 text-[13px]">
        {LINHAS.map(({ rotulo, valor }) => (
          <div key={rotulo} className="flex items-center justify-between gap-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {rotulo}
            </dt>
            <dd>{valor}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Status
          </dt>
          <dd className="inline-flex items-center gap-1.5">
            <span className="size-[7px] rounded-full bg-success ring-3 ring-success/20" />
            {DISPONIBILIDADE.status}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="h-10 rounded-full"
          render={<a href="/cv-joaomarcos.pdf" target="_blank" rel="noopener noreferrer" />}
        >
          <Download className="size-4" data-icon="inline-start" />
          Baixar CV
        </Button>
        <Button variant="ghost" className="vidro h-10 rounded-full" render={<Link href="/contato" />}>
          <Mail className="size-4" data-icon="inline-start" />
          Conversar
        </Button>
      </div>
    </div>
  )
}
