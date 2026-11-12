/** Contador `n/max` abaixo do campo, no tom dos contadores dos formulários do admin. */
export function Contador({ atual, max }: { atual: number; max: number }) {
  return (
    <p className="text-xs text-muted-foreground tabular-nums">
      {atual}/{max}
    </p>
  )
}
