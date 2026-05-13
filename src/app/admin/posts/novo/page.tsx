"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostForm } from "@/components/admin/PostForm"

export default function NovoPostPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
          Novo post
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Criar post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Auto-save a cada 30s no localStorage. Pode fechar a aba sem medo.
        </p>
      </div>

      <PostForm />
    </div>
  )
}
