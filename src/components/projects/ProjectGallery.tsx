"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, XIcon } from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * Proporção das molduras da galeria.
 *
 * As capturas de tela do portfólio saem em 1440x900 — 16:10. A moldura anterior
 * era 4:3 com `object-cover`, e a diferença entre as duas proporções virava
 * corte: sumia a barra lateral e o rodapé de toda captura. Casar a moldura com a
 * origem é o que faz a imagem aparecer inteira sem letterbox.
 *
 * Exportada porque o estado vazio da galeria, na página de detalhe, precisa da
 * mesma proporção — e a razão de existir desta constante é justamente as duas
 * não voltarem a divergir.
 *
 * Imagem que venha em outra proporção continua sendo cortada pelo `object-cover`
 * da grade, mas abre inteira no visor, que usa `object-contain`.
 */
export const PROPORCAO_MOLDURA = "aspect-16/10"

type Props = {
  /** URLs das imagens, na ordem em que devem aparecer. */
  images: string[]
  /** Título do projeto, usado para compor o texto alternativo. */
  title: string
}

export function ProjectGallery({ images, title }: Props) {
  // `null` = visor fechado. O índice guarda qual imagem está aberta.
  const [aberta, setAberta] = React.useState<number | null>(null)

  const total = images.length

  const irPara = React.useCallback(
    (indice: number) => {
      if (total === 0) return
      // Circula nas duas pontas: da última vai para a primeira e vice-versa.
      setAberta(((indice % total) + total) % total)
    },
    [total]
  )

  /*
    Deriva em vez de afirmar com `!`: se a lista encolher com o visor aberto, o
    índice antigo devolveria `undefined` e viraria `src={undefined}` em runtime.
    Assim o visor simplesmente não renderiza.
  */
  const imagemAtual = aberta === null ? undefined : images[aberta]

  function aoTeclar(evento: React.KeyboardEvent) {
    if (aberta === null) return
    if (evento.key === "ArrowLeft") {
      evento.preventDefault()
      irPara(aberta - 1)
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault()
      irPara(aberta + 1)
    }
  }

  /*
    Fecha só quando o clique é no próprio fundo, não em algo em cima dele.
    O `DialogOverlay` fica atrás do popup de tela cheia e nunca recebe clique,
    então o fechamento por fundo precisa morar aqui.
  */
  function fecharSeForFundo(evento: React.MouseEvent) {
    if (evento.target === evento.currentTarget) setAberta(null)
  }

  const textoAlternativo = (i: number) => `${title} — tela ${i + 1}`

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2">
        {images.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setAberta(i)}
              aria-label={`Ampliar ${textoAlternativo(i)}`}
              className={cn(
                PROPORCAO_MOLDURA,
                "group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-card",
                "transition duration-150",
                "hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-[0_10px_24px_var(--shadow-elevated)]",
                "motion-reduce:hover:translate-y-0",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              )}
            >
              <Image
                src={url}
                alt={textoAlternativo(i)}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 30rem, 100vw"
              />

              <span className="absolute top-2 right-2 rounded-md border border-border bg-background/85 px-1.5 py-0.5 font-mono text-xs tracking-wider text-muted-foreground">
                {i + 1}/{total}
              </span>

              {/*
                A legenda sobe no hover. Com movimento reduzido ela fica parada e
                visível, em vez de depender de uma transição que não vai rodar.
                Em tela de toque também: lá não existe hover, e sem ela nada
                dizia que a imagem abre.
              */}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 flex items-center justify-between gap-3",
                  "bg-linear-to-t from-foreground/80 to-transparent px-3 pt-6 pb-2.5",
                  "text-xs font-medium text-background",
                  "translate-y-full opacity-0 transition duration-150",
                  "group-hover:translate-y-0 group-hover:opacity-100",
                  "group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
                  "motion-reduce:translate-y-0 motion-reduce:opacity-100",
                  "pointer-coarse:translate-y-0 pointer-coarse:opacity-100"
                )}
              >
                Ampliar
                <Expand className="size-3.5 shrink-0" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={aberta !== null}
        onOpenChange={(estaAberto) => {
          if (!estaAberto) setAberta(null)
        }}
      >
        <DialogContent
          fullBleed
          showCloseButton={false}
          onKeyDown={aoTeclar}
          onClick={fecharSeForFundo}
          overlayClassName="bg-foreground/92 supports-backdrop-filter:backdrop-blur-sm"
          className="grid-rows-[auto_1fr_auto]"
        >
          {aberta !== null && imagemAtual ? (
            <>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-background">
                <DialogTitle className="text-sm font-medium">
                  {title}
                </DialogTitle>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs tracking-widest text-background/70 tabular-nums">
                    {aberta + 1} / {total}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAberta(null)}
                    aria-label="Fechar visor"
                    className="grid size-8 place-items-center rounded-full border border-background/20 text-background transition hover:bg-background/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                  >
                    <XIcon className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div
                onClick={fecharSeForFundo}
                className="relative grid min-h-0 cursor-zoom-out place-items-center px-4 sm:px-14"
              >
                {total > 1 && (
                  <button
                    type="button"
                    onClick={() => irPara(aberta - 1)}
                    aria-label="Imagem anterior"
                    className="absolute top-1/2 left-1 hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-background/20 bg-background/10 text-background transition hover:bg-background/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background sm:grid"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                )}

                <div className="relative size-full cursor-default">
                  <Image
                    src={imagemAtual}
                    alt={textoAlternativo(aberta)}
                    fill
                    className="rounded-lg object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>

                {total > 1 && (
                  <button
                    type="button"
                    onClick={() => irPara(aberta + 1)}
                    aria-label="Próxima imagem"
                    className="absolute top-1/2 right-1 hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-background/20 bg-background/10 text-background transition hover:bg-background/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background sm:grid"
                  >
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                )}
              </div>

              {total > 1 ? (
                <ul
                  onClick={fecharSeForFundo}
                  className="flex flex-wrap justify-center gap-2 px-4 pt-3 pb-5"
                >
                  {images.map((url, i) => (
                    <li key={url}>
                      <button
                        type="button"
                        onClick={() => irPara(i)}
                        aria-label={`Ir para ${textoAlternativo(i)}`}
                        aria-current={i === aberta}
                        className={cn(
                          PROPORCAO_MOLDURA,
                          "relative w-18 cursor-pointer overflow-hidden rounded-md border transition",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
                          i === aberta
                            ? "border-brand opacity-100"
                            : "border-background/20 opacity-45 hover:opacity-80"
                        )}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="4.5rem"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="pb-5" />
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
