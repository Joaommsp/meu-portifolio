import Image from "next/image"
import { Gamepad2 } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { PLAYING_STATUS_LABEL, type Playing } from "@/types/playing"

/**
 * "Jogando agora" na /now, no mesmo desenho do card de projeto: moldura de
 * vidro com a capa 16:9 dentro, selos sobre a capa e o texto embaixo. No
 * hover o card sobe 3px e a capa um pouco mais.
 */
function PlayingCard({ jogo }: { jogo: Playing }) {
  return (
    <article className="vidro vidro-sobe group relative flex h-full flex-col overflow-hidden rounded-(--raio-vidro) p-2.5">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-background-secondary transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-0.5">
        {jogo.coverImage ? (
          <>
            <Image
              src={jogo.coverImage}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            {/* Véu no topo pros selos seguirem legíveis sobre capa clara. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-foreground/30 to-transparent"
            />
          </>
        ) : (
          <div aria-hidden className="absolute inset-0 grid place-items-center text-muted-foreground">
            <Gamepad2 className="size-8" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {jogo.platform && (
            <span className="vidro-leve rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-foreground">
              {jogo.platform}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-background/85 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-brand-texto">
            <Gamepad2 className="size-3" />
            {PLAYING_STATUS_LABEL[jogo.status]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2.5 pt-4 pb-2.5">
        <h3 className="font-display text-xl font-semibold tracking-tight">{jogo.title}</h3>

        {jogo.synopsis && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {jogo.synopsis}
          </p>
        )}

        {jogo.genres.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {jogo.genres.map((g) => (
              <li
                key={g}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
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
