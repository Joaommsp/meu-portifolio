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
import type { FigmaFile, FigmaFileInput } from "@/types/figma"

/**
 * CRUD dos arquivos da Figma Community (admin, no browser).
 * A leitura pública da /figma usa a REST API em `lib/firebase/rest.ts`.
 */

const COLLECTION = "figma"

type FigmaFileDoc = Omit<FigmaFile, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

function toFigmaFile(id: string, data: FigmaFileDoc): FigmaFile {
  return {
    ...data,
    id,
    likes: typeof data.likes === "number" ? data.likes : 0,
    users: typeof data.users === "number" ? data.users : 0,
    order: typeof data.order === "number" ? data.order : 0,
    visible: Boolean(data.visible),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function listFigmaFiles(): Promise<FigmaFile[]> {
  const db = requireDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("order", "asc"))
  )
  return snap.docs.map((d) => toFigmaFile(d.id, d.data() as FigmaFileDoc))
}

export async function getFigmaFile(id: string): Promise<FigmaFile | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return toFigmaFile(snap.id, snap.data() as FigmaFileDoc)
}

export async function createFigmaFile(input: FigmaFileInput): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateFigmaFile(
  id: string,
  input: Partial<FigmaFileInput>
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteFigmaFile(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}
