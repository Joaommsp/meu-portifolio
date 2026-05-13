"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"

import { useKonamiCode } from "@/hooks/useKonamiCode"

const KEYS = ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"]

/**
 * Easter egg: digite ↑ ↑ ↓ ↓ ← → ← → B A em qualquer lugar do site
 * pra disparar uma celebração full-screen com confetti.
 *
 * Se você quiser um GIF customizado, coloque ele em /public/konami.gif
 * — o componente usa essa imagem se existir, senão renderiza um ícone.
 */
export function KonamiEasterEgg() {
  const [open, setOpen] = React.useState(false)

  useKonamiCode(() => {
    if (open) return
    setOpen(true)
    // Auto-dismiss após 6 segundos
    setTimeout(() => setOpen(false), 6000)
  })

  // Esc fecha
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md"
        >
          {/* Confetti */}
          <Confetti />

          {/* Card central */}
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 w-full max-w-md overflow-hidden rounded-2xl border border-brand/40 bg-card/95 p-8 shadow-[0_0_80px_-20px_var(--brand-glow)] backdrop-blur-xl"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            {/* Banner topo */}
            <div className="text-center">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-brand">
                ★ ACHIEVEMENT UNLOCKED ★
              </span>
            </div>

            {/* Personagem / GIF */}
            <div className="mt-6 flex justify-center">
              <KonamiCharacter />
            </div>

            {/* Title */}
            <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-foreground">
              Konami Code
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Você é uma pessoa de cultura. Obrigado por explorar.
            </p>

            {/* Sequence pressed */}
            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {KEYS.map((key, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05, type: "spring" }}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-brand/50 bg-brand/10 font-mono text-sm font-bold text-brand"
                >
                  {key}
                </motion.span>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              <kbd className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5">
                Esc
              </kbd>
              <span>ou clique fora pra fechar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Logo oficial da Konami recriada em CSS — pill vermelho + texto branco.
 * Usa #E60012 (vermelho oficial da marca).
 */
function KonamiCharacter() {
  return (
    <motion.div
      animate={{
        rotate: [0, -3, 3, -3, 0],
        scale: [1, 1.04, 1, 1.04, 1],
      }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center rounded-full px-9 py-4 shadow-[0_8px_32px_-8px_rgba(230,0,18,0.6),0_0_60px_-20px_rgba(230,0,18,0.8)]"
      style={{ backgroundColor: "#E60012" }}
    >
      {/* Highlight sutil em cima pro brilho retrô */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-full bg-white/15 blur-sm"
      />
      <span
        className="relative font-display text-2xl font-black uppercase text-white"
        style={{
          letterSpacing: "0.2em",
          fontStyle: "italic",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        KONAMI
      </span>
    </motion.div>
  )
}

/**
 * Confetti CSS-only — 30 partículas com cores brand, caindo aleatoriamente.
 */
function Confetti() {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 1.5,
        rotate: Math.random() * 360,
        color: ["var(--brand)", "var(--brand-glow)", "#fff", "#facc15"][
          i % 4
        ] as string,
      })),
    []
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, rotate: p.rotate, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotate + 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          className="absolute top-0 block size-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}
