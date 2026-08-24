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

export async function fetchGithubRepos(
  limit = 6,
  ordenarPor: "recentes" | "estrelas" = "recentes"
): Promise<GithubRepo[]> {
  try {
    // per_page=100 (o teto da API) pra ordenação por estrelas enxergar todos
    // os repositórios, não só a primeira página dos mais recentes.
    const res = await fetch(
      `${API}/users/${USERNAME}/repos?sort=updated&per_page=100`,
      FETCH_OPTS
    )
    if (!res.ok) return []
    const repos = (await res.json()) as GithubRepo[]
    // Filtra forks/arquivados, próprio repo de perfil, e descrições vazias
    const proprios = repos.filter(
      (r) => !r.fork && !r.archived && r.name !== USERNAME
    )
    if (ordenarPor === "estrelas") {
      proprios.sort((a, b) => b.stargazers_count - a.stargazers_count)
    }
    return proprios.slice(0, limit)
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

/* ─────────────────────────────────────────────────────────── */
/* README do perfil                                            */
/* ─────────────────────────────────────────────────────────── */

/** Repositório especial cujo README aparece no perfil do GitHub. */
const PERFIL_REPO = USERNAME
const RAW = `https://raw.githubusercontent.com/${USERNAME}/${PERFIL_REPO}`

/**
 * O README do perfil é HTML puro (`<h2 align>`, `<img align>`, `<div align>`),
 * não markdown, e as imagens usam caminho relativo — que só resolve dentro do
 * GitHub. Aqui elas viram URL absoluta e os `align` legados caem fora, senão
 * brigam com o layout do site.
 */
function prepararReadme(bruto: string): string {
  return (
    bruto
      // ./arquivo.gif e arquivo.gif → raw.githubusercontent
      .replace(
        /(<img[^>]*\ssrc=")(?!https?:|data:)\.?\/?([^"]+)(")/gi,
        (_m, antes, caminho, depois) => `${antes}${RAW}/main/${caminho}${depois}`
      )
      // align="left|right|center" é do HTML4 e desalinha tudo aqui
      .replace(/\salign="[^"]*"/gi, "")
      // <img width="12" /> sem src é espaçador do GitHub: fora de lá não
      // espaça nada e ainda rende ícone de imagem quebrada.
      .replace(/<img(?![^>]*\ssrc=)[^>]*>/gi, "")
  )
}

/**
 * Busca o README do perfil já pronto pra renderizar.
 * `null` quando o repositório ou o arquivo não existir — a página some a seção
 * em vez de mostrar bloco vazio.
 */
export async function fetchGithubReadme(): Promise<string | null> {
  for (const branch of ["main", "master"]) {
    try {
      const res = await fetch(`${RAW}/${branch}/README.md`, {
        next: { revalidate: REVALIDATE_SECONDS },
      })
      if (!res.ok) continue
      const texto = await res.text()
      if (!texto.trim()) continue
      return prepararReadme(texto)
    } catch {
      // tenta a próxima branch
    }
  }
  return null
}

/** Soma das estrelas dos repositórios próprios — o perfil não expõe isso. */
export function contarEstrelas(repos: readonly GithubRepo[]): number {
  return repos.reduce((total, r) => total + r.stargazers_count, 0)
}
