"use client"

import * as React from "react"

import { BotaoPausa, useVideoPausavel } from "@/components/services/video-pausavel"

type Props = {
  src: string
  poster: string
  /** Menor que 1 pra vídeo com cor e tipografia, que competem com o título. */
  opacidade?: number
  /**
   * O fundo abaixo de `lg`, onde o vídeo não entra. Vem de fora, mas quem
   * decide ONDE ele aparece é este componente: os três `lg` (vídeo, botão e
   * fundo) e o `MIDIA_VIDEO` ficam no mesmo arquivo e não saem de sincronia.
   */
  fundoAbaixoDoLg: React.ReactNode
}

/**
 * Vídeo de fundo do hero.
 *
 * TOCA SEMPRE, inclusive pra quem tem `prefers-reduced-motion` ligado. Foi
 * decisão do dono do site, depois de uma versão que respeitava a preferência
 * e deixava a página com cara de print: o poster é o último quadro, o site já
 * montado, e quem tinha a preferência ativa no sistema (muita gente tem sem
 * saber) nunca via a animação nem entendia por quê.
 *
 * O botão de pausa (BotaoPausa) é o que mantém a página acessível agora que a
 * preferência do sistema deixou de ser respeitada.
 */
export function HeroVideo({ src, poster, opacidade, fundoAbaixoDoLg }: Props) {
  const { ref, montar, tocando, alternar, aoTocar, aoPausar } = useVideoPausavel()

  React.useEffect(() => {
    const mq = window.matchMedia(MIDIA_VIDEO)

    // `autoPlay` cobre o caso normal. Este play() existe pro caso de a
    // política do navegador ter recusado o primeiro: recusa não é erro, o
    // botão continua ali.
    if (mq.matches) void ref.current?.play().catch(() => {})

    /* O `media` do `<source>` só é lido quando o navegador escolhe a fonte.
       Quem cruza o `lg` sem recarregar (tablet girando, janela alargada)
       ficaria com o vídeo sem arquivo e o botão sem efeito: aqui ele carrega.
       No sentido contrário, pausa, pra não decodificar escondido. */
    function aoCruzarLg() {
      const video = ref.current
      if (!video) return
      if (!mq.matches) {
        video.pause()
        return
      }
      if (!video.currentSrc) video.load()
      void video.play().catch(() => {})
    }

    mq.addEventListener("change", aoCruzarLg)
    return () => mq.removeEventListener("change", aoCruzarLg)
  }, [ref])

  return (
    <>
      {/* `mix-blend-multiply`: o vídeo foi renderizado em fundo BRANCO e a
          página é creme. Sem o blend, ele vira um retângulo branco no meio do
          creme; com ele, o branco some e sobram as peças e as sombras.

          A máscara radial dissolve as quatro bordas. O quadro tem um leve
          degradê cinza nesse branco, e sob multiply a borda da caixa apareceria
          como uma emenda reta.

          `hidden lg:block` + `<source media>`: abaixo de `lg` quem aparece é o
          `fundoAbaixoDoLg`, e o `media` é o que impede o navegador de baixar
          o vídeo só pra esconder. O `poster` ainda é baixado (o navegador busca
          o atributo mesmo com o elemento escondido): 50 a 100 KB, aceitos pra
          manter o quadro pintado no SSR do desktop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
      >
        {fundoAbaixoDoLg}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden mix-blend-multiply lg:block"
        style={{ maskImage: MASCARA, WebkitMaskImage: MASCARA, opacity: opacidade }}
      >
        {/* O arquivo é VAI-E-VOLTA: monta o site, segura montado por ~3s,
            desmonta e volta ao quadro inicial. Como o último quadro é igual ao
            primeiro, `loop` emenda sem corte. */}
        <video
          ref={montar}
          className="size-full object-cover"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlay={aoTocar}
          onPause={aoPausar}
        >
          <source src={src} media={MIDIA_VIDEO} />
        </video>
      </div>

      <BotaoPausa
        tocando={tocando}
        onClick={alternar}
        className="right-5 bottom-5 hidden lg:flex"
      />
    </>
  )
}

/**
 * Dissolve o vídeo antes de ele encontrar a borda da seção.
 *
 * O RAIO VERTICAL É O QUE IMPORTA. O quadro é 16:9 e o hero é mais largo que
 * isso, então `object-cover` escala pela largura e corta topo e base. Com o
 * transparente em 76% de um raio de 60%, a máscara zera a 45,6% do centro,
 * antes dos 50% da borda: o corte acontece onde já não se vê nada.
 *
 * O raio horizontal é folgado de propósito. A seção ocupa a largura toda, não
 * há creme ao lado pra fazer emenda, e apertar ali só espremeria a composição.
 */
const MASCARA =
  "radial-gradient(ellipse 90% 60% at 50% 50%, #000 26%, transparent 76%)"

/** O `lg` do Tailwind (64rem). Tem que bater com o `lg:` das classes acima. */
const MIDIA_VIDEO = "(min-width: 64rem)"
