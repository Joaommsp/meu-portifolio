"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

type Props = {
  src: string
  poster: string
  /** Menor que 1 pra vídeo com cor e tipografia, que competem com o título. */
  opacidade?: number
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
 * O BOTÃO NÃO É OPCIONAL. A WCAG 2.2.2 exige um jeito de parar qualquer coisa
 * que se mova sozinha por mais de 5 segundos, e isto roda em loop infinito.
 * Ele é o que mantém a página acessível agora que a preferência do sistema
 * deixou de ser respeitada.
 */
export function HeroVideo({ src, poster, opacidade }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [tocando, setTocando] = React.useState(false)

  /* O vídeo tem `autoPlay`, então ele já começou a tocar quando o React
     hidrata: o evento `play` disparou antes de existir listener, e o botão
     ficava dizendo "Reproduzir" com o vídeo rodando. O ref callback roda no
     commit e lê o estado real do elemento. */
  const montar = React.useCallback((node: HTMLVideoElement | null) => {
    ref.current = node
    if (node) setTocando(!node.paused)
  }, [])

  React.useEffect(() => {
    // `autoPlay` cobre o caso normal. Este play() existe pro caso de a
    // política do navegador ter recusado o primeiro: recusa não é erro, o
    // botão continua ali.
    void ref.current?.play().catch(() => {})
  }, [])

  function alternar() {
    const video = ref.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }

  return (
    <>
      {/* `mix-blend-multiply`: o vídeo foi renderizado em fundo BRANCO e a
          página é creme. Sem o blend, ele vira um retângulo branco no meio do
          creme; com ele, o branco some e sobram as peças e as sombras.

          A máscara radial dissolve as quatro bordas. O quadro tem um leve
          degradê cinza nesse branco, e sob multiply a borda da caixa apareceria
          como uma emenda reta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ maskImage: MASCARA, WebkitMaskImage: MASCARA, opacity: opacidade }}
      >
        {/* O arquivo é VAI-E-VOLTA: monta o site, segura montado por ~3s,
            desmonta e volta ao quadro inicial. Como o último quadro é igual ao
            primeiro, `loop` emenda sem corte. */}
        <video
          ref={montar}
          className="size-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlay={() => setTocando(true)}
          onPause={() => setTocando(false)}
        />
      </div>

      <button
        type="button"
        onClick={alternar}
        aria-label={
          tocando ? "Pausar a animação de fundo" : "Reproduzir a animação de fundo"
        }
        className="absolute right-5 bottom-5 z-10 flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-brand"
      >
        {tocando ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
      </button>
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
