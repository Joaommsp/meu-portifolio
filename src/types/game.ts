import type { Timestamp } from "firebase/firestore"

export const GAME_STATUSES = [
  "jogando",
  "concluido",
  "rejogando",
  "wishlist",
  "abandonado",
] as const
export type GameStatus = (typeof GAME_STATUSES)[number]

/**
 * Plataformas comuns. É array de strings livres na verdade
 * (pra suportar "PS5", "PC", "Switch", etc.), mas estes são
 * os valores sugeridos no admin.
 */
export const GAME_PLATFORM_SUGGESTIONS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Steam Deck",
  "Mobile",
  "VR",
] as const

/**
 * Documento de jogo no Firestore (collection `games`).
 * Os Timestamps são serializados como Date no client após fetch.
 */
export type GameDoc = {
  id: string
  slug: string
  title: string
  /** One-liner que aparece no card. */
  shortDescription: string
  /** Resumo da história/lore do jogo (markdown). */
  history: string
  /** Por que eu gosto deste jogo (markdown). */
  whyILikeIt: string
  coverImage: string
  gallery: string[]
  platforms: string[]
  genres: string[]
  status: GameStatus
  /** Ano em que jogou pela primeira vez. */
  yearPlayed: number
  /** Horas jogadas (opcional, em horas inteiras). */
  hoursPlayed: number | null
  /** Nota pessoal 0-10 (opcional). */
  rating: number | null
  featured: boolean
  published: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** Versão deserializada (Date em vez de Timestamp). */
export type Game = Omit<GameDoc, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
}

/** Payload pra criar/editar um jogo via admin. */
export type GameInput = {
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
}
