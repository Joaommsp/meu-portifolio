"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Gamepad2,
  BookMarked,
  LogOut,
  ExternalLink,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  newHref?: string
}

const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
    newHref: "/admin/posts/novo",
  },
  {
    href: "/admin/projetos",
    label: "Projetos",
    icon: Briefcase,
    newHref: "/admin/projetos/novo",
  },
  {
    href: "/admin/games",
    label: "Games",
    icon: Gamepad2,
    newHref: "/admin/games/novo",
  },
  {
    href: "/admin/books",
    label: "Livros",
    icon: BookMarked,
    newHref: "/admin/books/novo",
  },
] as const

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success("Sessão encerrada")
      router.replace("/admin/login")
    } catch {
      toast.error("Erro ao sair")
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="border-b border-border px-5 py-4">
        <Link
          href="/"
          className="font-display text-base font-semibold tracking-tight"
        >
          joão<span className="text-brand">.</span>marcos
        </Link>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-brand">
          Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        <ul className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="group/row">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                  {item.newHref && (
                    <Link
                      href={item.newHref}
                      aria-label={`Novo ${item.label.toLowerCase()}`}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-brand",
                        "group-hover/row:opacity-100 focus-visible:opacity-100",
                        active && "opacity-100"
                      )}
                    >
                      <Plus className="size-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Quick links */}
        <div className="mt-8 px-3">
          <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Ver no site
          </p>
          <ul className="space-y-0.5 text-sm">
            <li>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 py-1 text-muted-foreground transition-colors hover:text-brand"
              >
                <ExternalLink className="size-3" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                target="_blank"
                className="flex items-center gap-2 py-1 text-muted-foreground transition-colors hover:text-brand"
              >
                <ExternalLink className="size-3" />
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/projetos"
                target="_blank"
                className="flex items-center gap-2 py-1 text-muted-foreground transition-colors hover:text-brand"
              >
                <ExternalLink className="size-3" />
                Projetos
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium">João Marcos</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" data-icon="inline-start" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
