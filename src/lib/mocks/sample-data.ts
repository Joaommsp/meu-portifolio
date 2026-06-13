import type { Post } from "@/types/post"
import type { Project } from "@/types/project"
import type { Game } from "@/types/game"
import type { Book } from "@/types/book"

/**
 * Mocks pra Etapa 8 — substituídos por dados reais do Firestore
 * quando .env.local estiver preenchido (e os componentes plugarem
 * `listProjects`/`listPosts` em vez destes).
 */

/** Sem mocks pra projects — usa apenas dados reais do Firestore. */
export const sampleProjects: Project[] = []

/** Sem mocks pra posts — usa apenas dados reais do Firestore. */
export const samplePosts: Post[] = []


/** Sem mocks pra games — usa apenas dados reais do Firestore. */
export const sampleGames: Game[] = []

/** Sem mocks pra books — usa apenas dados reais do Firestore. */
export const sampleBooks: Book[] = []
