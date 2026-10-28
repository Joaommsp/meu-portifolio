import * as React from "react"

import { cn } from "@/lib/utils"

/** Os três botões da barra de título, nas cores do macOS. */
const LUZES = [
  { cor: "#ff5f57", nome: "fechar" },
  { cor: "#febc2e", nome: "minimizar" },
  { cor: "#28c840", nome: "maximizar" },
] as const

/** Usuário e geometria do terminal, os mesmos em toda janela do site. */
const USUARIO = "joao-marcos"
const GEOMETRIA = "120×32"

type Props = {
  /**
   * Seção que a janela exibe (`sobre`, `projetos`…). Sem ela a barra assume a
   * forma da home, onde a janela é a do próprio shell.
   */
  secao?: string
  /** Vai na moldura (ex.: `luz-borda relative` pra correr o traço de luz). */
  className?: string
  children: React.ReactNode
}

/**
 * Moldura de janela de sistema em vidro: barra de título com os três botões
 * e o conteúdo embaixo. O vidro é o utilitário `vidro` do globals.css, sem
 * backdrop-filter.
 *
 * Vive no hero da home e nos dois contatos (o da home e o fecho das páginas
 * de serviço).
 */
export function WindowFrame({ secao, className, children }: Props) {
  return (
    <div
      className={cn(
        "vidro overflow-hidden rounded-[18px]",
        className
      )}
    >
      <div className="flex h-9.5 items-center gap-2 border-b border-[var(--vidro-fio)] bg-(--vidro-faixa) px-3.5">
        <div className="flex gap-1.75">
          {LUZES.map(({ cor, nome }) => (
            <span
              key={nome}
              aria-hidden
              className="block size-2.75 rounded-full"
              style={{ background: cor }}
            />
          ))}
        </div>
        <span className="mx-auto truncate font-mono text-[11.5px] text-muted-foreground">
          {secao ? (
            <>
              <span className="font-medium text-foreground">{secao}</span>
              {` · ${USUARIO} · ${GEOMETRIA}`}
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{USUARIO}</span>
              {` · zsh · ${GEOMETRIA}`}
            </>
          )}
        </span>
      </div>

      {children}
    </div>
  )
}
