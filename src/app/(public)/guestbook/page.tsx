"use client"

import * as React from "react"
import Image from "next/image"
import {
  Sparkles,
  Loader2,
  Send,
  Trash2,
  LogOut,
  MessageCircle,
} from "lucide-react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GithubIcon } from "@/components/icons/brand-icons"
import {
  FadeIn,
  SlideIn,
  ScrollReveal,
} from "@/components/animations"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
} from "@/components/backgrounds"
import { requireAuth, firebaseConfigured } from "@/lib/firebase/config"
import {
  signInWithGitHub,
  signInWithGoogle,
  signOutGuestbook,
  listGuestbookEntries,
  upsertGuestbookEntry,
  deleteOwnGuestbookEntry,
  MAX_MESSAGE_LENGTH,
} from "@/lib/firebase/guestbook"
import type { GuestbookEntry } from "@/types/guestbook"
import { cn } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const PROVIDER_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  "github.com": {
    label: "via GitHub",
    icon: <GithubIcon className="size-3" />,
  },
  "google.com": {
    label: "via Google",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3" aria-hidden>
        <path
          fill="currentColor"
          d="M21.35 11.1H12v3.2h5.35c-.5 2.4-2.6 4.1-5.35 4.1-3.2 0-5.85-2.65-5.85-5.85S8.8 6.7 12 6.7c1.5 0 2.85.55 3.9 1.45l2.45-2.45A9 9 0 0 0 12 3a9.15 9.15 0 1 0 9.35 9.15c0-.7-.05-1.35-.15-2.05Z"
        />
      </svg>
    ),
  },
}

