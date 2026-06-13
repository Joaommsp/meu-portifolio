"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookForm } from "@/components/admin/BookForm"
import { getBook } from "@/lib/firebase/books"
import type { Book, BookInput } from "@/types/book"

export default function EditarBookPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [book, setBook] = React.useState<Book | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getBook(params.id)
        if (cancelled) return
        if (!data) {
          toast.error("Livro não encontrado")
          router.replace("/admin/books")
          return
        }
        setBook(data)
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

  if (!book) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando…
      </div>
    )
  }

  const initialValues: BookInput = {
    slug: book.slug,
    title: book.title,
    author: book.author,
    shortDescription: book.shortDescription,
    synopsis: book.synopsis,
    whyILikeIt: book.whyILikeIt,
    coverImage: book.coverImage,
    genres: book.genres,
    status: book.status,
    yearRead: book.yearRead,
    pages: book.pages,
    rating: book.rating,
    featured: book.featured,
    published: book.published,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/books" />}
            className="mb-3"
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Voltar
          </Button>
          <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
            Editar livro
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {book.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            por {book.author} · ID: {book.id}
          </p>
        </div>
        {book.published && (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/livros/${book.slug}`} target="_blank" />}
          >
            <ExternalLink className="size-3.5" data-icon="inline-start" />
            Ver no site
          </Button>
        )}
      </div>

      <BookForm bookId={book.id} initialValues={initialValues} />
    </div>
  )
}
