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
import type { Playing, PlayingInput, PlayingStatus } from "@/types/playing"

/**
 * CRUD de "jogando agora" (admin, no browser).
 * A leitura pública da /agora usa a REST API em `lib/firebase/rest.ts`.
 */

const COLLECTION = "playing"

type PlayingDoc = Omit<Playing, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

function toPlaying(id: string, data: PlayingDoc): Playing {
  return {
    ...data,
    id,
    genres: Array.isArray(data.genres) ? data.genres : [],
    order: typeof data.order === "number" ? data.order : 0,
    visible: Boolean(data.visible),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function listPlaying(): Promise<Playing[]> {
  const db = requireDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("order", "asc"))
  )
  return snap.docs.map((d) => toPlaying(d.id, d.data() as PlayingDoc))
}

export async function getPlaying(id: string): Promise<Playing | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return toPlaying(snap.id, snap.data() as PlayingDoc)
}

export async function createPlaying(input: PlayingInput): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePlaying(
  id: string,
  input: Partial<PlayingInput>
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePlaying(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}

export type { PlayingStatus }
