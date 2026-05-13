"use client"

import * as React from "react"

export const ACCENTS = [
  "green",
  "blue",
  "purple",
  "red",
  "orange",
  "cyan",
  "pink",
  "yellow",
] as const

export type Accent = (typeof ACCENTS)[number]

export const DEFAULT_ACCENT: Accent = "green"
export const ACCENT_STORAGE_KEY = "portfolio:accent"

type ThemeColorContextValue = {
  accent: Accent
  setAccent: (a: Accent) => void
}

const ThemeColorContext = React.createContext<ThemeColorContextValue | null>(
  null
)

function isAccent(value: string | null | undefined): value is Accent {
  return (
    typeof value === "string" &&
    (ACCENTS as readonly string[]).includes(value)
  )
}

export function ThemeColorProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [accent, setAccentState] = React.useState<Accent>(DEFAULT_ACCENT)

  const setAccent = React.useCallback((next: Accent) => {
    setAccentState(next)
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-accent", next)
  }, [])

  // Lê o accent salvo no localStorage no primeiro mount.
  // Aceita um brief flash da cor default → cor salva (1 frame)
  // como trade-off pra não usar inline script (React 19 warn).
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY)
      if (isAccent(saved) && saved !== DEFAULT_ACCENT) {
        setAccentState(saved)
      }
    } catch {
      /* localStorage indisponível */
    }
  }, [])

  // Sincroniza data-attribute sempre que o estado muda
  React.useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent)
  }, [accent])

  // Habilita transição de cor 300ms só APÓS o primeiro paint —
  // evita flash colorido durante a hidratação inicial.
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      document.documentElement.setAttribute("data-loaded", "true")
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  const value = React.useMemo(
    () => ({ accent, setAccent }),
    [accent, setAccent]
  )

  return (
    <ThemeColorContext.Provider value={value}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export function useThemeColor() {
  const ctx = React.useContext(ThemeColorContext)
  if (!ctx) {
    throw new Error("useThemeColor must be used within ThemeColorProvider")
  }
  return ctx
}
