/**
 * "Jogando agora" — cards grandes da página /agora, com a capa do jogo
 * ao fundo.
 *
 * Coleção própria, separada de `games`: aquela é o catálogo do que já foi
 * jogado (com review, nota, ano); esta responde só "o que está rolando
 * agora", e some quando o jogo termina.
 */

export type PlayingStatus = "jogando" | "platinando" | "rejogando" | "pausado"

export const PLAYING_STATUS: readonly PlayingStatus[] = [
  "jogando",
  "platinando",
  "rejogando",
  "pausado",
] as const

export const PLAYING_STATUS_LABEL: Record<PlayingStatus, string> = {
  jogando: "Jogando",
  platinando: "Platinando",
  rejogando: "Rejogando",
  pausado: "Pausado",
}

export type Playing = {
  id: string
  title: string
  /** Capa usada como fundo do card — Cloudinary. */
  coverImage: string
  synopsis: string
  genres: string[]
  platform: string
  status: PlayingStatus
  /** Ordena os cards; menor aparece primeiro. */
  order: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

export type PlayingInput = Omit<Playing, "id" | "createdAt" | "updatedAt">

export const EMPTY_PLAYING: PlayingInput = {
  title: "",
  coverImage: "",
  synopsis: "",
  genres: [],
  platform: "",
  status: "jogando",
  order: 0,
  visible: true,
}
