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
import type { Book, BookDoc, BookInput } from "@/types/book"

const BOOKS_COLLECTION = "books"

function toBook(id: string, data: Omit<BookDoc, "id">): Book {
  return {
    ...data,
    id,
    genres: Array.isArray(data.genres) ? data.genres : [],
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

type ListBooksOptions = {
  publishedOnly?: boolean
  featuredOnly?: boolean
  status?: string
  limit?: number
}

export async function listBooks(
  options: ListBooksOptions = {}
): Promise<Book[]> {
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
  constraints.push(orderBy("yearRead", "desc"))
  if (options.limit) {
    constraints.push(fbLimit(options.limit))
  }

  const q = query(collection(db, BOOKS_COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    toBook(d.id, d.data() as Omit<BookDoc, "id">)
  )
}

export async function getBook(id: string): Promise<Book | null> {
  const db = requireDb()
  const ref = doc(db, BOOKS_COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toBook(snap.id, snap.data() as Omit<BookDoc, "id">)
}

export async function createBook(input: BookInput): Promise<string> {
  const db = requireDb()
  const now = serverTimestamp()
  const payload = {
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, BOOKS_COLLECTION), payload)
  return ref.id
}

export async function updateBook(
  id: string,
  patch: Partial<BookInput>
): Promise<void> {
  const db = requireDb()
  const updates: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  }
  await updateDoc(doc(db, BOOKS_COLLECTION, id), updates)
}

export async function deleteBook(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, BOOKS_COLLECTION, id))
}

export async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const db = requireDb()
  const q = query(
    collection(db, BOOKS_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return false
  return first.id !== excludeId
}

export { Timestamp }
