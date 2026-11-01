"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type PageTransitionProps = {
  children: React.ReactNode
}

/**
 * Entrada suave a cada troca de rota, só em CSS (`pagina-entra` no
 * globals.css).
 *
 * Era um `AnimatePresence mode="wait"`: a página nova só montava depois que a
 * saída da anterior terminasse, e às vezes essa saída nunca terminava. A home
 * ficava em branco (ou com o hero invisível) até rolar a página. Agora a
 * página nova monta na hora e só a entrada é animada; nada espera nada.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-[pagina-entra_300ms_cubic-bezier(.23,1,.32,1)_both] motion-reduce:animate-none">
      {children}
    </div>
  )
}
