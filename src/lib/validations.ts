import { z } from "zod"

import { POST_CATEGORIES } from "@/types/post"
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
} from "@/types/project"
import { GAME_STATUSES } from "@/types/game"
import { BOOK_STATUSES } from "@/types/book"
import type { CurrentlySlot } from "@/types/currently"
import { PLAYING_STATUS } from "@/types/playing"

/* ──────────────────────────────────────────────────────────────
   Helpers compartilhados
   ────────────────────────────────────────────────────────────── */

const slugSchema = z
  .string()
  .min(3, "Slug deve ter ao menos 3 caracteres")
  .max(100, "Slug muito longo (máximo 100)")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug deve conter apenas letras minúsculas, números e hífens (ex: meu-post)"
  )

const tagSchema = z
  .string()
  .trim()
  .min(2, "Tag muito curta")
  .max(30, "Tag muito longa")

const tagsSchema = z
  .array(tagSchema)
  .max(10, "Máximo 10 tags")

export const MENSAGEM_URL_HTTP = "URL inválida: deve começar com http:// ou https://"

/**
 * URL opcional: aceita string vazia (no form) e converte para null.
 * Caso contrário, valida formato HTTP/HTTPS.
 */
const optionalUrlSchema = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.union([z.string().url(MENSAGEM_URL_HTTP), z.null()]))

/**
 * Data como o `input type=date` manda. O MCP escreve no mesmo formato, então
 * a regra vale para os dois.
 */
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/
const MENSAGEM_DATA_ISO = "Data inválida (use AAAA-MM-DD)"

const requiredUrlSchema = z.string().trim().url(MENSAGEM_URL_HTTP)

/** Link opcional como o formulário guarda: vazio ou http(s). */
const optionalHttpUrlSchema = z
  .string()
  .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), MENSAGEM_URL_HTTP)

/* ──────────────────────────────────────────────────────────────
   POST FORM
   ────────────────────────────────────────────────────────────── */

export const postFormSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(3, "Título muito curto (mínimo 3)")
    .max(200, "Título muito longo (máximo 200)"),
  excerpt: z
    .string()
    .trim()
    .min(10, "Resumo muito curto (mínimo 10)")
    .max(300, "Resumo muito longo (máximo 300)"),
  content: z
    .string()
    .trim()
    .min(50, "Conteúdo muito curto (mínimo 50 caracteres)"),
  coverImage: requiredUrlSchema,
  category: z.enum(POST_CATEGORIES, { message: "Categoria inválida" }),
  tags: tagsSchema,
  published: z.boolean(),
  featured: z.boolean(),
})

export type PostFormValues = z.infer<typeof postFormSchema>

/* ──────────────────────────────────────────────────────────────
   PROJECT FORM
   ────────────────────────────────────────────────────────────── */

