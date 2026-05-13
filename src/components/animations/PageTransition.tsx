"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type PageTransitionProps = {
  children: React.ReactNode
}

/**
 * Wrapper opcional pra animar transições entre rotas.
 * Use envolvendo o conteúdo de `<main>` num layout client.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
