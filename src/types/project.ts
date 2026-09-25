import type { Timestamp } from "firebase/firestore"

export const PROJECT_CATEGORIES = [
  "web",
  "mobile",
  "api",
  "design",
  "outro",
] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const PROJECT_STATUSES = [
  "em-desenvolvimento",
  "concluido",
  "arquivado",
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Rótulo de cada status (o do selo, o do admin e o da imagem de OG). */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  concluido: "Concluído",
  arquivado: "Arquivado",
}

export type ProjectDoc = {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  coverImage: string
  gallery: string[]
  technologies: string[]
  category: ProjectCategory
  liveUrl: string | null
  githubUrl: string | null
  featured: boolean
  status: ProjectStatus
  startDate: Timestamp
  endDate: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Project = Omit<
  ProjectDoc,
  "startDate" | "endDate" | "createdAt" | "updatedAt"
> & {
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ProjectInput = {
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  coverImage: string
  gallery: string[]
  technologies: string[]
  category: ProjectCategory
  liveUrl: string | null
  githubUrl: string | null
  featured: boolean
  status: ProjectStatus
  startDate: Date
  endDate: Date | null
}