export const projectFormSchema = z
  .object({
    slug: slugSchema,
    title: z
      .string()
      .trim()
      .min(3, "Título muito curto (mínimo 3)")
      .max(150, "Título muito longo (máximo 150)"),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Descrição curta deve ter ao menos 10 caracteres")
      .max(200, "Descrição curta muito longa (máximo 200)"),
    fullDescription: z
      .string()
      .trim()
      .min(30, "Descrição completa muito curta (mínimo 30)"),
    coverImage: requiredUrlSchema,
    gallery: z
      .array(requiredUrlSchema)
      .max(20, "Máximo 20 imagens na galeria"),
    technologies: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Tecnologia não pode ser vazia")
          .max(40, "Nome de tecnologia muito longo")
      )
      .min(1, "Adicione pelo menos uma tecnologia")
      .max(20, "Máximo 20 tecnologias"),
    category: z.enum(PROJECT_CATEGORIES, { message: "Categoria inválida" }),
    liveUrl: optionalHttpUrlSchema,
    githubUrl: optionalHttpUrlSchema,
    featured: z.boolean(),
    status: z.enum(PROJECT_STATUSES, { message: "Status inválido" }),
    startDate: z
      .string()
      .min(1, "Data de início obrigatória")
      .regex(DATA_ISO, MENSAGEM_DATA_ISO),
    endDate: z
      .string()
      .refine((v) => v === "" || DATA_ISO.test(v), MENSAGEM_DATA_ISO),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    {
      message: "Data de término deve ser posterior ao início",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => data.status !== "concluido" || data.endDate !== "",
    {
      message: "Projetos concluídos precisam de data de término",
      path: ["endDate"],
    }
  )

export type ProjectFormValues = z.infer<typeof projectFormSchema>

/* ──────────────────────────────────────────────────────────────
   GAME FORM
   ────────────────────────────────────────────────────────────── */

export const gameFormSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(1, "Título obrigatório")
    .max(150, "Título muito longo"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Descrição curta deve ter ao menos 10 caracteres")
    .max(200, "Descrição curta muito longa"),
  history: z
    .string()
    .trim()
    .min(20, "História muito curta (mínimo 20 caracteres)"),
  whyILikeIt: z
    .string()
    .trim()
    .min(20, "Diga ao menos um pouco do porquê (mínimo 20 caracteres)"),
  coverImage: requiredUrlSchema,
  gallery: z.array(requiredUrlSchema).max(15, "Máximo 15 imagens"),
  platforms: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Adicione pelo menos uma plataforma")
    .max(10, "Máximo 10 plataformas"),
  genres: z
    .array(z.string().trim().min(1).max(40))
    .max(10, "Máximo 10 gêneros"),
  status: z.enum(GAME_STATUSES, { message: "Status inválido" }),
  yearPlayed: z
    .number()
    .int()
    .min(1970, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano no futuro?"),
  hoursPlayed: z
    .number()
    .int()
    .min(0)
    .max(99999)
    .nullable(),
  rating: z.number().min(0).max(10).nullable(),
  featured: z.boolean(),
  published: z.boolean(),
})

export type GameFormValues = z.infer<typeof gameFormSchema>

/* ──────────────────────────────────────────────────────────────
   BOOK FORM
   ────────────────────────────────────────────────────────────── */

export const bookFormSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(1, "Título obrigatório")
    .max(200, "Título muito longo"),
  author: z
    .string()
    .trim()
    .min(1, "Autor(a) obrigatório")
    .max(150, "Autor muito longo"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Descrição curta deve ter ao menos 10 caracteres")
    .max(200, "Descrição curta muito longa"),
  synopsis: z
    .string()
    .trim()
    .min(20, "Sinopse muito curta (mínimo 20 caracteres)"),
  whyILikeIt: z
    .string()
    .trim()
    .min(20, "Diga ao menos um pouco do porquê (mínimo 20 caracteres)"),
  coverImage: requiredUrlSchema,
  genres: z
    .array(z.string().trim().min(1).max(40))
    .max(10, "Máximo 10 gêneros"),
  status: z.enum(BOOK_STATUSES, { message: "Status inválido" }),
  yearRead: z
    .number()
    .int()
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano no futuro?"),
  pages: z.number().int().min(0).max(99999).nullable(),
  rating: z.number().min(0).max(10).nullable(),
  featured: z.boolean(),
  published: z.boolean(),
})

export type BookFormValues = z.infer<typeof bookFormSchema>

/* ──────────────────────────────────────────────────────────────
   FIGMA (cards da /figma, editados em /admin/figma)
   Limites folgados: o admin validava só o título, e o que já está no
   banco precisa continuar passando.
   ────────────────────────────────────────────────────────────── */

const contagemSchema = z
  .number()
  .int("Use um número inteiro")
  .min(0, "Não pode ser negativo")

/** Limites de texto do figma; a página do admin usa os mesmos no contador. */
export const LIMITES_FIGMA = { titulo: 200 } as const

export const figmaFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Falta o título")
    .max(LIMITES_FIGMA.titulo, `Título muito longo (máximo ${LIMITES_FIGMA.titulo})`),
  coverImage: optionalHttpUrlSchema,
  url: optionalHttpUrlSchema,
  likes: contagemSchema,
  users: contagemSchema,
  order: contagemSchema,
  visible: z.boolean(),
})

export type FigmaFormValues = z.infer<typeof figmaFormSchema>

/* ──────────────────────────────────────────────────────────────
   USES (categorias da /uses, editadas em /admin/uses)
   ────────────────────────────────────────────────────────────── */

export const LIMITES_USES = {
  nomeDoItem: 100,
  descricaoDoItem: 500,
  titulo: 100,
  descricao: 300,
  itens: 50,
} as const

