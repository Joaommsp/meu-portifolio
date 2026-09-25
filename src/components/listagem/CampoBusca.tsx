import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"

type Props = {
  valor: string
  onChange: (valor: string) => void
  placeholder: string
  /** Nome acessível do campo ("Buscar livros"). */
  rotulo: string
}

/**
 * A busca das listagens públicas: lupa, campo e o X de limpar.
 *
 * Eram quatro cópias, uma por página.
 */
export function CampoBusca({ valor, onChange, placeholder, rotulo }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={rotulo}
      />
      {valor && (
        /* O X tem 16px; o `after:-inset-3.5` leva a área de toque a 44px. */
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors after:absolute after:-inset-3.5 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
