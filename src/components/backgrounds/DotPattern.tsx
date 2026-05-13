import { cn } from "@/lib/utils"

type Props = {
  className?: string
  size?: number
  dotSize?: number
  opacity?: number
}

/**
 * Pontos uniformemente distribuídos. Use como camada decorativa
 * sutil atrás de seções.
 */
export function DotPattern({
  className,
  size = 22,
  dotSize = 1,
  opacity = 0.12,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
      style={{
        backgroundImage: `radial-gradient(oklch(1 0 0 / ${opacity}) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 70% 60% at center, black 40%, transparent 90%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at center, black 40%, transparent 90%)",
      }}
    />
  )
}
