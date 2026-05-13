import {
  restListPosts,
  restGetPostBySlug,
  firestoreRestAvailable,
} from "@/lib/firebase/rest"
import { samplePosts } from "@/lib/mocks/sample-data"
import type { Post } from "@/types/post"

/**
 * Camada de dados unificada (read-only).
 *
 * Usa Firestore REST API (server + client compatível, evita os bugs do
 * JS SDK em Node.js). Cai pros mocks quando:
 *  - Firebase não configurado (sem env vars)
 *  - Coleção vazia no Firestore (UX melhor em dev)
 *  - Network falha
 */

export async function getAllPublishedPosts(): Promise<Post[]> {
  if (!firestoreRestAvailable) return samplePosts
  const real = await restListPosts({ publishedOnly: true })
  return real.length > 0 ? real : samplePosts
}

export async function findPostBySlug(slug: string): Promise<Post | null> {
  if (firestoreRestAvailable) {
    const real = await restGetPostBySlug(slug)
    if (real) return real
  }
  return samplePosts.find((p) => p.slug === slug) ?? null
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs = new Set<string>(samplePosts.map((p) => p.slug))
  if (firestoreRestAvailable) {
    const real = await restListPosts({ publishedOnly: true })
    for (const p of real) slugs.add(p.slug)
  }
  return Array.from(slugs)
}
