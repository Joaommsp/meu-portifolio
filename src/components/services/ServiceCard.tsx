import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { EFEITOS } from "@/components/services/effects"
import { rotaServico, type Servico } from "@/lib/servicos-content"

/**
 * Card de serviço: o efeito ocupa o card inteiro e o texto pousa por cima,
 * ancorado embaixo. O card inteiro é o link pra página da frente de trabalho —
 * alvo grande, sem "saiba mais" competindo com ele.
 *
 * `superficie-painel` reaponta os tokens do tema pra superfície escura, então
 * `text-brand`, `text-muted-foreground` e `border-border` aqui dentro já saem
 * nas cores do painel.
 */
export function ServiceCard({ servico }: { servico: Servico }) {
  const Efeito = EFEITOS[servico.efeito]

  return (
    <Link
      href={rotaServico(servico.slug)}
      className="superficie-painel group relative flex h-full min-h-110 flex-col justify-end overflow-hidden rounded-2xl border border-[var(--painel-borda)] bg-[var(--painel)] text-foreground shadow-[0_26px_60px_-30px_var(--shadow-elevated)] transition-colors hover:border-brand/45"
    >
      <Efeito />

      {/* Véu: o efeito nasce sem escurecimento, e é aqui que o card decide
          quanto dele passa atrás do texto. Três paradas, não duas — com duas
          a rampa de alfa é linear e aparece uma faixa no meio. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--painel-veu-1) 24%, var(--painel-veu-3) 66%, transparent 100%)",
        }}
      />

      <span
        aria-hidden
        className="absolute top-5.5 left-5.5 font-mono text-[0.7rem] tracking-[0.2em] text-muted-foreground"
      >
        {servico.numero}
      </span>

      <ArrowUpRight
        aria-hidden
        className="absolute top-5 right-5 size-4.5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
      />

      <div className="relative p-5.5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brand">
          {servico.categoria}
        </p>
        <h3 className="mt-2.5 font-display text-2xl font-bold leading-tight tracking-tight text-pretty">
          {servico.promessa}
        </h3>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {servico.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.65rem] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
