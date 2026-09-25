import type * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Os filtros das listagens públicas (blog, games, livros, projetos).
 *
 * Eram quatro cópias iguais, uma por página, e todas com o mesmo defeito no
 * celular: chip de 20px de altura, 8px de vão entre eles.
 */

type FilterChipProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

/**
 * O chip tem 32px de caixa. O `after:-inset-2` estende a área de toque até
 * 46px: o `::after` conta a partir de dentro da borda de 1px, então os 8px
 * viram 7 pra fora da caixa. Com o `gap-3.5` (14px) do `FiltroGrupo`, as
 * áreas de chips vizinhos encostam sem se sobrepor, na linha e entre linhas.
 * `overflow-visible` desfaz o `overflow-hidden` do Badge, que recortaria isso.
 */
export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "relative h-8 cursor-pointer select-none overflow-visible px-3 font-mono text-xs transition-all after:absolute after:-inset-2",
        active
          ? "bg-brand text-brand-foreground hover:bg-brand-hover"
          : "hover:border-brand/60 hover:text-brand"
      )}
      render={<button type="button" onClick={onClick} aria-pressed={active} />}
    >
      {children}
    </Badge>
  )
}

/** Um grupo de filtros com o rótulo em cima ("Categoria", "Status"…). */
export function FiltroGrupo({
  rotulo,
  children,
}: {
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </p>
      <div className="flex flex-wrap gap-3.5">{children}</div>
    </div>
  )
}
