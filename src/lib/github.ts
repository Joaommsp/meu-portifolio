/**
 * Fetchers da API REST do GitHub (sem auth — limite 60 req/hora).
 * Usado em Server Components com revalidação horária.
 */

const USERNAME = "Joaommsp"
const API = "https://api.github.com"
const REVALIDATE_SECONDS = 3600 // 1 hora — fresca o suficiente sem bater o limit

export type GithubProfile = {
  login: string
  name: string | null
  bio: string | null
  location: string | null
  company: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  html_url: string
}

export type GithubRepo = {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
}

const FETCH_OPTS: RequestInit = {
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
  next: { revalidate: REVALIDATE_SECONDS },
}

export async function fetchGithubProfile(): Promise<GithubProfile | null> {
  try {
    const res = await fetch(`${API}/users/${USERNAME}`, FETCH_OPTS)
    if (!res.ok) return null
    return (await res.json()) as GithubProfile
  } catch {
    return null
  }
}

export async function fetchGithubRepos(limit = 6): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `${API}/users/${USERNAME}/repos?sort=updated&per_page=30`,
      FETCH_OPTS
    )
    if (!res.ok) return []
    const repos = (await res.json()) as GithubRepo[]
    // Filtra forks/arquivados, próprio repo de perfil, e descrições vazias
    return repos
      .filter((r) => !r.fork && !r.archived && r.name !== USERNAME)
      .slice(0, limit)
  } catch {
    return []
  }
}

/**
 * Cores oficiais por linguagem (subset das que João usa).
 * Padrão GitHub: github.com/ozh/github-colors
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Java: "#B07219",
  HTML: "#E34F26",
  CSS: "#663399",
  SCSS: "#C6538C",
  Vue: "#41B883",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Shell: "#89E051",
  Dockerfile: "#384D54",
  Markdown: "#083FA1",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
}

export function getLanguageColor(lang: string | null): string {
  if (!lang) return "var(--muted-foreground)"
  return LANGUAGE_COLORS[lang] ?? "var(--muted-foreground)"
}
