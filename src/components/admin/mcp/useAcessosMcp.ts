"use client"

import * as React from "react"

import {
  apagarAcesso,
  criarChave,
  criarUnico,
  encerrarAcesso,
  listarAcessos,
  revogarAcesso,
  listarAtividade,
  type ListaDeAcessos,
} from "@/lib/admin-api/mcp"
import type { AcessoVisto, RegistroVisto } from "@/lib/mcp/tipos"

import { useFonte } from "./useFonte"

const SEM_ACESSOS: readonly AcessoVisto[] = []
const SEM_REGISTROS: readonly RegistroVisto[] = []

/** Um bloco da tela: carregando só enquanto ainda não houve resposta. */
export type Bloco<T> = {
  dados: T
  carregando: boolean
  /** Mensagem do servidor, como veio. */
  erro: string | null
}

/**
 * Dados da tela `/admin/mcp` em blocos (chaves, únicos, endereço do MCP,
 * atividade), cada um com o próprio carregando e erro. As `acoes` (criar,
 * revogar, encerrar, apagar) chamam a API e recarregam tudo.
 */
export function useAcessosMcp() {
  const acessos = useFonte<ListaDeAcessos>(listarAcessos)
  const atividade = useFonte<RegistroVisto[]>(listarAtividade)

  const pessoais = React.useMemo<Bloco<readonly AcessoVisto[]>>(
    () => ({
      dados: acessos.dados?.pessoais ?? SEM_ACESSOS,
      carregando: acessos.carregando,
      erro: acessos.erro,
    }),
    [acessos.dados, acessos.carregando, acessos.erro]
  )

  const unicos = React.useMemo<Bloco<readonly AcessoVisto[]>>(
    () => ({
      dados: acessos.dados?.unicos ?? SEM_ACESSOS,
      carregando: acessos.carregando,
      erro: acessos.erro,
    }),
    [acessos.dados, acessos.carregando, acessos.erro]
  )

  /** Endereço resolvido pelo servidor; vem junto com a lista. */
  const enderecoMcp = React.useMemo<Bloco<string>>(
    () => ({
      dados: acessos.dados?.enderecoMcp ?? "",
      carregando: acessos.carregando,
      erro: acessos.erro,
    }),
    [acessos.dados, acessos.carregando, acessos.erro]
  )

  const registros = React.useMemo<Bloco<readonly RegistroVisto[]>>(
    () => ({
      dados: atividade.dados ?? SEM_REGISTROS,
      carregando: atividade.carregando,
      erro: atividade.erro,
    }),
    [atividade.dados, atividade.carregando, atividade.erro]
  )

  const recarregarAcessos = acessos.recarregar
  const recarregarAtividade = atividade.recarregar
  const recarregar = React.useCallback(() => {
    recarregarAcessos()
    recarregarAtividade()
  }, [recarregarAcessos, recarregarAtividade])

  /** Roda a ação e recarrega listas e atividade; o erro sobe para quem chamou. */
  const depoisRecarrega = React.useCallback(
    <A extends unknown[], R>(acao: (...args: A) => Promise<R>) =>
      async (...args: A): Promise<R> => {
        const resultado = await acao(...args)
        recarregar()
        return resultado
      },
    [recarregar]
  )

  const acoes = React.useMemo(
    () => ({
      criarChave: depoisRecarrega(criarChave),
      criarUnico: depoisRecarrega(criarUnico),
      revogar: depoisRecarrega(revogarAcesso),
      encerrar: depoisRecarrega(encerrarAcesso),
      apagar: depoisRecarrega(apagarAcesso),
    }),
    [depoisRecarrega]
  )

  return {
    pessoais,
    unicos,
    enderecoMcp,
    atividade: registros,
    recarregarAcessos,
    recarregarAtividade,
    recarregar,
    acoes,
  }
}
