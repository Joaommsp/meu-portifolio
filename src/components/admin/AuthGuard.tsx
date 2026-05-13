"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

type Props = {
  children: React.ReactNode
}

/**
 * Wrap content that requires admin authentication.
 * - Loading → spinner
 * - Firebase não configurado → tela de instruções
 * - Não logado → redireciona /admin/login
 * - Logado mas não é admin → redireciona /
 * - Admin OK → renderiza children
 */
export function AuthGuard({ children }: Props) {
  const { user, loading, isAdmin, configured } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!configured || loading) return
    if (!user) {
      router.replace("/admin/login")
      return
    }
    if (!isAdmin) {
      router.replace("/")
    }
  }, [configured, loading, user, isAdmin, router])

  if (!configured) {
    return <NotConfiguredScreen />
  }
  if (loading || !user || !isAdmin) {
    return <LoadingScreen />
  }

  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-brand" />
    </div>
  )
}

function NotConfiguredScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10">
          <ShieldAlert className="size-6 text-brand" />
        </div>
        <h1 className="text-2xl font-bold">Firebase não configurado</h1>
        <p className="text-muted-foreground">
          As variáveis{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_FIREBASE_*
          </code>{" "}
          não estão preenchidas em{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            .env.local
          </code>
          . Crie o projeto no Firebase Console, copie a config e reinicie o
          dev server.
        </p>
        <Button render={<a href="/" />} variant="outline">
          Voltar pro site
        </Button>
      </div>
    </div>
  )
}
