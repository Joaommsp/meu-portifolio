import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

import { requireDb } from "./config"
import {
  normalizarItens,
  type UsesCategory,
  type UsesCategoryInput,
} from "@/types/uses"

/**
 * CRUD das categorias da /uses (admin, no browser).
 * A leitura pública usa a REST API em `lib/firebase/rest.ts`.
 */

const COLLECTION = "uses"

type UsesDoc = Omit<UsesCategory, "id" | "createdAt" | "updatedAt" | "items"> & {
  items: unknown
  createdAt: Timestamp
  updatedAt: Timestamp
}

function toCategory(id: string, data: UsesDoc): UsesCategory {
  return {
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    items: normalizarItens(data.items),
    order: typeof data.order === "number" ? data.order : 0,
    visible: Boolean(data.visible),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function listUsesCategories(): Promise<UsesCategory[]> {
  const db = requireDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("order", "asc"))
  )
  return snap.docs.map((d) => toCategory(d.id, d.data() as UsesDoc))
}

export async function getUsesCategory(
  id: string
): Promise<UsesCategory | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return toCategory(snap.id, snap.data() as UsesDoc)
}

export async function createUsesCategory(
  input: UsesCategoryInput
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateUsesCategory(
  id: string,
  input: Partial<UsesCategoryInput>
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteUsesCategory(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}