export default function GuestbookPage() {
  const [user, setUser] = React.useState<User | null>(null)
  const [authLoading, setAuthLoading] = React.useState(true)
  const [entries, setEntries] = React.useState<GuestbookEntry[] | null>(null)
  const [message, setMessage] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [signingIn, setSigningIn] = React.useState<"github" | "google" | null>(
    null
  )

  // Watch auth state — degrada com elegância quando o Firebase não está
  // configurado (env ausente) ou indisponível, em vez de derrubar a página.
  React.useEffect(() => {
    if (!firebaseConfigured) {
      setAuthLoading(false)
      return
    }
    let unsub = () => {}
    try {
      const auth = requireAuth()
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setAuthLoading(false)
      })
    } catch (err) {
      console.error("[guestbook] auth indisponível:", err)
      setAuthLoading(false)
    }
    return () => unsub()
  }, [])

  const reload = React.useCallback(async () => {
    if (!firebaseConfigured) {
      setEntries([])
      return
    }
    try {
      const data = await listGuestbookEntries()
      setEntries(data)
    } catch (err) {
      console.error(err)
      setEntries([])
    }
  }, [])

  React.useEffect(() => {
    reload()
  }, [reload])

  // Pre-fill message if user already has an entry
  const ownEntry = React.useMemo(
    () => (user ? entries?.find((e) => e.userId === user.uid) ?? null : null),
    [user, entries]
  )

  React.useEffect(() => {
    if (ownEntry && !message) setMessage(ownEntry.message)
  }, [ownEntry, message])

  async function handleSignIn(provider: "github" | "google") {
    setSigningIn(provider)
    try {
      if (provider === "github") await signInWithGitHub()
      else await signInWithGoogle()
      toast.success("Logado")
    } catch (err) {
      toast.error("Erro ao logar", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSigningIn(null)
    }
  }

  async function handleSignOut() {
    try {
      await signOutGuestbook()
      setMessage("")
      toast.success("Deslogado")
    } catch (err) {
      toast.error("Erro ao sair", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!message.trim()) {
      toast.error("Mensagem vazia")
      return
    }

    setSubmitting(true)
    try {
      await upsertGuestbookEntry(user, message)
      toast.success(ownEntry ? "Mensagem atualizada" : "Mensagem assinada")
      await reload()
    } catch (err) {
      toast.error("Erro ao publicar", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!user || !ownEntry) return
    if (!confirm("Apagar sua mensagem do guestbook?")) return

    try {
      await deleteOwnGuestbookEntry(user.uid)
      setMessage("")
      toast.success("Mensagem removida")
      await reload()
    } catch (err) {
      toast.error("Erro ao remover", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const charsLeft = MAX_MESSAGE_LENGTH - message.length

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-4xl px-6 py-24 md:py-28">
          <FadeIn>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              <MessageCircle className="size-3.5" />
              Guestbook
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Passou por
              <br />
              <span className="text-gradient-brand">aqui?</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Deixa uma mensagem. Não importa se é &ldquo;oi&rdquo;,
              comentário sobre algum projeto, ou recomendação aleatória — todo
              mundo lê.
            </p>
          </SlideIn>
        </div>
      </section>

      {/* Form ou Sign-in */}
      <section className="container mx-auto max-w-2xl px-6 pt-12 pb-12">
        <ScrollReveal>
          <Card className="border-brand/20 bg-card/70 backdrop-blur">
            <CardContent className="p-6">
              {!firebaseConfigured ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <MessageCircle className="size-6 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Guestbook temporariamente indisponível
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Não foi possível conectar agora. Tenta de novo daqui a
                    pouco.
                  </p>
                </div>
              ) : authLoading ? (
                <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando…
                </div>
              ) : user ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName ?? "Avatar"}
                        width={40}
                        height={40}
                        className="rounded-full ring-1 ring-border"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.displayName ?? user.email ?? "Anônimo"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {user.email ?? "logado"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-3.5" data-icon="inline-start" />
                      Sair
                    </Button>
                  </div>

                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreve algo legal…"
                    rows={3}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="resize-none"
                    aria-label="Sua mensagem"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "font-mono text-xs",
                        charsLeft < 30
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}
                    >
                      {charsLeft} restantes
                    </span>
                    <div className="flex gap-2">
                      {ownEntry && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleDelete}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" data-icon="inline-start" />
                          Apagar
                        </Button>
                      )}
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submitting || !message.trim()}
                      >
                        {submitting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Send className="size-3.5" data-icon="inline-start" />
                        )}
                        {ownEntry ? "Atualizar" : "Publicar"}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <Sparkles className="mx-auto size-6 text-brand" />
                  <p className="text-sm text-muted-foreground">
                    Loga com GitHub ou Google pra deixar sua marca. Só uma
                    mensagem por pessoa — pode editar depois.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                      onClick={() => handleSignIn("github")}
                      disabled={signingIn !== null}
                      size="lg"
                    >
                      {signingIn === "github" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <GithubIcon className="size-4" data-icon="inline-start" />
                      )}
                      Logar com GitHub
                    </Button>
                    <Button
                      onClick={() => handleSignIn("google")}
                      disabled={signingIn !== null}
                      variant="outline"
                      size="lg"
                    >
                      {signingIn === "google" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <GoogleIcon className="size-4" data-icon="inline-start" />
                      )}
                      Logar com Google
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* Lista */}
      <section className="container mx-auto max-w-3xl px-6 pb-24">
        <ScrollReveal>
          <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <MessageCircle className="size-3.5 text-brand" />
            Mensagens
            {entries && (
              <Badge variant="outline" className="ml-1 font-mono text-[0.65rem]">
                {entries.length}
              </Badge>
            )}
          </p>
        </ScrollReveal>

        {!entries ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando mensagens…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
            <p className="text-muted-foreground">
              {firebaseConfigured
                ? "Ainda sem mensagens. Seja o primeiro!"
                : "As mensagens não puderam ser carregadas agora."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const provider = PROVIDER_LABEL[entry.providerId]
              const isOwn = user?.uid === entry.userId
              return (
                <ScrollReveal key={entry.id} delay={Math.min(idx, 8) * 0.03}>
                  <div
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      isOwn
                        ? "border-brand/40 bg-brand/[0.04]"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {entry.photoURL ? (
                        <Image
                          src={entry.photoURL}
                          alt={entry.name}
                          width={36}
                          height={36}
                          className="rounded-full ring-1 ring-border"
                          unoptimized
                        />
                      ) : (
                        <div className="size-9 rounded-full bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold">
                            {entry.name}
                          </span>
                          {provider && (
                            <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground">
                              {provider.icon}
                              {provider.label}
                            </span>
                          )}
                          {isOwn && (
                            <Badge
                              variant="outline"
                              className="border-brand/40 bg-brand/10 font-mono text-[0.6rem] text-brand"
                            >
                              você
                            </Badge>
                          )}
                          <span className="ml-auto font-mono text-[0.65rem] text-muted-foreground">
                            {dateFormatter.format(entry.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/90 break-words">
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v3.2h5.35c-.5 2.4-2.6 4.1-5.35 4.1-3.2 0-5.85-2.65-5.85-5.85S8.8 6.7 12 6.7c1.5 0 2.85.55 3.9 1.45l2.45-2.45A9 9 0 0 0 12 3a9.15 9.15 0 1 0 9.35 9.15c0-.7-.05-1.35-.15-2.05Z"
      />
    </svg>
  )
}
