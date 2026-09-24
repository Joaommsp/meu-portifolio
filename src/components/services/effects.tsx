import type * as React from "react"

import type { EfeitoServico } from "@/lib/servicos-content"

/**
 * Fundos animados dos cards de serviço — e dos heros das páginas deles.
 *
 * Um efeito por serviço, e cada um diz algo sobre o trabalho: a onda contínua
 * é manutenção de site, o feixe que desce é dado atravessando um sistema, o meteoro é lançamento de app, o blob sobre a malha é a forma
 * livre encontrando o grid — que é literalmente o que design de software faz.
 *
 * Todos são markup estático + keyframes (`fx-*` no globals.css): sem "use
 * client", sem canvas, sem rAF. São quatro rodando juntos no meio da home.
 *
 * CONTRATO: cada um preenche o pai, que precisa ser `relative` e recortar o
 * excesso. Quem usa põe o véu por cima — aqui ninguém escurece nada, pra que
 * quem chama decida quanto do efeito deixa passar.
 *
 * Nenhum efeito conhece a superfície onde pousou: todos leem `--brand` e
 * `--pattern-line` do tema. Sobre o creme sai a tinta calibrada pro creme;
 * dentro de `superficie-painel` a mesma linha já sai no passo claro do
 * accent, porque a utility reaponta o token. Ler `--brand-glow` direto aqui
 * seria o efeito adivinhando onde está.
 *
 * `denso` é a diferença entre o card e o hero. A contagem de um card de 260px
 * de largura some num hero de 1100px — e não é questão de opacidade, é de
 * quantidade. Por isso os elementos são GERADOS a partir de uma contagem, em
 * vez de listados à mão em dois tamanhos.
 */

/** Alfa do halo que assenta o efeito na superfície. */
const HALO_ALFA = 0.2

export type PropsEfeito = {
  /** Contagem de hero em vez de contagem de card. */
  denso?: boolean
}

/**
 * Sequência pseudoaleatória ESTÁVEL: a mesma entrada dá sempre a mesma saída,
 * no servidor e no cliente. `Math.random` aqui quebraria a hidratação.
 */
function serie(i: number, semente: number) {
  const x = Math.sin(i * 12.9898 + semente) * 43758.5453
  // Arredondado: `Math.sin` não é bit-exato entre engines, e sem cortar a
  // precisão um ULP de diferença mudaria a string do style. Também encolhe o
  // HTML — eram 17 dígitos por atributo.
  return Math.round((x - Math.floor(x)) * 1000) / 1000
}

/** Distribui `n` itens pela largura, com folga nas duas pontas. */
function coluna(i: number, n: number) {
  return `${((i + 0.5) / n) * 100}%`
}

/** Camada decorativa que preenche o pai. Some do leitor de tela. */
function Camada({ children }: { children?: React.ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {children}
    </div>
  )
}

