import {
  restListProjects,
  restGetProjectBySlug,
  firestoreRestAvailable,
} from "@/lib/firebase/rest"
import { sampleProjects } from "@/lib/mocks/sample-data"
import type { Project } from "@/types/project"

export async function getAllProjects(): Promise<Project[]> {
  if (!firestoreRestAvailable) return sampleProjects
  const real = await restListProjects()
  return real.length > 0 ? real : sampleProjects
}

export async function findProjectBySlug(
  slug: string
): Promise<Project | null> {
  if (firestoreRestAvailable) {
    const real = await restGetProjectBySlug(slug)
    if (real) return real
  }
  return sampleProjects.find((p) => p.slug === slug) ?? null
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const slugs = new Set<string>(sampleProjects.map((p) => p.slug))
  if (firestoreRestAvailable) {
    const real = await restListProjects()
    for (const p of real) slugs.add(p.slug)
  }
  return Array.from(slugs)
}
