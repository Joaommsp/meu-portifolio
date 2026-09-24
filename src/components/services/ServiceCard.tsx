import type * as React from "react"

export type Service = {
  /** Índice mostrado no canto do card. */
  numero: string
  /** Nome da frente de trabalho — o que o cliente procura. */
  categoria: string
  /** A promessa, em uma frase. */
  titulo: string
  /** O que cabe dentro da frente. */
  tags: readonly string[]
  /** Fundo animado do card (ver components/services/effects.tsx). */
  Efeito: React.ComponentType
}

/**
 * Card de serviço: o efeito ocupa o card inteiro e o texto pousa por cima,
 * ancorado embaixo.
 *
 * `superficie-painel` reaponta os tokens do tema pra superfície escura, então
 * `text-brand`, `text-muted-foreground` e `border-border` aqui dentro já
 * saem nas cores do painel — e o efeito lê `--brand-glow`, o único passo do
 * accent legível sobre o escuro.
 */
export function ServiceCard({ numero, categoria, titulo, tags, Efeito }: Service) {
  return (
    <article className="superficie-painel relative flex h-full min-h-110 flex-col justify-end overflow-hidden rounded-2xl border border-[var(--painel-borda)] bg-[var(--painel)] text-foreground shadow-[0_26px_60px_-30px_var(--shadow-elevated)]">
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
        {numero}
      </span>

      <div className="relative p-5.5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brand">
          {categoria}
        </p>
        <h3 className="mt-2.5 font-display text-2xl font-bold leading-tight tracking-tight text-pretty">
          {titulo}
        </h3>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.65rem] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
