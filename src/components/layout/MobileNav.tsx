"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeColorSwitcher } from "./ThemeColorSwitcher"
import { NAV_GROUPS, SOCIAL_LINKS, LOGO_SRC } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Abrir menu"
            // 44px no toque (mínimo tocável); volta ao tamanho compacto no desktop.
            className="size-11 lg:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[85%] max-w-sm flex-col gap-8 p-6"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SheetDescription className="sr-only">
          Navegação principal e links sociais
        </SheetDescription>

        {/* Brand mark inside sheet */}
        <div className="mt-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="inline-flex items-center"
            aria-label="João Marcos · página inicial"
          >
            <Image
              src={LOGO_SRC}
              alt="João Marcos"
              width={36}
              height={36}
              className="size-9"
            />
          </Link>
        </div>

        {/* Nav — grupos abrem em acordeão; alvos grandes pro toque.
            `flex-1 min-h-0 overflow-y-auto`: com os grupos expandidos a lista
            passa da altura da tela, e sem isso o excedente ficava inalcançável
            (um filho de flex não encolhe abaixo do conteúdo sem `min-h-0`).
            `overscroll-contain` evita que a rolagem vaze pra página atrás. */}
        <nav
          className="-mx-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2"
          aria-label="Principal (mobile)"
        >
          {NAV_GROUPS.map((entrada) => {
            if (entrada.kind === "link") {
              const ativo =
                entrada.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(entrada.href)
              return (
                <Link
                  key={entrada.href}
                  href={entrada.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-3 font-display text-2xl font-semibold tracking-tight transition-colors",
                    ativo ? "text-brand" : "text-foreground hover:text-brand"
                  )}
                >
                  {entrada.label}
                </Link>
              )
            }

            const algumAtivo = entrada.items.some((i) =>
              pathname.startsWith(i.href)
            )
            return (
              <details
                key={entrada.label}
                // Abre já expandido o grupo da página atual: quem entrou pelo
                // menu vê onde está sem ter que caçar.
                open={algumAtivo}
                className="group/nav"
              >
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between",
                    "rounded-md px-3 py-3 font-display text-2xl font-semibold tracking-tight transition-colors",
                    "[&::-webkit-details-marker]:hidden",
                    algumAtivo ? "text-brand" : "text-foreground"
                  )}
                >
                  {entrada.label}
                  <ChevronDown
                    aria-hidden
                    className="size-5 text-muted-foreground transition-transform duration-200 group-open/nav:rotate-180"
                  />
                </summary>
                <div className="mb-1 flex flex-col gap-0.5 pb-1 pl-3">
                  {entrada.items.map((item) => {
                    const ativo = pathname.startsWith(item.href)
                    const Icone = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors",
                          ativo
                            ? "bg-brand/10 text-brand"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icone className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </nav>

        {/* Footer of sheet: theme + socials */}
        <div className="mt-auto flex flex-col gap-5 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Cor de destaque
            </span>
            <ThemeColorSwitcher align="end" />
          </div>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
