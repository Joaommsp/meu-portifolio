"use client"

import * as React from "react"

/**
 * Carrega a coleção de uma listagem pública e separa os três estados que a
 * tela precisa distinguir: carregando, falhou e carregado.
 *
 * `carregar` precisa ser ESTÁVEL (uma função de módulo, não uma arrow criada
 * no render): ela entra nas deps do efeito, e uma referência nova a cada
 * render refaria a consulta sem parar.
 */
export function useListagem<T>(carregar: () => Promise<T[]>) {
  const [itens, setItens] = React.useState<T[] | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [tentativa, setTentativa] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    carregar()
      .then((lista) => {
        if (!cancelado) setItens(lista)
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelado = true
    }
  }, [carregar, tentativa])

  const tentarDeNovo = React.useCallback(() => {
    setErro(null)
    setItens(null)
    setTentativa((n) => n + 1)
  }, [])

  return {
    itens,
    erro,
    carregando: itens === null && erro === null,
    tentarDeNovo,
  }
}

/** "1 post", "3 posts". */
export function contagem(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/**
 * O contador do painel de filtros. Enquanto carrega ou depois de falhar não há
 * número a mostrar: "0 posts" ali diria que a coleção está vazia, e não está.
 */
export function rotuloContador(
  estado: { carregando: boolean; erro: string | null },
  n: number,
  singular: string,
  plural: string
): string {
  if (estado.carregando) return "Carregando…"
  if (estado.erro) return "Não carregou"
  return contagem(n, singular, plural)
}
