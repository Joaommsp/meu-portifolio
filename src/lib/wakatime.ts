/**
 * Fetcher do Wakatime — API pública (perfil precisa ter
 * "Display code time publicly" ativado).
 *
 * Doc: https://wakatime.com/developers
 */

const USERNAME = "joaozl122"
const API = "https://wakatime.com/api/v1"
const REVALIDATE_SECONDS = 300 // 5min — Wakatime atualiza com lag, mas mantém os dados frescos sem hammerar a API

export type WakatimeRange =
  | "last_7_days"
  | "last_30_days"
  | "last_6_months"
  | "last_year"
  | "all_time"

type RankedItem = {
  name: string
  total_seconds: number
  percent: number
  digital: string // "1:23"
  text: string // "1 hr 23 mins"
  hours: number
  minutes: number
}

export type WakatimeStats = {
  username: string
  total_seconds: number
  daily_average: number
  human_readable_total: string
  human_readable_daily_average: string
  human_readable_range: string
  range: WakatimeRange
  start: string | null
  end: string | null
  languages: RankedItem[]
  editors: RankedItem[]
  operating_systems: RankedItem[]
  categories: RankedItem[]
  is_up_to_date: boolean
  /** True quando o perfil está publicamente visível. */
  is_visible: boolean
}

export type WakatimeToday = {
  total_seconds: number
  human_readable: string // "1 hr 12 mins"
  digital: string // "1:12"
}

/**
 * Tempo de código de HOJE — exige WAKATIME_API_KEY no .env.local.
 * Endpoint privado, então não cacheia agressivo.
 * Retorna null se não houver API key OU se a request falhar.
 */
export async function fetchWakatimeToday(): Promise<WakatimeToday | null> {
  const apiKey = process.env.WAKATIME_API_KEY
  if (!apiKey) return null

  try {
    const basic = Buffer.from(apiKey).toString("base64")
    const res = await fetch(`${API}/users/current/status_bar/today`, {
      headers: { Authorization: `Basic ${basic}` },
      next: { revalidate: 120 }, // 2min — hoje atualiza com frequência
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: {
        grand_total?: {
          total_seconds: number
          text: string
          digital: string
        }
      }
    }
    const gt = json.data?.grand_total
    if (!gt) return null
    return {
      total_seconds: gt.total_seconds,
      human_readable: gt.text,
      digital: gt.digital,
    }
  } catch {
    return null
  }
}

export async function fetchWakatimeStats(
  range: WakatimeRange = "last_7_days"
): Promise<WakatimeStats | null> {
  try {
    const res = await fetch(`${API}/users/${USERNAME}/stats/${range}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: WakatimeStats & {
      is_coding_activity_visible: boolean
      is_language_usage_visible: boolean
      is_editor_usage_visible: boolean
      is_os_usage_visible: boolean
      is_category_usage_visible: boolean
    } }
    const d = json.data
    return {
      username: d.username,
      total_seconds: d.total_seconds,
      daily_average: d.daily_average,
      human_readable_total: d.human_readable_total,
      human_readable_daily_average: d.human_readable_daily_average,
      human_readable_range: d.human_readable_range,
      range: d.range,
      start: d.start ?? null,
      end: d.end ?? null,
      languages: d.languages ?? [],
      editors: d.editors ?? [],
      operating_systems: d.operating_systems ?? [],
      categories: d.categories ?? [],
      is_up_to_date: d.is_up_to_date,
      is_visible: d.is_coding_activity_visible,
    }
  } catch {
    return null
  }
}

/**
 * Cor por linguagem (subset Wakatime usa).
 * Compartilha com github.ts mas com fallback.
 */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Java: "#B07219",
  Kotlin: "#A97BFF",
  HTML: "#E34F26",
  CSS: "#663399",
  SCSS: "#C6538C",
  Vue: "#41B883",
  Go: "#00ADD8",
  Rust: "#DEA584",
  JSON: "#888",
  Markdown: "#083FA1",
  YAML: "#cb171e",
  Shell: "#89E051",
  Bash: "#89E051",
  SQL: "#e38c00",
  TSX: "#3178C6",
  JSX: "#61DAFB",
  Other: "var(--muted-foreground)",
}

export function getLangColor(name: string): string {
  return LANG_COLORS[name] ?? "var(--muted-foreground)"
}
