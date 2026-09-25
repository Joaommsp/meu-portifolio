"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  /** Os itens já renderizados (podem vir de um server component). */
  itens: React.ReactNode[]
  /** Quantos aparecem antes do "mostrar mais". */
  inicial: number
  /** O nome dos itens no botão: "Mostrar os outros 18 repositórios". */
  nomeItens: string
  className?: string
}

/**
 * Lista longa que abre com os primeiros itens e um botão pro resto.
 *
 * O botão alterna em vez de sumir: ao abrir, o foco continua nele (agora
 * "Mostrar menos"), e quem navega por teclado não cai no topo da página.
 */
export function ListaExpansivel({ itens, inicial, nomeItens, className }: Props) {
  const [aberta, setAberta] = React.useState(false)
  const id = React.useId()
  const restantes = itens.length - inicial

  if (restantes <= 0) return <div className={className}>{itens}</div>

  return (
    <>
      <div id={id} className={className}>
        {aberta ? itens : itens.slice(0, inicial)}
      </div>
      <Button
        variant="outline"
        className="mt-4 w-full sm:w-auto"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={() => setAberta((v) => !v)}
      >
        {aberta ? "Mostrar menos" : `Mostrar os outros ${restantes} ${nomeItens}`}
        <ChevronDown
          className={aberta ? "rotate-180 transition-transform" : "transition-transform"}
          data-icon="inline-end"
          aria-hidden
        />
      </Button>
    </>
  )
}
