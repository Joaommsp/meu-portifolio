"use client"

import type * as React from "react"

import { BotaoPausa, useVideoPausavel } from "@/components/services/video-pausavel"

type Props = {
  src: string
  poster: string
  /** A cor chapada do fundo do vídeo, pra sobra ao redor dele não aparecer. */
  fundo: string
}

/**
 * O hero que é SÓ o vídeo (a copy fica abaixo, na folha que sobe).
 *
 * No desktop ocupa o palco inteiro com `object-contain`: numa tela que não é
 * 16:9, o `cover` cortaria as bordas do vídeo, e com `contain` a sobra fica na
 * cor do próprio fundo do vídeo e some. No celular vira um bloco com borda e
 * cantos, recuado das laterais (como o vídeo da landing do front-barber), e a
 * copy vem logo abaixo.
 *
 * `pt-16` desconta o header fixo, pro vídeo não começar embaixo dele. O fundo
 * do vídeo pinta o palco só no desktop; no celular pinta só o bloco.
 *
 * Toca sempre, inclusive com `prefers-reduced-motion`, pela mesma decisão do
 * HeroVideo; o botão de pausa cobre a WCAG 2.2.2.
 */
export function VideoDoPalco({ src, poster, fundo }: Props) {
  const { montar, tocando, alternar, aoTocar, aoPausar } = useVideoPausavel()

  return (
    <div
      className="px-4 pt-20 pb-2 md:h-(--altura-palco) md:bg-(--fundo-video) md:px-0 md:pt-16 md:pb-0"
      style={{ "--fundo-video": fundo } as React.CSSProperties}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-(--fundo-video) shadow-sm md:size-full md:rounded-none md:border-0 md:shadow-none">
        <video
          ref={montar}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onPlay={aoTocar}
          onPause={aoPausar}
          className="block aspect-video w-full object-contain md:aspect-auto md:size-full"
        />
        <BotaoPausa
          tocando={tocando}
          onClick={alternar}
          className="right-3 bottom-3 flex md:right-6 md:bottom-6"
        />
      </div>
    </div>
  )
}
