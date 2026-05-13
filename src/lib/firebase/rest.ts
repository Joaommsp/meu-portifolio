/**
 * Firestore REST API helpers — leitura pública, server-side.
 *
 * Por que existe: o Firebase JS SDK trava em "offline mode" quando rodando
 * em Node.js (server components do Next 16 + Turbopack), porque tenta GRPC
 * via Cloud Listen que falha. REST API via fetch funciona perfeitamente.
 *
 * Usado pela camada `lib/data/*` em SSR/SSG. Operações de escrita (admin)
 * continuam via JS SDK no browser onde funciona.
 */

import type { Post, PostCategory } from "@/types/post"
import type {
  Project,
  ProjectCategory,
  ProjectStatus,
} from "@/types/project"
import type { Game, GameStatus } from "@/types/game"

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ""
const BASE = PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  : ""

export const firestoreRestAvailable = Boolean(PROJECT_ID)

/* ─────────────────────────────────────────────────────────── */
/* Tipos REST → JS                                             */
/* ─────────────────────────────────────────────────────────── */

type RestValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: RestValue[] } }
  | { mapValue: { fields?: Record<string, RestValue> } }

type RestDocument = {
  name: string
  fields?: Record<string, RestValue>
  createTime?: string
  updateTime?: string
}

type QueryResponse = Array<{ document?: RestDocument }>

/** Converte `RestValue` em valor JS comum. */
function unwrap(v: RestValue): unknown {
  if ("stringValue" in v) return v.stringValue
  if ("booleanValue" in v) return v.booleanValue
  if ("integerValue" in v) return Number(v.integerValue)
  if ("doubleValue" in v) return v.doubleValue
  if ("timestampValue" in v) return new Date(v.timestampValue)
  if ("nullValue" in v) return null
  if ("arrayValue" in v) {
    return (v.arrayValue.values ?? []).map(unwrap)
  }
  if ("mapValue" in v) {
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v.mapValue.fields ?? {})) {
      out[k] = unwrap(val)
    }
    return out
  }
  return null
}

function unwrapDoc<T extends Record<string, unknown>>(
  doc: RestDocument
): T & { id: string } {
  const id = doc.name.split("/").pop() ?? ""
  const result: Record<string, unknown> = { id }
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    result[k] = unwrap(v)
  }
  return result as T & { id: string }
}

/* ─────────────────────────────────────────────────────────── */
/* Query builders                                              */
/* ─────────────────────────────────────────────────────────── */

type StructuredQuery = {
  from: { collectionId: string }[]
  where?: object
  orderBy?: { field: { fieldPath: string }; direction: string }[]
  limit?: number
}

