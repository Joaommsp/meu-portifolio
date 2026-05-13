import { createPost } from "@/lib/firebase/posts"
import { createProject } from "@/lib/firebase/projects"
import { samplePosts, sampleProjects } from "@/lib/mocks/sample-data"
import type { PostInput } from "@/types/post"
import type { ProjectInput } from "@/types/project"

/**
 * Popular Firestore com dados de exemplo.
 * Chamado a partir do admin dashboard quando ambas as coleções estão vazias.
 *
 * Requer estar logado como admin (writes bloqueados pelas Security Rules
 * de qualquer outro usuário).
 */
export async function seedSampleData(): Promise<{
  posts: number
  projects: number
}> {
  let postsCount = 0
  let projectsCount = 0

  for (const post of samplePosts) {
    const input: PostInput = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category,
      tags: [...post.tags],
      published: post.published,
      featured: post.featured,
    }
    await createPost(input)
    postsCount++
  }

  for (const project of sampleProjects) {
    const input: ProjectInput = {
      slug: project.slug,
      title: project.title,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription,
      coverImage: project.coverImage,
      gallery: [...project.gallery],
      technologies: [...project.technologies],
      category: project.category,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
    }
    await createProject(input)
    projectsCount++
  }

  return { posts: postsCount, projects: projectsCount }
}
