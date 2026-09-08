"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Tipo = "cmd" | "saida" | "ok"

type Linha = { tipo: Tipo; txt: string }

/**
 * Comandos reais deste projeto, não texto de enfeite. A janela leva o nome do
 * dono no título; comando genérico ali soaria falso.
 */
const ROTEIRO: readonly Linha[] = [
  { tipo: "cmd", txt: "npm run dev" },
  { tipo: "saida", txt: "▲ Next.js 16.2.4 (Turbopack)" },
  { tipo: "saida", txt: "- Local:  http://localhost:3001" },
  { tipo: "ok", txt: "✓ Ready in 1.4s" },
  { tipo: "cmd", txt: "npm run check:accents" },
  { tipo: "ok", txt: "✓ 8 accents · contraste >= 4.5:1" },
  { tipo: "cmd", txt: 'git commit -m "feat(hero): retrato em duotone"' },
  { tipo: "saida", txt: "[main 9f2c1ab] 4 arquivos alterados" },
  { tipo: "cmd", txt: "vercel --prod" },
  { tipo: "ok", txt: "✓ https://joaomarcos.dev" },
] as const

/* Ritmo da digitação, em ms por caractere. Comando é lento (é alguém
   digitando); saída é rápida (é a máquina cuspindo). */
const MS_POR_CHAR_CMD = 34
const MS_POR_CHAR_SAIDA = 8
/* Pausa depois que a linha termina, antes da próxima. */
const PAUSA_APOS_CMD = 420
const PAUSA_APOS_SAIDA = 130
/* Respiro antes de limpar a tela e recomeçar o roteiro. */
const PAUSA_ANTES_DE_REINICIAR = 1600
/* Quantas linhas ficam visíveis; as antigas somem por cima, sob a máscara. */
const MAX_LINHAS = 9

/**
 * Terminal esmaecido: digita e executa o roteiro em loop, por cima da foto.
 *
 * Some quando o elemento sai da tela (IntersectionObserver) — não faz sentido
 * animar texto que ninguém está vendo, e o hero passa a maior parte do tempo
 * fora do viewport. Em `prefers-reduced-motion` nada digita: mostra o bloco
 * inteiro parado.
 *
 * É decorativo, então vai inteiro com `aria-hidden`: para um leitor de tela
 * isso seria só ruído entre o título e os CTAs.
 */
export function TerminalOverlay({ className }: { className?: string }) {
  const reduzido = usePrefersReducedMotion()
  const [linhas, setLinhas] = React.useState<Linha[]>([])
  const [parcial, setParcial] = React.useState<Linha | null>(null)
  const caixaRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Em reduced-motion o roteiro é derivado direto no render (ver `visiveis`),
    // sem estado — setState síncrono aqui dispararia render em cascata.
    if (reduzido) return

    const caixa = caixaRef.current
    if (!caixa) return

    let timer = 0
    let indice = 0
    let visivel = true
    let acumulado: Linha[] = []

    function agendar(fn: () => void, ms: number) {
      timer = window.setTimeout(() => {
        // Fora da tela: segura o roteiro onde está e tenta de novo depois.
        if (!visivel) {
          agendar(fn, 400)
          return
        }
        fn()
      }, ms)
    }

    function digitar(linha: Linha, n: number) {
      const completa = n >= linha.txt.length
      setParcial({ tipo: linha.tipo, txt: linha.txt.slice(0, n) })

      if (!completa) {
        const ritmo =
          linha.tipo === "cmd" ? MS_POR_CHAR_CMD : MS_POR_CHAR_SAIDA
        agendar(() => digitar(linha, n + 1), ritmo)
        return
      }

      acumulado = [...acumulado, linha].slice(-MAX_LINHAS)
      setLinhas(acumulado)
      setParcial(null)
      indice += 1

      if (indice >= ROTEIRO.length) {
        agendar(() => {
          acumulado = []
          indice = 0
          setLinhas([])
          proxima()
        }, PAUSA_ANTES_DE_REINICIAR)
        return
      }

      agendar(
        proxima,
        linha.tipo === "cmd" ? PAUSA_APOS_CMD : PAUSA_APOS_SAIDA
      )
    }

    function proxima() {
      const linha = ROTEIRO[indice]
      if (!linha) return
      digitar(linha, 1)
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada?.isIntersecting ?? true
      },
      { threshold: 0 }
    )
    observador.observe(caixa)

    // O primeiro setState sai de dentro de um timer, não do corpo do efeito:
    // setState síncrono em efeito dispara render em cascata (e o lint do React
    // reclama, com razão).
    agendar(proxima, 600)

    return () => {
      window.clearTimeout(timer)
      observador.disconnect()
    }
  }, [reduzido])

  const visiveis = reduzido
    ? [...ROTEIRO]
    : parcial
      ? [...linhas, parcial]
      : linhas

  return (
    <div
      ref={caixaRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex flex-col justify-end gap-[3px]",
        "px-5 pb-6 pt-7 font-mono text-[11.5px] leading-[1.65] sm:px-8 sm:pl-10",
        "[mask-image:linear-gradient(to_bottom,transparent_0%,#000_26%,#000_88%,transparent_100%)]",
        "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_26%,#000_88%,transparent_100%)]",
        className
      )}
      style={{
        color: "var(--terminal-texto)",
        textShadow: "0 1px 3px oklch(from var(--foreground) l c h / 0.45)",
      }}
    >
      {visiveis.map((linha, i) => (
        <div key={`${i}-${linha.txt}`} className="whitespace-pre">
          {linha.tipo === "cmd" && (
            <span style={{ color: "var(--terminal-prompt)" }}>$ </span>
          )}
          <span
            style={
              linha.tipo === "ok"
                ? { color: "var(--terminal-ok)" }
                : linha.tipo === "saida"
                  ? { color: "var(--terminal-dim)" }
                  : undefined
            }
          >
            {linha.txt}
          </span>
          {parcial && i === visiveis.length - 1 && (
            <span className="ml-0.5 inline-block h-[13px] w-[7px] animate-pulse align-[-2px] bg-current" />
          )}
        </div>
      ))}
    </div>
  )
}
