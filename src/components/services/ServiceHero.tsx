import { GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { EFEITOS } from "@/components/services/effects"
import { CopyDoServico } from "@/components/services/CopyDoServico"
import { HeroVideo } from "@/components/services/HeroVideo"
import { CASCA_HERO_BASE } from "@/components/sections/secao"
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
 * O vídeo só entra a partir de `lg`. Abaixo disso o hero fica em pé, o
 * `object-cover` amplia o quadro 16:9 e a tipografia que existe DENTRO do
 * vídeo cai gigante atrás do resumo. Ali vale o efeito do card, como nas
 * páginas sem vídeo.
 *
 * Ocupa uma tela, o palco do HeroSobreposto (`CASCA_HERO_BASE`, sem o
 * `isolate` da CASCA_HERO, porque aqui ele quebraria o blend):
 *
 * A seção NÃO leva `isolate`. Ele criaria um grupo de blending isolado, e o
 * `mix-blend-multiply` do vídeo passaria a compor contra um backdrop
 * transparente em vez do creme do body: o branco do vídeo voltaria a aparecer
 * como um retângulo.
 */
export function ServiceHero({ servico }: Props) {
  const Efeito = EFEITOS[servico.efeito]
  const { video } = servico

  const fundoEfeito = (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ maskImage: MASCARA_EFEITO, WebkitMaskImage: MASCARA_EFEITO }}
    >
      <Efeito denso />
    </div>
  )

  return (
    <section className={CASCA_HERO_BASE}>
      {video ? (
        <HeroVideo
          src={video.src}
          poster={video.poster}
          opacidade={video.opacidade}
          fundoAbaixoDoLg={fundoEfeito}
        />
      ) : (
        fundoEfeito
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

      <CopyDoServico servico={servico} className="py-24 md:py-28" />
    </section>
  )
}
