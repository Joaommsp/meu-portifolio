import { ArrowDown } from "lucide-react"

/**
 * Seta no pé do hero. Diz que a página continua quando o hero ocupa
 * a tela inteira. Usado pelo HeroSobreposto (internas) e pela primeira camada
 * da pilha da home.
 */
export function IndicadorRolagem() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted-foreground max-md:hidden"
    >
      <ArrowDown className="size-4 motion-safe:animate-bounce" />
    </div>
  )
}
