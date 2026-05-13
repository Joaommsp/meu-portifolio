import { cn } from "@/lib/utils"

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`

type Props = {
  className?: string
  opacity?: number
}

/**
 * Camada de grain (SVG fractal noise inline em data-URL).
 * Sobrepor em qualquer seção pra dar textura "filme".
 * Como é só uma data-URL CSS, é leve e sem JS.
 */
export function NoiseTexture({ className, opacity = 0.04 }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 mix-blend-overlay",
        className
      )}
      style={{
        backgroundImage: `url("${NOISE_SVG}")`,
        opacity,
      }}
    />
  )
}
