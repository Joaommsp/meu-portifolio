import type * as React from "react"

/**
 * Fundos animados dos cards de serviço.
 *
 * Um efeito por serviço, e cada um diz algo sobre o trabalho: a onda contínua
 * é manutenção de site, o feixe varrendo a grade é dado atravessando um
 * sistema, o meteoro é lançamento de app, o blob sobre a malha é a forma
 * livre encontrando o grid — que é literalmente o que design de software faz.
 *
 * Todos são markup estático + keyframes (`fx-*` no globals.css): sem "use
 * client", sem canvas, sem rAF. São quatro rodando juntos no meio da home.
 *
 * CONTRATO: cada um preenche o pai, que precisa ser `relative` e recortar o
 * excesso. Quem usa põe o véu por cima — aqui ninguém escurece nada, pra que
 * o card decida quanto do efeito deixa passar.
 *
 * Nenhum efeito conhece a superfície onde pousou: todos leem `--brand` e
 * `--pattern-line` do tema. Sobre o creme sai a tinta calibrada pro creme;
 * dentro de `superficie-painel` a mesma linha já sai no passo claro do
 * accent, porque a utility reaponta o token. Ler `--brand-glow` direto aqui
 * seria o efeito adivinhando onde está.
 */

/** Alfa do halo que assenta o efeito no card. */
const HALO_ALFA = 0.2

/** Alfa das linhas de grade — o mesmo das outras grades do projeto. */
const GRADE_ALFA = 0.05

/** Camada decorativa que preenche o card. Some do leitor de tela. */
function Camada({
  className,
  children,
  style,
}: {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 overflow-hidden"}
      style={style}
    >
      {children}
    </div>
  )
}

/** Halo do accent que impede o efeito de flutuar solto sobre o painel. */
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

/** Posições em %: o card muda de largura entre os breakpoints. */
const FEIXES = [
  { id: "a", esquerda: "16%", altura: "26%", duracao: "5s", atraso: "0s" },
  { id: "b", esquerda: "38%", altura: "18%", duracao: "6.2s", atraso: "1.4s" },
  { id: "c", esquerda: "62%", altura: "32%", duracao: "4.6s", atraso: "2.7s" },
  { id: "d", esquerda: "86%", altura: "21%", duracao: "7s", atraso: "0.7s" },
] as const

const METEOROS = [
  { id: "a", esquerda: "30%", largura: "120px", duracao: "5.4s", atraso: "0s" },
  { id: "b", esquerda: "55%", largura: "84px", duracao: "6.8s", atraso: "1.2s" },
  { id: "c", esquerda: "80%", largura: "150px", duracao: "4.8s", atraso: "2.6s" },
  { id: "d", esquerda: "105%", largura: "100px", duracao: "6s", atraso: "3.6s" },
] as const

const BLOBS = [
  {
    id: "a",
    topo: "-9%",
    esquerda: "-11%",
    tamanho: "62%",
    raio: "48% 52% 60% 40% / 55% 45% 55% 45%",
    opacidade: 0.26,
    desfoque: "4px",
    duracao: "18s",
    atraso: "0s",
  },
  {
    id: "b",
    topo: "9%",
    esquerda: "44%",
    tamanho: "54%",
    raio: "62% 38% 44% 56% / 42% 58% 42% 58%",
    opacidade: 0.18,
    desfoque: "5px",
    duracao: "22s",
    atraso: "3s",
  },
  {
    id: "c",
    topo: "-15%",
    esquerda: "35%",
    tamanho: "70%",
    raio: "40% 60% 55% 45% / 60% 40% 60% 40%",
    opacidade: 0.12,
    desfoque: "6px",
    duracao: "26s",
    atraso: "6s",
  },
] as const

/**
 * As três ondas. A de trás é a mais lenta — é o que dá profundidade.
 *
 * A EMENDA: a faixa tem 200% da largura do card e desliza -50%, o que sobre o
 * viewBox de 1200 dá exatamente 600 unidades. Pra onda voltar ao ponto de
 * partida sem salto, o período dela precisa DIVIDIR 600 — por isso 300, 200 e
 * 600, e não qualquer número que desenhe uma curva bonita.
 *
 * A altura passa de 100% do card de propósito: no viewBox a crista fica na
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

/** Sites — ondas contínuas subindo do rodapé do card. */
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

/** Sistemas — feixes descendo por uma grade. */
export function BeamsEffect() {
  return (
    <Camada>
      {/* Mesma fórmula das outras grades do projeto (About, ProjectCard,
          projetos/[slug]): a linha é a tinta de padrão decorativo diluída,
          e dentro do painel `--pattern-line` já aponta pro creme. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(from var(--pattern-line) l c h / ${GRADE_ALFA}) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(from var(--pattern-line) l c h / ${GRADE_ALFA}) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      {FEIXES.map(({ id, esquerda, altura, duracao, atraso }) => (
        <span
          key={id}
          className="fx-beam absolute top-0 w-px opacity-55"
          style={{
            left: esquerda,
            height: altura,
            animationDuration: duracao,
            animationDelay: atraso,
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
export function MeteorsEffect() {
  return (
    <Camada>
      {METEOROS.map(({ id, esquerda, largura, duracao, atraso }) => (
        <span
          key={id}
          /* Rotação em torno do CENTRO (origem padrão): a caixa girada
             continua centrada onde estava, então `left`/`top` seguem
             previsíveis. Com `origin-right` a caixa era arremessada pra fora
             do card e o `overflow-hidden` comia o meteoro inteiro.

             135° manda a ponta direita pra baixo-e-esquerda, que é a direção
             do deslocamento — por isso o brilho fica em `to right`: a cabeça
             lidera e o rastro fica pra trás. */
          className="fx-meteor absolute top-[-8%] h-px rotate-135 opacity-55"
          style={{
            left: esquerda,
            width: largura,
            animationDuration: duracao,
            animationDelay: atraso,
            background: "linear-gradient(to right, var(--brand), transparent)",
          }}
        />
      ))}
      <Halo elipse="90% 46% at 76% 12%" />
    </Camada>
  )
}

/** Design — formas orgânicas à deriva sobre a malha de pontos. */
export function DriftEffect() {
  return (
    <Camada>
      {BLOBS.map(
        ({ id, topo, esquerda, tamanho, raio, opacidade, desfoque, duracao, atraso }) => (
          <span
            key={id}
            className="fx-drift absolute aspect-square bg-brand"
            style={{
              top: topo,
              left: esquerda,
              width: tamanho,
              borderRadius: raio,
              opacity: opacidade,
              filter: `blur(${desfoque})`,
              animationDuration: duracao,
              animationDelay: atraso,
            }}
          />
        )
      )}
      {/* Malha de pontos na mesma tinta dos outros padrões decorativos. Não é
          o `DotPattern`: aquele traz uma máscara de vinheta que, num card
          deste tamanho, apaga os pontos justamente nas bordas onde o blob
          encosta. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(oklch(from var(--pattern-line) l c h / 0.14) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
    </Camada>
  )
}