async function runQuery(
  query: StructuredQuery
): Promise<RestDocument[]> {
  if (!firestoreRestAvailable) return []
  try {
    const res = await fetch(`${BASE}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: query }),
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = (await res.json()) as QueryResponse
    return data
      .map((entry) => entry.document)
      .filter((d): d is RestDocument => Boolean(d))
  } catch {
    return []
  }
}

/* ─────────────────────────────────────────────────────────── */
/* Posts                                                       */
/* ─────────────────────────────────────────────────────────── */

type PostRest = {
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
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

function toPost(doc: RestDocument): Post {
  const u = unwrapDoc<PostRest>(doc)
  return {
    id: u.id,
    slug: u.slug ?? "",
    title: u.title ?? "",
    excerpt: u.excerpt ?? "",
    content: u.content ?? "",
    coverImage: u.coverImage ?? "",
    category: (u.category as PostCategory) ?? "outro",
    tags: Array.isArray(u.tags) ? u.tags : [],
    published: Boolean(u.published),
    featured: Boolean(u.featured),
    readingTime: typeof u.readingTime === "number" ? u.readingTime : 1,
    views: typeof u.views === "number" ? u.views : 0,
    createdAt: u.createdAt ?? new Date(),
    updatedAt: u.updatedAt ?? new Date(),
    publishedAt: u.publishedAt ?? null,
  }
}

export async function restListPosts(
  options: { publishedOnly?: boolean } = {}
): Promise<Post[]> {
  const where = options.publishedOnly
    ? {
        fieldFilter: {
          field: { fieldPath: "published" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      }
    : undefined

  const docs = await runQuery({
    from: [{ collectionId: "posts" }],
    where,
    orderBy: [
      {
        field: {
          fieldPath: options.publishedOnly ? "publishedAt" : "createdAt",
        },
        direction: "DESCENDING",
      },
    ],
    limit: 100,
  })
  return docs.map(toPost)
}

export async function restGetPostBySlug(slug: string): Promise<Post | null> {
  const docs = await runQuery({
    from: [{ collectionId: "posts" }],
    where: {
      compositeFilter: {
        op: "AND",
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: "published" },
              op: "EQUAL",
              value: { booleanValue: true },
            },
          },
        ],
      },
    },
    limit: 1,
  })
  return docs[0] ? toPost(docs[0]) : null
}

/* ─────────────────────────────────────────────────────────── */
/* Projects                                                    */
/* ─────────────────────────────────────────────────────────── */

type ProjectRest = {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  coverImage: string
  gallery: string[]
  technologies: string[]
  category: ProjectCategory
  liveUrl: string | null
  githubUrl: string | null
  featured: boolean
  status: ProjectStatus
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

function toProject(doc: RestDocument): Project {
  const u = unwrapDoc<ProjectRest>(doc)
  return {
    id: u.id,
    slug: u.slug ?? "",
    title: u.title ?? "",
    shortDescription: u.shortDescription ?? "",
    fullDescription: u.fullDescription ?? "",
    coverImage: u.coverImage ?? "",
    gallery: Array.isArray(u.gallery) ? u.gallery : [],
    technologies: Array.isArray(u.technologies) ? u.technologies : [],
    category: (u.category as ProjectCategory) ?? "outro",
    liveUrl: typeof u.liveUrl === "string" ? u.liveUrl : null,
    githubUrl: typeof u.githubUrl === "string" ? u.githubUrl : null,
    featured: Boolean(u.featured),
    status: (u.status as ProjectStatus) ?? "em-desenvolvimento",
    startDate: u.startDate ?? new Date(),
    endDate: u.endDate ?? null,
    createdAt: u.createdAt ?? new Date(),
    updatedAt: u.updatedAt ?? new Date(),
  }
}

export async function restListProjects(
  options: { featuredOnly?: boolean } = {}
): Promise<Project[]> {
  const where = options.featuredOnly
    ? {
        fieldFilter: {
          field: { fieldPath: "featured" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      }
    : undefined

  const docs = await runQuery({
    from: [{ collectionId: "projects" }],
    where,
    orderBy: [
      {
        field: { fieldPath: "startDate" },
        direction: "DESCENDING",
      },
    ],
    limit: 100,
  })
  return docs.map(toProject)
}

export async function restGetProjectBySlug(
  slug: string
): Promise<Project | null> {
  const docs = await runQuery({
    from: [{ collectionId: "projects" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "slug" },
        op: "EQUAL",
        value: { stringValue: slug },
      },
    },
    limit: 1,
  })
  return docs[0] ? toProject(docs[0]) : null
}

/* ─────────────────────────────────────────────────────────── */
/* Games                                                       */
/* ─────────────────────────────────────────────────────────── */

type GameRest = {
  id: string
  slug: string
  title: string
  shortDescription: string
  history: string
  whyILikeIt: string
  coverImage: string
  gallery: string[]
  platforms: string[]
  genres: string[]
  status: GameStatus
  yearPlayed: number
  hoursPlayed: number | null
  rating: number | null
  featured: boolean
  published: boolean
  createdAt: Date
  updatedAt: Date
}

function toGame(doc: RestDocument): Game {
  const u = unwrapDoc<GameRest>(doc)
  return {
    id: u.id,
    slug: u.slug ?? "",
    title: u.title ?? "",
    shortDescription: u.shortDescription ?? "",
    history: u.history ?? "",
    whyILikeIt: u.whyILikeIt ?? "",
    coverImage: u.coverImage ?? "",
    gallery: Array.isArray(u.gallery) ? u.gallery : [],
    platforms: Array.isArray(u.platforms) ? u.platforms : [],
    genres: Array.isArray(u.genres) ? u.genres : [],
    status: (u.status as GameStatus) ?? "concluido",
    yearPlayed:
      typeof u.yearPlayed === "number"
        ? u.yearPlayed
        : new Date().getFullYear(),
    hoursPlayed: typeof u.hoursPlayed === "number" ? u.hoursPlayed : null,
    rating: typeof u.rating === "number" ? u.rating : null,
    featured: Boolean(u.featured),
    published: Boolean(u.published),
    createdAt: u.createdAt ?? new Date(),
    updatedAt: u.updatedAt ?? new Date(),
  }
}

export async function restListGames(
  options: { publishedOnly?: boolean; featuredOnly?: boolean } = {}
): Promise<Game[]> {
  const filters = []
  if (options.publishedOnly) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "published" },
        op: "EQUAL",
        value: { booleanValue: true },
      },
    })
  }
  if (options.featuredOnly) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "featured" },
        op: "EQUAL",
        value: { booleanValue: true },
      },
    })
  }

  const where =
    filters.length === 0
      ? undefined
      : filters.length === 1
      ? filters[0]
      : { compositeFilter: { op: "AND", filters } }

  // Sem orderBy aqui — evita exigir índice composto no Firestore.
  // Sort em memória abaixo (limite de 100 docs).
  const docs = await runQuery({
    from: [{ collectionId: "games" }],
    where,
    limit: 100,
  })
  const games = docs.map(toGame)
  games.sort((a, b) => b.yearPlayed - a.yearPlayed)
  return games
}

export async function restGetGameBySlug(slug: string): Promise<Game | null> {
  const docs = await runQuery({
    from: [{ collectionId: "games" }],
    where: {
      compositeFilter: {
        op: "AND",
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: "published" },
              op: "EQUAL",
              value: { booleanValue: true },
            },
          },
        ],
      },
    },
    limit: 1,
  })
  return docs[0] ? toGame(docs[0]) : null
}
