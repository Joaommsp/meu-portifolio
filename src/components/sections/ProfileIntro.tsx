import Image from "next/image"

import { DotMesh } from "@/components/backgrounds/DotMesh"
import { ScrollReveal } from "@/components/animations"
import { SOCIAL_LINKS } from "@/lib/nav"

/**
 * Arte com fundo transparente — pousa direto no creme, sem moldura própria.
 *
 * O enquadramento é O DO ARQUIVO: o WebP é o PNG original só escalado e
 * convertido, sem crop e sem pad. Cada tentativa de reenquadrar aqui cortou a
 * cabeça, porque um crop rente ao conteúdo tira a informação de dentro do
 * arquivo e aí nenhum object-fit recupera. Ao regerar, só `scale`.
 *
 * Um arquivo só para as duas larguras: a caixa é que se adapta (ver abaixo).
 */
const ILUSTRACAO = {
  src: "/images/ilustracao-v2.webp",
  /** Proporção do arquivo (1400x1276). A caixa do mobile usa a mesma. */
  proporcao: "1400 / 1276",
  alt: "Ilustração de João Marcos sentado num telhado, de camisa da seleção brasileira",
}

/**
 * Seção de apresentação: nome, o que faz e as redes.
 *
 * O conteúdo vive dentro de um CARD (borda, cantos arredondados,
 * `overflow-hidden`), e isso não é decoração: a arte tem corte reto na borda
 * direita — o telhado encosta no limite do arquivo. Solta na página, essa reta
 * fica órfã e parece defeito. Coincidindo com a borda do card, lê como
 * enquadramento. É o card que justifica o corte.
 *
 * São dois arquivos e duas caixas (ver comentários abaixo). No mobile a caixa
 * tem a proporção exata do arquivo, então nada é cortado em eixo nenhum.
 *
 * O véu de cima é fraco de propósito (a cabeça encosta no topo da arte) e o
 * de baixo é forte — é ele que dissolve os prédios no fim do card.
 */
export function ProfileIntro() {
  return (
    <section
      id="profile"
      // select-none: arrastar sobre a malha de pontos ia deixando texto
      // selecionado pelo caminho. Os links continuam clicáveis e o conteúdo
      // segue legível por leitor de tela — só a seleção do mouse sai.
      // Padding menor embaixo que em cima: a seção seguinte (About) já traz
      // py-32 (py-16 no celular), e os dois somados abriam um vão de 240px. O respiro de cima
      // continua inteiro, que é o que separa do hero.
      className="scroll-mt-20 pt-20 pb-10 select-none md:pt-28 md:pb-14"
    >
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-[18px] border border-border bg-background">
          {/* Wash rosa próprio do card — mesma família do fundo da página, mas
              recortado pelos cantos arredondados. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(56% 54% at 6% 6%, var(--wash-1) 0%, transparent 70%), radial-gradient(50% 50% at 97% 34%, var(--wash-3) 0%, transparent 72%)",
            }}
          />
          {/* z-0 sobrepõe o -z-10 que o DotMesh traz por padrão: aqui o card
              tem fundo opaco, e atrás dele a malha ficaria invisível. */}
          <DotMesh className="z-0" />

          {/* As três camadas são IRMÃS no card, e essa é a razão da estrutura:
              o gradiente precisa ficar acima da arte e abaixo do texto. Com a
              arte dentro de um grid, o grid vira contexto de empilhamento e
              nada lá dentro consegue subir acima de um irmão do grid — o
              gradiente lavava os links junto com a arte.

              Ordem de pintura: fundo (z-0) → arte (z-10) → gradiente (z-20)
              → texto (z-30). */}

          {/* Texto. No desktop ocupa a metade esquerda; no mobile, tudo. */}
          <ScrollReveal className="relative z-30 flex flex-col justify-center px-7 pt-14 pb-9 sm:px-10 md:min-h-155 md:w-[52%] md:py-16">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Frontend · UI/UX
            </p>
            <h2 className="font-display text-4xl font-bold leading-[0.94] tracking-tight sm:text-5xl lg:text-6xl">
              João
              <br />
              Marcos
            </h2>
            <p className="mt-4 max-w-[32ch] text-muted-foreground">
              Paulo Afonso, BA. Construo interfaces e desenho o que vem antes
              delas.
            </p>

            <ul className="mt-8 flex flex-col gap-px">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon, handle }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-3 inline-flex w-fit items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-tint hover:text-brand-hover"
                  >
                    <Icon className="size-4.75 shrink-0" />
                    <span className="flex flex-col leading-[1.28]">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {handle}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Arte. Bloco em fluxo no mobile (abaixo do texto) e camada
              absoluta encostada na direita a partir de md. */}
          {/* A proporção vem por CLASSE, não por style inline: inline vence
              media query, e o md:aspect-auto era ignorado — a caixa ficava
              travada na proporção do arquivo e encolhia no desktop, em vez de
              ocupar a altura toda do card. */}
          <div className="relative z-10 aspect-[1400/1276] w-full md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[52%]">
            <Image
              src={ILUSTRACAO.src}
              alt={ILUSTRACAO.alt}
              fill
              sizes="(max-width: 768px) 100vw, 54vw"
              /* object-bottom-right encosta na borda direita do card;
                 translate-y empurra a base pra fora, onde o overflow-hidden
                 do card corta o que sobra.
                 drop-shadow (e não box-shadow) porque a arte tem fundo
                 transparente: box-shadow desenharia a sombra do retângulo da
                 caixa; drop-shadow segue o contorno da figura. */
              className="translate-y-8 object-contain object-bottom-right grayscale-[0.65] drop-shadow-[0_18px_24px_var(--sombra-arte)] md:translate-y-12"
            />
          </div>

          {/* Gradiente do CARD, largura inteira: sem aresta vertical no meio. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                "linear-gradient(to top, var(--background) 0%, var(--veil-perfil-base) 11%, var(--veil-perfil-meio) 22%, var(--veil-perfil-fim) 34%, transparent 50%)",
            }}
          />
        </div>
      </div>
    </section>
  )
}
