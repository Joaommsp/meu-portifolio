"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

import { GithubIcon } from "@/components/icons/brand-icons"
import { NAV_ITEMS } from "@/lib/nav"
import { ThemeColorSwitcher } from "./ThemeColorSwitcher"
import { MobileNav } from "./MobileNav"
import { CommandPaletteTrigger } from "@/components/command/CommandPaletteTrigger"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        // FIXED em vez de sticky — sai do layout flow, flutua acima de tudo,
        // não empurra hero/conteúdo pra baixo. Hero pode começar no top 0
        // absoluto do viewport e o header sobrepõe os primeiros 64px.
        "fixed top-0 z-40 w-full",
        "data-[scrolled=true]:bg-background/70 data-[scrolled=true]:backdrop-blur-xl",
        "data-[scrolled=true]:border-b data-[scrolled=true]:border-border"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6 max-w-6xl">
        {/* Logo / brand mark */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link
            href="/"
            className="font-display text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
            aria-label="João Marcos · página inicial"
          >
            joão
            <span className="text-brand">.</span>
            marcos
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
          {NAV_ITEMS.map((item, idx) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: 0.05 * idx,
                }}
              >
                <Link
                  href={item.href}
                  data-active={active}
                  className={cn(
                    "group relative inline-flex items-center px-3 py-1.5 text-sm font-medium",
                    "text-muted-foreground transition-colors hover:text-foreground",
                    "data-[active=true]:text-foreground"
                  )}
                >
                  {item.label}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        className="absolute inset-0 -z-10 rounded-md bg-brand/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-0.5 left-3 right-3 h-px scale-x-0 origin-center bg-brand transition-transform duration-300",
                      "group-hover:scale-x-100",
                      "data-[active=true]:scale-x-100"
                    )}
                  />
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Right side: socials + theme + mobile nav */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-1"
        >
          <CommandPaletteTrigger className="hidden md:inline-flex" />
          <a
            href="https://github.com/Joaommsp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden lg:inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GithubIcon className="size-4" />
          </a>
          <ThemeColorSwitcher align="end" />
          <MobileNav />
        </motion.div>
      </div>
    </header>
  )
}
