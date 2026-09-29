import { ArrowDown } from "lucide-react"

/**
 * "Role" + seta no pé do hero. Diz que a página continua quando o hero ocupa
 * a tela inteira. Usado pelo HeroSobreposto (internas) e pela primeira camada
 * da pilha da home.
 */
export function IndicadorRolagem() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
    >
      <span className="font-mono text-xs uppercase tracking-[0.3em]">Role</span>
      <ArrowDown className="size-4 motion-safe:animate-bounce" />
    </div>
  )
}
