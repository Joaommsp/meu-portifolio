import Image from "next/image"
import { Gamepad2 } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { cn } from "@/lib/utils"
import { PLAYING_STATUS_LABEL, type Playing } from "@/types/playing"

/**
 * "Jogando agora" na /agora: card grande com a capa do jogo ao fundo.
 *
 * O gradiente não é enfeite — é o que garante contraste do texto sobre uma
 * imagem que pode ser clara, escura ou colorida demais. Vai de opaco embaixo
 * (onde o texto vive) a transparente em cima, deixando a arte respirar.
 */
function PlayingCard({ jogo }: { jogo: Playing }) {
  return (
    <article className="group relative isolate overflow-hidden rounded-2xl border border-border bg-card">
      {jogo.coverImage ? (
        <Image
          src={jogo.coverImage}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-muted" />
      )}

      {/* Gradiente de leitura: opaco onde o texto começa. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/25"
      />

      <div
        className={cn(
          "relative flex flex-col justify-end gap-3 p-6",
          // A altura só existe pra dar espaço à arte. Sem capa ela viraria
          // um vazio no topo do card.
          jogo.coverImage && "min-h-[320px] sm:min-h-[360px]"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-brand-texto">
            <Gamepad2 className="size-3" />
            {PLAYING_STATUS_LABEL[jogo.status]}
          </span>
          {jogo.platform && (
            <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {jogo.platform}
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
          {jogo.title}
        </h3>

        {jogo.synopsis && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {jogo.synopsis}
          </p>
        )}

        {jogo.genres.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {jogo.genres.map((g) => (
              <li
                key={g}
                className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-muted-foreground"
              >
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export function PlayingNow({ jogos }: { jogos: readonly Playing[] }) {
  // Sem nada cadastrado a seção não existe — melhor que um título órfão.
  if (jogos.length === 0) return null

  return (
    <section className="container mx-auto max-w-5xl px-5 py-12 sm:px-6">
      <ScrollReveal>
        <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Jogando agora
        </h2>
      </ScrollReveal>

      <div className="grid gap-4 md:grid-cols-2">
        {jogos.map((jogo, i) => (
          <ScrollReveal key={jogo.id} delay={i * 0.06}>
            <PlayingCard jogo={jogo} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
