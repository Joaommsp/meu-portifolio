"use client"

import * as React from "react"

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const

/**
 * Detecta o Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A.
 * Dispara `onSuccess` quando a sequência completa for digitada na ordem.
 */
export function useKonamiCode(onSuccess: () => void) {
  const cbRef = React.useRef(onSuccess)
  cbRef.current = onSuccess

  React.useEffect(() => {
    let pos = 0

    function onKey(e: KeyboardEvent) {
      // Ignora key repeat (segurar a tecla)
      if (e.repeat) return

      // Ignora se está digitando em input/textarea
      const target = e.target as HTMLElement | null
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return
      }

      const expected = KONAMI_SEQUENCE[pos]
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

      if (key === expected) {
        pos += 1
        if (pos === KONAMI_SEQUENCE.length) {
          pos = 0
          cbRef.current()
        }
      } else {
        // Reseta — se a tecla errada já é o primeiro passo, conta como reset+1
        pos = key === KONAMI_SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
}
