import Link from "next/link"

import { FadeIn, SlideIn } from "@/components/animations"
import { GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { ContactActions } from "@/components/services/ContactActions"
import { EFEITOS } from "@/components/services/effects"
import { HeroVideo } from "@/components/services/HeroVideo"
import { DISPONIBILIDADE } from "@/lib/site"
import type { Servico } from "@/lib/servicos-content"

const ORBS = [
  {
    size: 420,
    x: "12%",
    y: "20%",
    color: "var(--orb-1)",
    duration: 18,
    delay: 0,
    opacity: 0.22,
  },
  {
    size: 340,
    x: "74%",
    y: "62%",
    color: "var(--orb-2)",
    duration: 22,
    delay: 2,
    opacity: 0.18,
  },
]

/** Dissolve as bordas do efeito, como a máscara do vídeo faz com o dele. */
const MASCARA_EFEITO =
  "radial-gradient(ellipse 78% 72% at 50% 46%, #000 38%, transparent 84%)"

type Props = { servico: Servico }

/**
 * Hero da página de serviço: composição centrada, fundo atrás do texto.
 *
 * O fundo é o vídeo 3D quando o serviço tem um, e o efeito do próprio card da
 * home quando não tem. Quem clica no card dos meteoros cai numa página com
 * meteoros, e a passagem de uma tela pra outra fica óbvia sem transição.
 *
 * A seção NÃO leva `isolate`. Ele criaria um grupo de blending isolado, e o
 * `mix-blend-multiply` do vídeo passaria a compor contra um backdrop
 * transparente em vez do creme do body: o branco do vídeo voltaria a aparecer
 * como um retângulo.
 */
export function ServiceHero({ servico }: Props) {
  const Efeito = EFEITOS[servico.efeito]
  const { video } = servico

  return (
    <section className="relative flex min-h-152 items-center overflow-hidden lg:min-h-176">
      {video ? (
        <HeroVideo
          src={video.src}
          poster={video.poster}
          opacidade={video.opacidade}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ maskImage: MASCARA_EFEITO, WebkitMaskImage: MASCARA_EFEITO }}
        >
          <Efeito denso />
        </div>
      )}

      <GradientOrbs orbs={ORBS} />
      <NoiseTexture opacity={0.04} />

      {/* Véu uniforme: com a composição centrada, o texto pousa EM CIMA das
          peças, e não ao lado delas. Um gradiente direcional não resolve isso;
          o que resolve é rebaixar o fundo inteiro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "oklch(from var(--background) l c h / 0.66)" }}
      />

      <div className="container relative mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-6 md:py-28">
        <FadeIn>
          <nav
            aria-label="Trilha"
            className="flex items-center justify-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.3em]"
          >
            <Link href="/#services" className="text-muted-foreground hover:text-brand">
              Serviços
            </Link>
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
            <span className="text-brand">{servico.rotulo}</span>
          </nav>
        </FadeIn>

        <SlideIn direction="up" delay={0.1}>
          <h1 className="mt-7 font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-balance md:text-7xl">
            {servico.titulo.antes}{" "}
            <span className="text-gradient-brand">{servico.titulo.destaque}</span>
            {servico.titulo.depois ? ` ${servico.titulo.depois}` : null}
          </h1>
        </SlideIn>

        <SlideIn direction="up" delay={0.18}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {servico.resumo}
          </p>
        </SlideIn>

        <SlideIn direction="up" delay={0.26}>
          <ContactActions className="mt-10 justify-center" />
        </SlideIn>

        <SlideIn direction="up" delay={0.34}>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <li>{DISPONIBILIDADE.resposta}</li>
            <li>{DISPONIBILIDADE.base}</li>
          </ul>
        </SlideIn>
      </div>
    </section>
  )
}
