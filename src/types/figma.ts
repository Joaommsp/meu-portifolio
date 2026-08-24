/**
 * Arquivos publicados no perfil da Figma Community.
 *
 * Por que é cadastro manual e não integração: `figma.com/@usuario` responde
 * 403 pra requisição de servidor, e a REST API do Figma cobre arquivos e
 * times — não existe endpoint de perfil da Community. Sem fonte automática,
 * a fonte é o admin. Mesma escolha do "jogando agora".
 */

export type FigmaFile = {
  id: string
  title: string
  /** Capa do arquivo — Cloudinary. */
  coverImage: string
  /** Link para o arquivo na Community. */
  url: string
  /** Curtidas mostradas na Community. */
  likes: number
  /** Quantas pessoas usaram/duplicaram o arquivo. */
  users: number
  /** Ordena os cards; menor aparece primeiro. */
  order: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

export type FigmaFileInput = Omit<FigmaFile, "id" | "createdAt" | "updatedAt">

export const EMPTY_FIGMA_FILE: FigmaFileInput = {
  title: "",
  coverImage: "",
  url: "",
  likes: 0,
  users: 0,
  order: 0,
  visible: true,
}

export const FIGMA_PROFILE_URL = "https://www.figma.com/@joaomarcos19"
export const FIGMA_HANDLE = "@joaomarcos19"
/** Ano em que João entrou na Community — aparece no cabeçalho da página. */
export const FIGMA_MEMBER_SINCE = 2021
