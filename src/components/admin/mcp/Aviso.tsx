import { TriangleAlert } from "lucide-react"

type Props = {
  children: React.ReactNode
  /** `alert` quando o aviso surge por uma ação; `status` quando é estado da tela. */
  papel?: "alert" | "status"
}

/** Faixa de aviso da tela do MCP (segredo mostrado uma vez, limite de chaves). */
export function Aviso({ children, papel = "alert" }: Props) {
  return (
    <div
      role={papel}
      className="flex items-center gap-2 rounded-lg bg-warning/10 px-2.5 py-2 text-sm text-warning-texto"
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  )
}
