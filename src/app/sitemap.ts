import type { MetadataRoute } from "next"

import { getAllPublishedPosts } from "@/lib/data/posts"
import { getAllProjects } from "@/lib/data/projects"
import { getAllPublishedGames } from "@/lib/data/games"
import { getAllPublishedBooks } from "@/lib/data/books"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"

/**
 * sitemap.xml dinâmico — Next.js convention.
 * Lê posts/projetos via REST API (server-side) e gera URLs com
 * `lastModified` correto pra search engines reverificarem só quando muda.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/now`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/projetos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/livros`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/uses`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guestbook`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ]

  // Recaps anuais (do ano de início até o atual)
  const currentYear = now.getFullYear()
  const recapEntries: MetadataRoute.Sitemap = []
  for (let y = 2024; y <= currentYear; y++) {
    recapEntries.push({
      url: `${SITE_URL}/recap/${y}`,
      lastModified: now,
      changeFrequency: y === currentYear ? "weekly" : "yearly",
      priority: y === currentYear ? 0.7 : 0.5,
    })
  }
  staticEntries.push(...recapEntries)

  const [posts, projects, games, books] = await Promise.all([
    getAllPublishedPosts(),
    getAllProjects(),
    getAllPublishedGames(),
    getAllPublishedBooks(),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projetos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const gameEntries: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${SITE_URL}/games/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const bookEntries: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${SITE_URL}/livros/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [
    ...staticEntries,
    ...postEntries,
    ...projectEntries,
    ...gameEntries,
    ...bookEntries,
  ]
}
