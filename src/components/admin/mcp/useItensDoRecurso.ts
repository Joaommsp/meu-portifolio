"use client"

import * as React from "react"

import type { Recurso } from "@/lib/conteudo/tipos"
import { listarItensDoRecurso, type ItemDoRecurso } from "@/lib/firebase/itens"

import { useFonte } from "./useFonte"

const SEM_ITENS: readonly ItemDoRecurso[] = []

/** Itens do recurso escolhido no uso único; troca de recurso recarrega. */
export function useItensDoRecurso(recurso: Recurso) {
  const carregar = React.useCallback(() => listarItensDoRecurso(recurso), [recurso])
  const { dados, erro, carregando, recarregar } = useFonte(carregar)
  return { itens: dados ?? SEM_ITENS, erro, carregando, tentarDeNovo: recarregar }
}
