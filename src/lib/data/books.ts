import {
  restListBooks,
  restGetBookBySlug,
  firestoreRestAvailable,
} from "@/lib/firebase/rest"
import { sampleBooks } from "@/lib/mocks/sample-data"
import type { Book } from "@/types/book"

export async function getAllPublishedBooks(): Promise<Book[]> {
  if (!firestoreRestAvailable) return sampleBooks
  const real = await restListBooks({ publishedOnly: true })
  return real.length > 0 ? real : sampleBooks
}

export async function getFeaturedBooks(): Promise<Book[]> {
  if (!firestoreRestAvailable) return sampleBooks.filter((b) => b.featured)
  const real = await restListBooks({ publishedOnly: true, featuredOnly: true })
  return real.length > 0 ? real : sampleBooks.filter((b) => b.featured)
}

export async function findBookBySlug(slug: string): Promise<Book | null> {
  if (firestoreRestAvailable) {
    const real = await restGetBookBySlug(slug)
    if (real) return real
  }
  return sampleBooks.find((b) => b.slug === slug) ?? null
}

export async function getAllBookSlugs(): Promise<string[]> {
  const slugs = new Set<string>(sampleBooks.map((b) => b.slug))
  if (firestoreRestAvailable) {
    const real = await restListBooks({ publishedOnly: true })
    for (const b of real) slugs.add(b.slug)
  }
  return Array.from(slugs)
}
