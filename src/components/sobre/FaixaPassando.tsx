import { FAIXA_ITENS } from "@/lib/sobre-content"

/** Some nas duas pontas em vez de cortar o texto em seco. */
const MASCARA_BORDAS =
  "[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"

/**
 * Pílula de vidro com o que eu faço passando sem parar: texto em cinza e um
 * traço fino entre os itens. No desktop fica no container, com margem lateral;
 * no celular vai de borda a borda, sem raio. A máscara das pontas mora num
 * wrapper DENTRO da pílula: aplicada nela própria, apagaria as pontas do vidro
 * junto com o texto. A lista vai
 * duas vezes: a animação anda metade do trilho e recomeça no mesmo ponto, sem
 * emenda visível.
 *
 * Movimento reduzido: a faixa fica parada. Com o mouse em cima, pausa. Leitor
 * de tela recebe a lista uma vez só, pelo `aria-label`.
 */
export function FaixaPassando() {
  const sequencia = [...FAIXA_ITENS, ...FAIXA_ITENS]

  return (
    <div className="md:container md:mx-auto md:mt-20 md:max-w-6xl md:px-6">
      <div
        role="img"
        aria-label={`O que eu faço: ${FAIXA_ITENS.join(", ")}`}
        className="vidro group overflow-hidden rounded-none py-4 md:rounded-full md:py-5"
      >
        <div className={MASCARA_BORDAS}>
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
      </div>
    </div>
  )
}
