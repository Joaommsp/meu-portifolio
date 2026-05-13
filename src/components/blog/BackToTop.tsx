"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUp } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

const SHOW_AFTER_PX = 600

export function BackToTop() {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:border-brand hover:text-brand"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
