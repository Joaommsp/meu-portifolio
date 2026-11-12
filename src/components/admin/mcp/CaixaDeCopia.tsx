"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TEMPO_DO_COPIADO_MS = 2000

type Props = {
  texto: string
  /** Nome acessível do botão ("Copiar endereço do MCP"). */
  rotulo: string
  /** Texto de várias linhas (configuração, prompt): quebra e rola. */
  alto?: boolean
  className?: string
}

/**
 * Caixa de cópia: o texto em monoespaçada e o botão Copiar. Sem permissão de
 * área de transferência, seleciona o texto para o Ctrl+C.
 */
export function CaixaDeCopia({ texto, rotulo, alto = false, className }: Props) {
  const codigo = React.useRef<HTMLElement>(null)
  const [copiado, setCopiado] = React.useState(false)

  React.useEffect(() => {
    if (!copiado) return
    const t = window.setTimeout(() => setCopiado(false), TEMPO_DO_COPIADO_MS)
    return () => window.clearTimeout(t)
  }, [copiado])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      const alvo = codigo.current
      const selecao = window.getSelection()
      if (!alvo || !selecao) return
      const faixa = document.createRange()
      faixa.selectNodeContents(alvo)
      selecao.removeAllRanges()
      selecao.addRange(faixa)
    }
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-muted",
        className
      )}
    >
      <code
        ref={codigo}
        className={cn(
          "min-w-0 flex-1 overflow-x-auto px-2.5 py-2 font-mono text-xs",
          alto
            ? "max-h-64 overflow-y-auto break-all whitespace-pre-wrap"
            : "whitespace-pre"
        )}
      >
        {texto}
      </code>
      <Button
        type="button"
        variant="ghost"
        onClick={copiar}
        aria-label={rotulo}
        className="h-auto shrink-0 cursor-pointer rounded-none border-l border-input bg-card px-3 text-xs"
      >
        {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copiado ? "Copiado" : "Copiar"}
      </Button>
    </div>
  )
}
