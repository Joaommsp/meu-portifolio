import type { Timestamp } from "firebase/firestore"

export const BOOK_STATUSES = [
  "lendo",
  "lido",
  "relendo",
  "wishlist",
  "pausado",
  "abandonado",
] as const
export type BookStatus = (typeof BOOK_STATUSES)[number]

/**
 * Documento de livro no Firestore (collection `books`).
 * Timestamps serializados como Date no client após fetch.
 */
export type BookDoc = {
  id: string
  slug: string
  title: string
  author: string
  /** One-liner que aparece no card. */
  shortDescription: string
  /** Sinopse/resumo do livro (markdown). */
  synopsis: string
  /** Por que eu gosto deste livro (markdown). */
  whyILikeIt: string
  coverImage: string
  genres: string[]
  status: BookStatus
  /** Ano em que terminei (ou comecei, se ainda lendo). */
  yearRead: number
  /** Quantidade de páginas (opcional). */
  pages: number | null
  /** Nota pessoal 0-10 (opcional). */
  rating: number | null
  featured: boolean
  published: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** Versão deserializada (Date em vez de Timestamp). */
export type Book = Omit<BookDoc, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
}

/** Payload pra criar/editar um livro via admin. */
export type BookInput = {
  slug: string
  title: string
  author: string
  shortDescription: string
  synopsis: string
  whyILikeIt: string
  coverImage: string
  genres: string[]
  status: BookStatus
  yearRead: number
  pages: number | null
  rating: number | null
  featured: boolean
  published: boolean
}
