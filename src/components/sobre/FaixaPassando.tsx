import { FAIXA_ITENS } from "@/lib/sobre-content"

/** Some nas duas pontas em vez de cortar o texto em seco. */
const MASCARA_BORDAS =
  "[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"

/**
 * Faixa reta e discreta com o que eu faço passando sem parar: linhas finas em
 * cima e embaixo, fundo quase transparente, texto em cinza e um traço fino
 * entre os itens. A lista vai
 * duas vezes: a animação anda metade do trilho e recomeça no mesmo ponto, sem
 * emenda visível.
 *
 * Movimento reduzido: a faixa fica parada. Com o mouse em cima, pausa. Leitor
 * de tela recebe a lista uma vez só, pelo `aria-label`.
 */
export function FaixaPassando() {
  const sequencia = [...FAIXA_ITENS, ...FAIXA_ITENS]

  return (
    <div
      role="img"
      aria-label={`O que eu faço: ${FAIXA_ITENS.join(", ")}`}
      className={`group overflow-hidden border-y border-border bg-card/40 py-4 md:mt-20 md:py-5 ${MASCARA_BORDAS}`}
    >
      <div
        aria-hidden
        className="flex w-max animate-[faixa-passa_48s_linear_infinite] items-center gap-6 pl-6 group-hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-8 md:pl-8"
      >
        {sequencia.map((item, i) => (
          <span key={i} className="flex items-center gap-6 md:gap-8">
            <span className="text-sm font-medium whitespace-nowrap text-muted-foreground md:text-base">
              {item}
            </span>
            <span className="h-4 w-px shrink-0 bg-border" />
          </span>
        ))}
      </div>
    </div>
  )
}
