"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"

import { GithubIcon } from "@/components/icons/brand-icons"
import { ThemeColorSwitcher } from "./ThemeColorSwitcher"
import { MobileNav } from "./MobileNav"
import { NavMenu } from "./NavMenu"
import { CommandPaletteTrigger } from "@/components/command/CommandPaletteTrigger"
import { cn } from "@/lib/utils"

export function Header() {
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
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-5 max-w-6xl sm:px-6">
        {/* Logo / brand mark */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link
            href="/"
            // -ml-1 compensa o padding extra pra logo não parecer deslocada da margem.
            className="-ml-1 inline-flex size-11 items-center justify-center transition-opacity hover:opacity-80 sm:ml-0 sm:size-auto"
            aria-label="João Marcos · página inicial"
          >
            <Image
              src="/logo-light.png"
              alt="João Marcos"
              width={36}
              height={36}
              className="size-9"
              priority
            />
          </Link>
        </motion.div>

        <NavMenu />

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
