import {
  restListGames,
  restGetGameBySlug,
  firestoreRestAvailable,
} from "@/lib/firebase/rest"
import { sampleGames } from "@/lib/mocks/sample-data"
import type { Game } from "@/types/game"

/**
 * Camada de dados unificada (read-only) — espelha lib/data/posts.
 * Cai pros mocks quando Firebase não configurado OU coleção vazia.
 */

/**
 * `estrito`: pra página que mostra a lista e precisa separar "não há nada"
 * de "a consulta falhou". Lança `ErroConsultaFirestore`. Quem monta página no
 * SSR fica no tolerante: vazio, com o erro no console.
 */
export async function getAllPublishedGames({
  estrito = false,
}: { estrito?: boolean } = {}): Promise<Game[]> {
  if (!firestoreRestAvailable) return sampleGames
  const real = await restListGames({ publishedOnly: true, estrito })
  return real.length > 0 ? real : sampleGames
}

export async function getFeaturedGames(): Promise<Game[]> {
  if (!firestoreRestAvailable) return sampleGames.filter((g) => g.featured)
  const real = await restListGames({ publishedOnly: true, featuredOnly: true })
  return real.length > 0 ? real : sampleGames.filter((g) => g.featured)
}

export async function findGameBySlug(slug: string): Promise<Game | null> {
  if (firestoreRestAvailable) {
    const real = await restGetGameBySlug(slug)
    if (real) return real
  }
  return sampleGames.find((g) => g.slug === slug) ?? null
}

export async function getAllGameSlugs(): Promise<string[]> {
  const slugs = new Set<string>(sampleGames.map((g) => g.slug))
  if (firestoreRestAvailable) {
    const real = await restListGames({ publishedOnly: true })
    for (const g of real) slugs.add(g.slug)
  }
  return Array.from(slugs)
}
