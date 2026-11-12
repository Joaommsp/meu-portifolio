import { collection, getDocs, orderBy, query } from "firebase/firestore"

import { RECURSOS } from "@/lib/conteudo"
import type { Recurso } from "@/lib/conteudo/tipos"

import { requireDb } from "./config"

export type ItemDoRecurso = { id: string; titulo: string }

/** Campos que nomeiam um item, na ordem em que são procurados. */
const CAMPOS_DE_TITULO = ["title", "name"] as const

function tituloDe(id: string, dados: Record<string, unknown>): string {
  for (const campo of CAMPOS_DE_TITULO) {
    const valor = dados[campo]
    if (typeof valor === "string" && valor.trim()) return valor
  }
  return id
}

/**
 * Id e título dos itens de um recurso, na ordem do admin (admin, no browser).
 * Documento único não tem itens: devolve lista vazia.
 */
export async function listarItensDoRecurso(recurso: Recurso): Promise<ItemDoRecurso[]> {
  const definicao = RECURSOS[recurso]
  if (definicao.unico || !definicao.ordem) return []
  const snap = await getDocs(
    query(
      collection(requireDb(), definicao.colecao),
      orderBy(definicao.ordem.campo, definicao.ordem.direcao)
    )
  )
  return snap.docs.map((d) => ({ id: d.id, titulo: tituloDe(d.id, d.data()) }))
}
