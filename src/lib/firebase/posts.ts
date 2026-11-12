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
import { posts } from "@/lib/conteudo/posts"
import { AGORA, type CamposDerivados } from "@/lib/conteudo/tipos"

const POSTS_COLLECTION = posts.colecao

/**
 * Troca a marca `AGORA` dos campos derivados pelo carimbo do servidor.
 * A regra (readingTime, publishedAt, views) mora em `lib/conteudo/posts`.
 */
function comCarimbo(campos: CamposDerivados): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(campos).map(([k, v]) => [
      k,
      v === AGORA ? serverTimestamp() : v,
    ])
  )
}

/** Converte PostDoc (Firestore) → Post (UI). Normaliza arrays ausentes. */
function toPost(id: string, data: Omit<PostDoc, "id">): Post {
  return {
    ...data,
    id,
    tags: Array.isArray(data.tags) ? data.tags : [],
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
    ...comCarimbo(posts.derivados!(input, null)),
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, POSTS_COLLECTION), payload)
  return ref.id
}

export async function updatePost(
  id: string,
  patch: Partial<PostInput>
): Promise<void> {
  const db = requireDb()
  // Só a primeira publicação precisa ler o documento atual (publishedAt);
  // nas demais basta dizer que não é criação.
  const atual = patch.published === true ? ((await getPost(id)) ?? {}) : {}
  const updates: Record<string, unknown> = {
    ...patch,
    ...comCarimbo(posts.derivados!(patch, atual)),
    updatedAt: serverTimestamp(),
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
