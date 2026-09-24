import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Clock,
  Gamepad2,
  BookMarked,
  Music,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"
import { PageHero } from "@/components/sections/PageHero"
import { SpotifyNowPlaying } from "@/components/sections/SpotifyNowPlaying"
import { getAllPublishedBooks } from "@/lib/data/books"
import { getAllPublishedGames } from "@/lib/data/games"
import { NOW_LAST_UPDATED, NOW_LOCATION } from "@/lib/now-content"
import { getCurrently } from "@/lib/data/currently"
import { getPlaying } from "@/lib/data/playing"
import { PlayingNow } from "@/components/sections/PlayingNow"
import { CURRENTLY_EMPTY_TEXT } from "@/types/currently"

export const metadata: Metadata = {
  title: "Agora",
  description:
    "O que João Marcos está fazendo agora — trabalho, estudos, jogos, livros e metas do mês.",
  alternates: { canonical: "/now" },
}


/** Linha compacta dos cards "em tempo real": capa opcional + título + detalhe. */
function CardLinha({
  titulo,
  detalhe,
  href,
  imagem,
}: {
  titulo: string
  detalhe?: string
  href?: string
  imagem?: string | null
}) {
  const conteudo = (
    <>
      {imagem && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded">
          <Image src={imagem} alt="" fill sizes="48px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
          {titulo}
        </p>
        {detalhe && (
          <p className="truncate font-mono text-[0.7rem] text-muted-foreground">
            {detalhe}
          </p>
        )}
      </div>
    </>
  )
  if (!href) return <div className="flex items-center gap-3">{conteudo}</div>
  const externo = href.startsWith("http")
  return externo ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3"
    >
      {conteudo}
    </a>
  ) : (
    <Link href={href} className="group flex items-center gap-3">
      {conteudo}
    </Link>
  )
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default async function NowPage() {
  const [books, games, currently, jogando] = await Promise.all([
    getAllPublishedBooks(),
    getAllPublishedGames(),
    getCurrently(),
    getPlaying(),
  ])

  const currentBook = books.find(
    (b) => b.status === "lendo" || b.status === "relendo"
  )
  const currentGame = games.find(
    (g) => g.status === "jogando" || g.status === "rejogando"
  )
  // O "jogando agora" manda no card compacto: é o que foi marcado à mão como
  // atual. O catálogo de games só entra se não houver nada cadastrado lá.
  const jogoAtivo = jogando[0]

  const lastUpdatedDate = new Date(NOW_LAST_UPDATED)

  return (
    <>
      {/* Hero */}
      <PageHero
        rotulo="Agora"
        icone={<Sparkles className="size-3.5" aria-hidden />}
        janela="now"
        titulo={
          <>
            O que ando
            <br />
            <span className="text-gradient-brand-claro">fazendo</span>
          </>
        }
        descricao={
          <>
            Esta página é um snapshot de onde estou — trabalho,
            estudos, hobbies. Inspirada no movimento{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline-offset-2 hover:underline"
            >
              /now
            </a>{" "}
            do Derek Sivers.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-brand" />
            {NOW_LOCATION}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-brand" />
            Atualizado em {dateFormatter.format(lastUpdatedDate)}
          </span>
        </div>
      </PageHero>

      {/* Live snapshot — auto-puxado dos dados */}
      <section className="container mx-auto max-w-4xl px-5 sm:px-6 pt-12 pb-8">
        <ScrollReveal>
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
            Em tempo real
          </p>
        </ScrollReveal>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Spotify (live) */}
          <ScrollReveal delay={0.05}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <Music className="size-3 text-brand" />
                Tocando
              </div>
              {/* Sem Spotify ao vivo, cai no que você declarou no admin —
                  nunca na faixa fictícia do fallback. */}
              <SpotifyNowPlaying
                className="!flex !max-w-none !border-0 !p-0"
                fallbackContent={
                  currently.ouvindo.visible &&
                  currently.ouvindo.title.trim() ? (
                    <CardLinha
                      titulo={currently.ouvindo.title}
                      detalhe={currently.ouvindo.subtitle}
                      href={currently.ouvindo.link || undefined}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      {CURRENTLY_EMPTY_TEXT}
                    </p>
                  )
                }
              />
            </div>
          </ScrollReveal>

          {/* Livro atual */}
          <ScrollReveal delay={0.1}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <BookMarked className="size-3 text-brand" />
                Lendo
              </div>
              {currently.lendo.visible && currently.lendo.title.trim() ? (
                <CardLinha
                  titulo={currently.lendo.title}
                  detalhe={currently.lendo.subtitle}
                  href={currently.lendo.link || undefined}
                  imagem={null}
                />
              ) : currentBook ? (
                <CardLinha
                  titulo={currentBook.title}
                  detalhe={currentBook.author}
                  href={`/livros/${currentBook.slug}`}
                  imagem={currentBook.coverImage}
                />
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  {CURRENTLY_EMPTY_TEXT}
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Jogo atual */}
          <ScrollReveal delay={0.15}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                <Gamepad2 className="size-3 text-brand" />
                Jogando
              </div>
              {jogoAtivo ? (
                <CardLinha
                  titulo={jogoAtivo.title}
                  detalhe={jogoAtivo.platform}
                  imagem={jogoAtivo.coverImage || null}
                />
              ) : currentGame ? (
                <CardLinha
                  titulo={currentGame.title}
                  detalhe={currentGame.platforms[0] ?? ""}
                  href={`/games/${currentGame.slug}`}
                  imagem={currentGame.coverImage}
                />
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  {CURRENTLY_EMPTY_TEXT}
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Jogando agora — cards grandes com a capa ao fundo */}
      <PlayingNow jogos={jogando} />

      {/* Footer hint */}
      <section className="container mx-auto max-w-3xl px-5 sm:px-6 pt-16 pb-24">
        <ScrollReveal>
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="font-mono text-[0.65rem] uppercase"
            >
              Movimento /now · nownownow.com
            </Badge>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