/** Halo do accent que impede o efeito de flutuar solto sobre a superfície. */
function Halo({ elipse }: { elipse: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse ${elipse}, oklch(from var(--brand) l c h / ${HALO_ALFA}) 0%, transparent 72%)`,
      }}
    />
  )
}

/**
 * As três ondas. A de trás é a mais lenta — é o que dá profundidade.
 *
 * A EMENDA: a faixa tem 200% da largura do pai e desliza -50%, o que sobre o
 * viewBox de 1200 dá exatamente 600 unidades. Pra onda voltar ao ponto de
 * partida sem salto, o período dela precisa DIVIDIR 600 — por isso 300, 200 e
 * 600, e não qualquer número que desenhe uma curva bonita.
 *
 * A altura passa de 100% do pai de propósito: no viewBox a crista fica na
 * METADE da caixa, então uma onda da altura do card teria a crista no meio e
 * o corpo inteiro debaixo do véu, que é forte justamente ali embaixo.
 */
const ONDAS = [
  {
    id: "frente",
    altura: "132%",
    opacidade: 0.26,
    duracao: "16s",
    /* período 300 (4 ciclos) */
    curva:
      "M0,70 C100,26 200,114 300,70 C400,26 500,114 600,70 C700,26 800,114 900,70 C1000,26 1100,114 1200,70 L1200,140 L0,140 Z",
  },
  {
    id: "meio",
    altura: "114%",
    opacidade: 0.18,
    duracao: "24s",
    /* período 200 (6 ciclos), fase invertida */
    curva:
      "M0,70 C50,92 150,48 200,70 C250,92 350,48 400,70 C450,92 550,48 600,70 C650,92 750,48 800,70 C850,92 950,48 1000,70 C1050,92 1150,48 1200,70 L1200,140 L0,140 Z",
  },
  {
    id: "fundo",
    altura: "96%",
    opacidade: 0.11,
    duracao: "32s",
    /* período 600 (2 ciclos) — a marola longa */
    curva:
      "M0,70 C150,34 450,106 600,70 C750,34 1050,106 1200,70 L1200,140 L0,140 Z",
  },
] as const

/**
 * Sites — ondas contínuas subindo do rodapé.
 *
 * Não tem `denso`: onda já ocupa a largura inteira, e mais camadas viram
 * borrão em vez de profundidade.
 */
export function WavesEffect() {
  return (
    <Camada>
      {ONDAS.map(({ id, altura, opacidade, duracao, curva }) => (
        <svg
          key={id}
          viewBox="0 0 1200 140"
          preserveAspectRatio="none"
          className="fx-wave absolute bottom-0 left-0 w-[200%] fill-brand"
          style={{ height: altura, opacity: opacidade, animationDuration: duracao }}
        >
          <path d={curva} />
        </svg>
      ))}
    </Camada>
  )
}

/**
 * Sistemas: feixes descendo.
 *
 * Tinha uma grade de linhas atrás, removida. Fundo quadriculado é o clichê
 * mais batido de interface gerada por IA, e aqui ele não estava dizendo nada
 * que os feixes já não digam.
 */
export function BeamsEffect({ denso }: PropsEfeito) {
  const total = denso ? 9 : 4

  return (
    <Camada>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="fx-beam absolute top-0 w-px opacity-55"
          style={{
            left: coluna(i, total),
            height: `${16 + serie(i, 1) * 22}%`,
            animationDuration: `${4.4 + serie(i, 2) * 2.8}s`,
            animationDelay: `${serie(i, 3) * 4}s`,
            background:
              "linear-gradient(to bottom, transparent, var(--brand), transparent)",
          }}
        />
      ))}
      <Halo elipse="80% 42% at 50% 24%" />
    </Camada>
  )
}

/** Aplicativos — meteoros cruzando na diagonal. */
export function MeteorsEffect({ denso }: PropsEfeito) {
  const total = denso ? 10 : 4

  return (
    <Camada>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          /* Rotação em torno do CENTRO (origem padrão): a caixa girada
             continua centrada onde estava, então `left`/`top` seguem
             previsíveis. Com `origin-right` a caixa era arremessada pra fora
             e o `overflow-hidden` comia o meteoro inteiro.

             135° manda a ponta direita pra baixo-e-esquerda, que é a direção
             do deslocamento — por isso o brilho fica em `to right`: a cabeça
             lidera e o rastro fica pra trás. */
          className="fx-meteor absolute h-px rotate-135 opacity-55"
          style={{
            /* Passa de 100% de propósito: o meteoro anda pra baixo-esquerda,
               então quem nasce fora da borda direita ainda cruza a área. */
            top: `${(denso ? -22 : -14) + serie(i, 13) * (denso ? 70 : 26)}%`,
            left: `${18 + (i / total) * 116}%`,
            /* Distância percorrida: 300px atravessam um card, mas num hero
               mal saem do canto. */
            ["--fx-dist" as string]: denso ? "680px" : "300px",
            width: `${78 + serie(i, 4) * 84}px`,
            animationDuration: `${4.4 + serie(i, 5) * 2.6}s`,
            animationDelay: `${serie(i, 6) * 5}s`,
            background: "linear-gradient(to right, var(--brand), transparent)",
          }}
        />
      ))}
      <Halo elipse="90% 46% at 76% 12%" />
    </Camada>
  )
}

/** Raios de borda dos blobs — formas irregulares, não círculos. */
const RAIOS_BLOB = [
  "48% 52% 60% 40% / 55% 45% 55% 45%",
  "62% 38% 44% 56% / 42% 58% 42% 58%",
  "40% 60% 55% 45% / 60% 40% 60% 40%",
  "56% 44% 38% 62% / 48% 62% 38% 52%",
  "44% 56% 52% 48% / 58% 42% 58% 42%",
]

/** Design — formas orgânicas à deriva sobre a malha de pontos. */
export function DriftEffect({ denso }: PropsEfeito) {
  const total = denso ? 5 : 3

  return (
    <Camada>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="fx-drift absolute aspect-square bg-brand"
          style={{
            top: `${-18 + serie(i, 7) * 38}%`,
            left: `${-12 + (i / total) * 104}%`,
            width: `${(denso ? 24 : 54) + serie(i, 8) * 18}%`,
            borderRadius: RAIOS_BLOB[i % RAIOS_BLOB.length],
            /* Em hero as formas são muito maiores; a mesma alfa do card
               vira mancha chapada. */
            opacity: (denso ? 0.06 : 0.1) + serie(i, 9) * (denso ? 0.09 : 0.16),
            filter: `blur(${4 + serie(i, 10) * 3}px)`,
            animationDuration: `${17 + serie(i, 11) * 10}s`,
            animationDelay: `${serie(i, 12) * 7}s`,
          }}
        />
      ))}
      {/* Malha de pontos na mesma tinta dos outros padrões decorativos. Não é
          o `DotPattern`: aquele traz uma máscara de vinheta que, num card
          deste tamanho, apaga os pontos nas bordas onde o blob encosta. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(oklch(from var(--pattern-line) l c h / 0.14) 1px, transparent 1px)",
          backgroundSize: denso ? "28px 28px" : "20px 20px",
        }}
      />
    </Camada>
  )
}

/**
 * Do nome do efeito no conteúdo pro componente que o desenha.
 *
 * Mora aqui, e não em quem usa, porque são DOIS consumidores — o card da home
 * e o hero da página de serviço — e é justamente essa dupla que faz o card
 * clicado e a página que abre parecerem a mesma coisa.
 */
export const EFEITOS = {
  ondas: WavesEffect,
  feixes: BeamsEffect,
  meteoros: MeteorsEffect,
  blobs: DriftEffect,
} as const satisfies Record<EfeitoServico, React.ComponentType<PropsEfeito>>
