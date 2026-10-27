"use client"

import * as React from "react"

/** Aparelho sem mouse: sem hover ou com ponteiro grosso (celular, tablet). */
export const MIDIA_TOQUE = "(hover: none), (pointer: coarse)"

/**
 * Se a media query casa agora, e acompanha a mudança. Começa em false no
 * servidor e no primeiro render; o valor real chega depois de montar.
 */
export function useMediaQuery(query: string): boolean {
  const [casa, setCasa] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setCasa(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [query])

  return casa
}
