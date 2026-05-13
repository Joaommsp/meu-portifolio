import type { MetadataRoute } from "next"

import { getAllPublishedPosts } from "@/lib/data/posts"
import { getAllProjects } from "@/lib/data/projects"
import { getAllPublishedGames } from "@/lib/data/games"

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
  ]

  const [posts, projects, games] = await Promise.all([
    getAllPublishedPosts(),
    getAllProjects(),
    getAllPublishedGames(),
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

  return [...staticEntries, ...postEntries, ...projectEntries, ...gameEntries]
}
