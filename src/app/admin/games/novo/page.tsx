"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameForm } from "@/components/admin/GameForm"

export default function NovoGamePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/games" />}
          className="mb-3"
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Voltar
        </Button>
        <Badge variant="outline" className="mb-2 font-mono text-[0.65rem] uppercase">
          Novo jogo
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Adicionar jogo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha as informações do jogo, sua história e por que você gosta.
        </p>
      </div>

      <GameForm />
    </div>
  )
}
