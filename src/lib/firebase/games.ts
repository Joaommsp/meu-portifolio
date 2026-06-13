import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore"

import { requireDb } from "./config"
import type { Game, GameDoc, GameInput } from "@/types/game"

const GAMES_COLLECTION = "games"

/** Converte GameDoc (Firestore) → Game (UI). Normaliza arrays ausentes. */
function toGame(id: string, data: Omit<GameDoc, "id">): Game {
  return {
    ...data,
    id,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    platforms: Array.isArray(data.platforms) ? data.platforms : [],
    genres: Array.isArray(data.genres) ? data.genres : [],
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

type ListGamesOptions = {
  publishedOnly?: boolean
  featuredOnly?: boolean
  status?: string
  limit?: number
}

export async function listGames(
  options: ListGamesOptions = {}
): Promise<Game[]> {
  const db = requireDb()
  const constraints: QueryConstraint[] = []
  if (options.publishedOnly) {
    constraints.push(where("published", "==", true))
  }
  if (options.featuredOnly) {
    constraints.push(where("featured", "==", true))
  }
  if (options.status) {
    constraints.push(where("status", "==", options.status))
  }
  constraints.push(orderBy("yearPlayed", "desc"))
  if (options.limit) {
    constraints.push(fbLimit(options.limit))
  }

  const q = query(collection(db, GAMES_COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    toGame(d.id, d.data() as Omit<GameDoc, "id">)
  )
}

export async function getGame(id: string): Promise<Game | null> {
  const db = requireDb()
  const ref = doc(db, GAMES_COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toGame(snap.id, snap.data() as Omit<GameDoc, "id">)
}

export async function createGame(input: GameInput): Promise<string> {
  const db = requireDb()
  const now = serverTimestamp()
  const payload = {
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, GAMES_COLLECTION), payload)
  return ref.id
}

export async function updateGame(
  id: string,
  patch: Partial<GameInput>
): Promise<void> {
  const db = requireDb()
  const updates: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  }
  await updateDoc(doc(db, GAMES_COLLECTION, id), updates)
}

export async function deleteGame(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, GAMES_COLLECTION, id))
}

export async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const db = requireDb()
  const q = query(
    collection(db, GAMES_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return false
  return first.id !== excludeId
}

export { Timestamp }
