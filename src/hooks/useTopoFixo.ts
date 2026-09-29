"use client"

import * as React from "react"

/**
 * Onde a seção empilhada prende (`top` do sticky).
 *
 * A que cabe na tela prende em 0. A mais alta só prende quando a BASE dela
 * encosta na base da tela (top negativo): assim todo o conteúdo é lido antes
 * de a seção seguinte começar a cobrir. 1500px numa tela de 900px prende em
 * -600px.
 */
function topoDaSecao(alturaDaTela: number, alturaDaSecao: number): number {
  return Math.min(0, alturaDaTela - alturaDaSecao)
}

/**
 * Mede a seção contra a sonda (uma tela em `--altura-palco`, `svh`) e devolve
 * o `top` do sticky.
 *
 * A sonda, e não `window.innerHeight`: no celular a barra do navegador aparece
 * e some durante a rolagem, `innerHeight` muda junto e o `top` saltaria no
 * meio do scroll. `useLayoutEffect` pra medir antes da primeira pintura: com
 * 0 nesse frame, a seção alta prenderia cedo e depois pularia.
 */
export function useTopoFixo(
  camada: React.RefObject<HTMLElement | null>,
  sonda: React.RefObject<HTMLElement | null>
): number {
  const [topo, setTopo] = React.useState(0)

  React.useLayoutEffect(() => {
    const elemento = camada.current
    const tela = sonda.current
    if (!elemento || !tela) return
    // O ResizeObserver dispara ao começar a observar: é a primeira medida.
    const medir = () => setTopo(topoDaSecao(tela.offsetHeight, elemento.offsetHeight))
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    observador.observe(tela)
    return () => observador.disconnect()
  }, [camada, sonda])

  return topo
}
