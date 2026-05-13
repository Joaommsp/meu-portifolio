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
  increment,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore"

import { requireDb } from "./config"
import type { Post, PostDoc, PostInput } from "@/types/post"

const POSTS_COLLECTION = "posts"

/**
 * Estima tempo de leitura: ~200 palavras/min é a média de leitura adulta.
 * Conta palavras no markdown depois de stripear código/links.
 */
export function estimateReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → texto
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // imagens
  const words = stripped.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

/** Converte PostDoc (Firestore) → Post (UI). */
function toPost(id: string, data: Omit<PostDoc, "id">): Post {
  return {
    ...data,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

type ListPostsOptions = {
  publishedOnly?: boolean
  featuredOnly?: boolean
  category?: string
  tag?: string
  limit?: number
}

export async function listPosts(
  options: ListPostsOptions = {}
): Promise<Post[]> {
  const db = requireDb()
  const constraints: QueryConstraint[] = []
  if (options.publishedOnly) {
    constraints.push(where("published", "==", true))
  }
  if (options.featuredOnly) {
    constraints.push(where("featured", "==", true))
  }
  if (options.category) {
    constraints.push(where("category", "==", options.category))
  }
  if (options.tag) {
    constraints.push(where("tags", "array-contains", options.tag))
  }
  constraints.push(
    orderBy(options.publishedOnly ? "publishedAt" : "createdAt", "desc")
  )
  if (options.limit) {
    constraints.push(fbLimit(options.limit))
  }

  const q = query(collection(db, POSTS_COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    toPost(d.id, d.data() as Omit<PostDoc, "id">)
  )
}

export async function getPost(id: string): Promise<Post | null> {
  const db = requireDb()
  const ref = doc(db, POSTS_COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toPost(snap.id, snap.data() as Omit<PostDoc, "id">)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = requireDb()
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return null
  return toPost(first.id, first.data() as Omit<PostDoc, "id">)
}

export async function createPost(input: PostInput): Promise<string> {
  const db = requireDb()
  const now = serverTimestamp()
  const payload = {
    ...input,
    readingTime: estimateReadingTime(input.content),
    views: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.published ? now : null,
  }
  const ref = await addDoc(collection(db, POSTS_COLLECTION), payload)
  return ref.id
}

export async function updatePost(
  id: string,
  patch: Partial<PostInput>
): Promise<void> {
  const db = requireDb()
  const updates: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  }
  if (patch.content !== undefined) {
    updates.readingTime = estimateReadingTime(patch.content)
  }
  // Define publishedAt na primeira publicação
  if (patch.published === true) {
    const current = await getPost(id)
    if (current && !current.publishedAt) {
      updates.publishedAt = serverTimestamp()
    }
  } else if (patch.published === false) {
    updates.publishedAt = null
  }
  await updateDoc(doc(db, POSTS_COLLECTION, id), updates)
}

export async function deletePost(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, POSTS_COLLECTION, id))
}

/** Incrementa `views` atomicamente (use em página de detalhe). */
export async function incrementPostViews(id: string): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, POSTS_COLLECTION, id), {
    views: increment(1),
  })
}

export async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const db = requireDb()
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return false
  return first.id !== excludeId
}

/** Re-export Timestamp pra construir mocks/testes facilmente. */
export { Timestamp }
