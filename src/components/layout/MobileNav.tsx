"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeColorSwitcher } from "./ThemeColorSwitcher"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/nav"
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
            className="lg:hidden"
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
              src="/logo-light.png"
              alt="João Marcos"
              width={36}
              height={36}
              className="size-9"
            />
          </Link>
        </div>

        {/* Nav items — large tap targets */}
        <nav
          className="flex flex-col gap-0.5"
          aria-label="Principal (mobile)"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 font-display text-2xl font-semibold tracking-tight transition-colors",
                  active
                    ? "text-brand"
                    : "text-foreground hover:text-brand"
                )}
              >
                {item.label}
              </Link>
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
