"use client"

import * as React from "react"

import { mensagemDoErro } from "./erros"

type Estado<T> = {
  /** De qual `carregar` vieram os dados: trocar a fonte não mostra o resultado da anterior. */
  fonte: () => Promise<T>
  dados: T | null
  erro: string | null
}

/**
 * Carrega uma fonte e guarda carregando/erro/dados. Ao recarregar, mantém o
 * que já estava na tela: só a primeira carga mostra esqueleto. Trocar o
 * `carregar` (ex.: outro recurso) volta ao carregando.
 */
export function useFonte<T>(carregar: () => Promise<T>) {
  const [estado, setEstado] = React.useState<Estado<T> | null>(null)
  const [versao, setVersao] = React.useState(0)

  React.useEffect(() => {
    let vivo = true
    carregar()
      .then((valor) => {
        if (vivo) setEstado({ fonte: carregar, dados: valor, erro: null })
      })
      .catch((e: unknown) => {
        if (!vivo) return
        setEstado((atual) => ({
          fonte: carregar,
          dados: atual?.fonte === carregar ? atual.dados : null,
          erro: mensagemDoErro(e),
        }))
      })
    return () => {
      vivo = false
    }
  }, [carregar, versao])

  const recarregar = React.useCallback(() => {
    setEstado((atual) => atual && { ...atual, erro: null })
    setVersao((n) => n + 1)
  }, [])

  const atual = estado?.fonte === carregar ? estado : null
  const dados = atual?.dados ?? null
  const erro = atual?.erro ?? null
  return { dados, erro, carregando: dados === null && erro === null, recarregar }
}
