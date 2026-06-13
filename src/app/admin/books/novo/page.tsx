"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookForm } from "@/components/admin/BookForm"

export default function NovoBookPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
          Novo livro
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Adicionar livro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sinopse, sua nota e por que esse livro te marcou.
        </p>
      </div>

      <BookForm />
    </div>
  )
}
