"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { GridBackground } from "@/components/backgrounds/GridBackground"
import { GradientOrbs } from "@/components/backgrounds/GradientOrbs"

type LoginForm = {
  email: string
  password: string
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { signIn, user, isAdmin, configured } = useAuth()
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  })

  // Se já estiver logado como admin, manda direto pro dashboard
  React.useEffect(() => {
    if (user && isAdmin) {
      router.replace("/admin")
    }
  }, [user, isAdmin, router])

  async function onSubmit(values: LoginForm) {
    if (!configured) {
      toast.error("Firebase não configurado", {
        description: "Preencha .env.local antes de fazer login.",
      })
      return
    }
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      toast.success("Login realizado")
      router.replace("/admin")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Credenciais inválidas"
      toast.error("Falha no login", { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-6">
      <GridBackground />
      <GradientOrbs />

      <Card className="relative w-full max-w-sm">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand/10">
              <Lock className="size-5 text-brand" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                Acesso restrito ao João Marcos
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                {...register("email", {
                  required: "Email obrigatório",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email inválido",
                  },
                })}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Senha obrigatória",
                  minLength: { value: 6, message: "Mínimo 6 caracteres" },
                })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !configured}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Entrando…" : "Entrar"}
            </Button>

            {!configured && (
              <p className="text-center text-xs text-muted-foreground">
                Firebase não configurado. Preencha{" "}
                <code className="font-mono">.env.local</code> primeiro.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
