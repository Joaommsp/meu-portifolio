import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

import { requireDb } from "./config"
import { CURRENTLY_SLOTS, EMPTY_CURRENTLY, type Currently } from "@/types/currently"
import { atualmente, normalizarItemAtual } from "@/lib/conteudo/atualmente"

/**
 * Escrita e leitura autenticada do "O que tá rolando" (admin, no browser).
 * A leitura pública das páginas usa a REST API em `lib/firebase/rest.ts`.
 *
 * É um documento único — `site/currently` — porque as três categorias são
 * fixas. Coleção só faria sentido se a lista fosse variável.
 */

const COLLECTION = atualmente.colecao
// Documento único: a definição sempre traz o id.
const DOC_ID = atualmente.idDoDocumentoUnico!

/** Leitura para o admin — sempre devolve a estrutura completa. */
export async function getCurrently(): Promise<Currently> {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, DOC_ID))
  if (!snap.exists()) return { ...EMPTY_CURRENTLY, exists: false }

  const data = snap.data()
  const out = { ...EMPTY_CURRENTLY, exists: true } as Currently
  for (const slot of CURRENTLY_SLOTS) {
    out[slot] = normalizarItemAtual(data[slot])
  }
  const ts = data.updatedAt
  out.updatedAt =
    ts && typeof ts.toDate === "function" ? (ts.toDate() as Date) : null
  return out
}

/**
 * `updatedAt` do argumento é ignorado de propósito — quem carimba a data é o
 * servidor, não o cliente.
 */
export async function saveCurrently(valor: Currently): Promise<void> {
  const db = requireDb()
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  for (const slot of CURRENTLY_SLOTS) {
    payload[slot] = normalizarItemAtual(valor[slot])
  }
  await setDoc(doc(db, COLLECTION, DOC_ID), payload, { merge: true })
}
