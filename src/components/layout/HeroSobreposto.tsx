"use client"

import * as React from "react"

import { IndicadorRolagem } from "@/components/layout/IndicadorRolagem"
import { cn } from "@/lib/utils"

type Props = {
  /** O hero da página (Hero, PageHero, ServiceHero). Fica preso. */
  hero: React.ReactNode
  /** O resto da página: é a folha que sobe por cima do hero. */
  children: React.ReactNode
  /**
   * Prende o hero só a partir de `md`. Pro hero que é só um vídeo 16:9: numa
   * tela em pé ele vira uma faixa pequena, então no celular aparece na largura
   * e a folha vem logo abaixo, sem prender (como na landing do gfi-docs).
   */
  soNoDesktop?: boolean
}

/** O `md` do Tailwind (48rem). Tem que bater com os `md:` do `soNoDesktop`. */
const MIDIA_MD = "(min-width: 48rem)"

/** Folga da medição: arredondamento de subpixel não desliga o efeito. */
const TOLERANCIA_PX = 1

/**
 * Hero preso e conteúdo que sobe por cima dele, no formato da landing do
 * gfi-docs.
 *
 * Só CSS: a trilha tem duas telas de altura e o palco, com o hero, fica preso
 * (`sticky`) dentro dela. A folha com o conteúdo começa com margem negativa de
 * uma tela, então a primeira tela mostra só o hero; ao rolar, a folha sobe e o
 * encobre. O hero não sai empurrado, ele fica e é coberto.
 *
 * "Uma tela" é `--altura-palco` (globals.css): trilha, palco, margem da folha
 * e o `min-h` dos heros leem a mesma variável, porque precisam concordar.
 *
 * O palco é opaco (`fundo-pagina`). `sticky` sempre cria um grupo de
 * composição isolado, e o `mix-blend-multiply` do vídeo do ServiceHero
 * passaria a compor contra um palco transparente: o branco do vídeo voltaria.
 *
 * Hero mais alto que o palco (a home no celular) seria cortado. Nesse caso o
 * efeito desliga e a página volta ao fluxo normal. O servidor renderiza com o
 * efeito; o cliente mede antes da primeira pintura e corrige.
 */
export function HeroSobreposto({ hero, children, soNoDesktop = false }: Props) {
  const trilhaRef = React.useRef<HTMLDivElement>(null)
  const heroRef = React.useRef<HTMLDivElement>(null)
  const sondaRef = React.useRef<HTMLDivElement>(null)
  const [estatico, setEstatico] = React.useState(false)

  React.useLayoutEffect(() => {
    const heroEl = heroRef.current
    const sonda = sondaRef.current
    if (!heroEl || !sonda) return

    // Compara com a sonda (uma tela em `svh`, a mesma medida do palco), e não
    // com `innerHeight`, que acompanha a barra do navegador do celular.
    const medir = () =>
      setEstatico(heroEl.offsetHeight > sonda.offsetHeight + TOLERANCIA_PX)
    const observador = new ResizeObserver(medir)
    observador.observe(heroEl)
    observador.observe(sonda)
    return () => observador.disconnect()
  }, [])

  /* Foco de teclado num botão do hero já encoberto pela folha: o `sticky`
     mantém o botão "visível" pro navegador, que não rola, e o foco fica
     escondido. Volta a trilha pro topo, onde o hero aparece inteiro. */
  const revelarHero = React.useCallback(() => {
    const trilha = trilhaRef.current
    if (!trilha || estatico) return
    if (soNoDesktop && !window.matchMedia(MIDIA_MD).matches) return
    if (trilha.getBoundingClientRect().top < 0) {
      trilha.scrollIntoView({ block: "start" })
    }
  }, [estatico, soNoDesktop])

  return (
    <>
      <div
        ref={trilhaRef}
        className={cn(
          "relative",
          !estatico &&
            (soNoDesktop
              ? "md:h-[calc(2*var(--altura-palco))]"
              : "h-[calc(2*var(--altura-palco))]")
        )}
      >
        <div
          aria-hidden
          ref={sondaRef}
          className="pointer-events-none invisible absolute top-0 h-(--altura-palco) w-px"
        />
        <div
          onFocusCapture={revelarHero}
          className={cn(
            !estatico &&
              (soNoDesktop
                ? "md:fundo-pagina md:sticky md:top-0 md:h-(--altura-palco) md:overflow-hidden"
                : "fundo-pagina sticky top-0 h-(--altura-palco) overflow-hidden")
          )}
        >
          <div ref={heroRef}>{hero}</div>
          {!estatico && (
            <div className={cn(soNoDesktop && "hidden md:block")}>
              <IndicadorRolagem />
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative z-10",
          // `min-h`: conteúdo menor que uma tela deixaria a trilha passar do fim
          // da folha, e o palco preso pintaria o hero por cima do footer.
          !estatico &&
            (soNoDesktop
              ? "md:folha-conteudo md:-mt-(--altura-palco) md:min-h-(--altura-palco) md:overflow-clip"
              : "folha-conteudo -mt-(--altura-palco) min-h-(--altura-palco) overflow-clip")
        )}
      >
        {children}
      </div>
    </>
  )
}
