import type { Timestamp } from "firebase/firestore"

export const POST_CATEGORIES = [
  "pensamento",
  "tutorial",
  "review",
  "noticia",
  "outro",
] as const
export type PostCategory = (typeof POST_CATEGORIES)[number]

/**
 * Documento de post no Firestore (collection `posts`).
 * Os Timestamps são serializados como Date no client após fetch.
 */
export type PostDoc = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: PostCategory
  tags: string[]
  published: boolean
  featured: boolean
  readingTime: number
  views: number
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null
}

/** Versão "deserializada" pra uso nos componentes — Date em vez de Timestamp. */
export type Post = Omit<PostDoc, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

/** Payload pra criar um novo post (admin form). */
export type PostInput = {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: PostCategory
  tags: string[]
  published: boolean
  featured: boolean
}