export const usesItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Item sem nome")
    .max(
      LIMITES_USES.nomeDoItem,
      `Nome do item muito longo (máximo ${LIMITES_USES.nomeDoItem})`
    ),
  description: z
    .string()
    .max(
      LIMITES_USES.descricaoDoItem,
      `Descrição do item muito longa (máximo ${LIMITES_USES.descricaoDoItem})`
    ),
  url: optionalHttpUrlSchema,
  starred: z.boolean(),
})

export const usesFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Falta o título")
    .max(LIMITES_USES.titulo, `Título muito longo (máximo ${LIMITES_USES.titulo})`),
  description: z
    .string()
    .max(LIMITES_USES.descricao, `Descrição muito longa (máximo ${LIMITES_USES.descricao})`),
  items: z
    .array(usesItemSchema)
    .max(LIMITES_USES.itens, `Máximo ${LIMITES_USES.itens} itens por categoria`),
  order: contagemSchema,
  visible: z.boolean(),
})

export type UsesFormValues = z.infer<typeof usesFormSchema>

/* ──────────────────────────────────────────────────────────────
   ATUALMENTE ("O que tá rolando" da /sobre, documento único)
   Título vazio é permitido: é assim que o card fica sem conteúdo.
   ────────────────────────────────────────────────────────────── */

export const LIMITES_ATUALMENTE = { titulo: 150, subtitulo: 150 } as const

const atualmenteItemSchema = z.object({
  title: z
    .string()
    .max(LIMITES_ATUALMENTE.titulo, `Título muito longo (máximo ${LIMITES_ATUALMENTE.titulo})`),
  subtitle: z
    .string()
    .max(
      LIMITES_ATUALMENTE.subtitulo,
      `Subtítulo muito longo (máximo ${LIMITES_ATUALMENTE.subtitulo})`
    ),
  link: optionalHttpUrlSchema,
  visible: z.boolean(),
})

/** Só os três slots fixos; qualquer outra chave é recusada. */
export const atualmenteFormSchema = z.strictObject({
  lendo: atualmenteItemSchema,
  ouvindo: atualmenteItemSchema,
  estudando: atualmenteItemSchema,
} satisfies Record<CurrentlySlot, typeof atualmenteItemSchema>)

export type AtualmenteFormValues = z.infer<typeof atualmenteFormSchema>

/* ──────────────────────────────────────────────────────────────
   JOGANDO ("Jogando agora", cards da /agora)
   ────────────────────────────────────────────────────────────── */

export const LIMITES_JOGANDO = {
  titulo: 150,
  sinopse: 2000,
  genero: 40,
  generos: 10,
  plataforma: 60,
} as const

export const jogandoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Falta o título")
    .max(LIMITES_JOGANDO.titulo, `Título muito longo (máximo ${LIMITES_JOGANDO.titulo})`),
  coverImage: optionalHttpUrlSchema,
  synopsis: z
    .string()
    .max(LIMITES_JOGANDO.sinopse, `Sinopse muito longa (máximo ${LIMITES_JOGANDO.sinopse})`),
  genres: z
    .array(z.string().trim().min(1).max(LIMITES_JOGANDO.genero))
    .max(LIMITES_JOGANDO.generos, `Máximo ${LIMITES_JOGANDO.generos} gêneros`),
  platform: z
    .string()
    .trim()
    .max(
      LIMITES_JOGANDO.plataforma,
      `Plataforma muito longa (máximo ${LIMITES_JOGANDO.plataforma})`
    ),
  status: z.enum(PLAYING_STATUS, { message: "Status inválido" }),
  order: contagemSchema,
  visible: z.boolean(),
})

export type JogandoFormValues = z.infer<typeof jogandoFormSchema>

/* ──────────────────────────────────────────────────────────────
   CONTACT FORM (público, página /contato)
   ────────────────────────────────────────────────────────────── */

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido"),
  message: z
    .string()
    .trim()
    .min(10, "Mensagem muito curta (mínimo 10 caracteres)")
    .max(2000, "Mensagem muito longa (máximo 2000)"),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

/* ──────────────────────────────────────────────────────────────
   LOGIN FORM (admin)
   ────────────────────────────────────────────────────────────── */

export const loginFormSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha precisa ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
