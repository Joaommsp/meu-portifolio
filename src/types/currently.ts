/**
 * "O que tá rolando" — os três cards da página /sobre.
 *
 * As categorias são fixas (Lendo · Ouvindo · Estudando) e cada uma tem ícone
 * próprio na interface. O admin edita só o conteúdo de cada uma, então isto
 * vive num documento único no Firestore, não numa coleção.
 */

export type CurrentlySlot = "lendo" | "ouvindo" | "estudando"

export const CURRENTLY_SLOTS: readonly CurrentlySlot[] = [
  "lendo",
  "ouvindo",
  "estudando",
] as const

export const CURRENTLY_LABELS: Record<CurrentlySlot, string> = {
  lendo: "Lendo",
  ouvindo: "Ouvindo",
  estudando: "Estudando",
}

export type CurrentlyItem = {
  title: string
  subtitle: string
  /** Opcional: quando existe, o card vira link. */
  link: string
  /** Desligado, o card não aparece na página. */
  visible: boolean
}

export type Currently = Record<CurrentlySlot, CurrentlyItem> & {
  updatedAt: Date | null
  /**
   * `false` quando o documento ainda não existe no Firestore (ou a leitura
   * falhou). Serve para separar "nunca foi preenchido" — onde vale mostrar o
   * padrão — de "foi preenchido e desligado", que é uma escolha a respeitar.
   */
  exists: boolean
}

/** Estado inicial do formulário do admin. */
export const EMPTY_CURRENTLY: Currently = {
  lendo: { title: "", subtitle: "", link: "", visible: false },
  ouvindo: { title: "", subtitle: "", link: "", visible: false },
  estudando: { title: "", subtitle: "", link: "", visible: false },
  updatedAt: null,
  exists: false,
}

/**
 * Texto do card quando não há nada preenchido para a categoria.
 * Melhor declarar o vazio do que exibir informação desatualizada como se
 * fosse atual — este é um portfólio, e o visitante lê tudo como verdade.
 */
export const CURRENTLY_EMPTY_TEXT = "Nada no momento"
