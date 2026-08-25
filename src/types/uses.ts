/**
 * Página /uses — o que João usa pra trabalhar.
 *
 * Uma categoria por documento, com os itens dentro. Os itens não viram
 * coleção própria porque só existem dentro de uma categoria e são poucos:
 * separar exigiria uma segunda consulta e um join à mão pra nada.
 */

export type UsesItem = {
  name: string
  description: string
  /** Link do produto. Vazio quando não faz sentido linkar. */
  url: string
  /** Favorito da categoria — ganha selo. */
  starred: boolean
}

export type UsesCategory = {
  id: string
  title: string
  description: string
  items: UsesItem[]
  /** Ordena as categorias na página; menor aparece primeiro. */
  order: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

export type UsesCategoryInput = Omit<
  UsesCategory,
  "id" | "createdAt" | "updatedAt"
>

export const EMPTY_USES_ITEM: UsesItem = {
  name: "",
  description: "",
  url: "",
  starred: false,
}

export const EMPTY_USES_CATEGORY: UsesCategoryInput = {
  title: "",
  description: "",
  items: [],
  order: 0,
  visible: true,
}

/**
 * Saneia o que vem do banco: documento antigo ou meio preenchido não pode
 * derrubar a página.
 */
export function normalizarItens(bruto: unknown): UsesItem[] {
  if (!Array.isArray(bruto)) return []
  return bruto
    .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
    .map((i) => ({
      name: typeof i.name === "string" ? i.name : "",
      description: typeof i.description === "string" ? i.description : "",
      url: typeof i.url === "string" ? i.url : "",
      starred: Boolean(i.starred),
    }))
    .filter((i) => i.name.trim() !== "")
}
