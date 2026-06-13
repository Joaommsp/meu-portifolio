import { z } from "zod"

import { POST_CATEGORIES } from "@/types/post"
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
} from "@/types/project"
import { GAME_STATUSES } from "@/types/game"
import { BOOK_STATUSES } from "@/types/book"

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

/**
 * URL opcional: aceita string vazia (no form) e converte para null.
 * Caso contrário, valida formato HTTP/HTTPS.
 */
const optionalUrlSchema = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(
    z.union([
      z
        .string()
        .url("URL inválida — deve começar com http:// ou https://"),
      z.null(),
    ])
  )

const requiredUrlSchema = z
  .string()
  .trim()
  .url("URL inválida — deve começar com http:// ou https://")

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
    liveUrl: z
      .string()
      .refine(
        (v) => v === "" || /^https?:\/\/.+/i.test(v),
        "URL inválida — deve começar com http:// ou https://"
      ),
    githubUrl: z
      .string()
      .refine(
        (v) => v === "" || /^https?:\/\/.+/i.test(v),
        "URL inválida — deve começar com http:// ou https://"
      ),
    featured: z.boolean(),
    status: z.enum(PROJECT_STATUSES, { message: "Status inválido" }),
    startDate: z.string().min(1, "Data de início obrigatória"),
    endDate: z.string(),
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
