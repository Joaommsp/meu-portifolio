"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostForm } from "@/components/admin/PostForm"
import { getPost } from "@/lib/firebase/posts"
import type { Post, PostInput } from "@/types/post"

export default function EditarPostPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = React.useState<Post | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getPost(params.id)
        if (cancelled) return
        if (!data) {
          toast.error("Post não encontrado")
          router.replace("/admin/posts")
          return
        }
        setPost(data)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando…
      </div>
    )
  }

  const initialValues: PostInput = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    category: post.category,
    tags: post.tags,
    published: post.published,
    featured: post.featured,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/posts" />}
            className="mb-3"
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Voltar
          </Button>
          <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
            Editar post
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {post.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ID: {post.id} · Criado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(post.createdAt)}
          </p>
        </div>
        {post.published && (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/blog/${post.slug}`} target="_blank" />}
          >
            <ExternalLink className="size-3.5" data-icon="inline-start" />
            Ver no site
          </Button>
        )}
      </div>

      <PostForm postId={post.id} initialValues={initialValues} />
    </div>
  )
}
