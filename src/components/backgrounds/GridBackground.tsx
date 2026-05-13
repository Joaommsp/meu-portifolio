import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Tamanho da célula em px. */
  size?: number
  /** Opacidade das linhas (0–1). */
  opacity?: number
}

/**
 * Grid SVG estilo Vercel/Linear — linhas finas com mask radial
 * pra desbotar nas bordas. 100% CSS, zero JS, super performático.
 */
export function GridBackground({
  className,
  size = 48,
  opacity = 0.06,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
      style={{
        backgroundImage: `
          linear-gradient(to right, oklch(1 0 0 / ${opacity}) 1px, transparent 1px),
          linear-gradient(to bottom, oklch(1 0 0 / ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 80% 60% at center, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at center, black 30%, transparent 80%)",
      }}
    />
  )
}
