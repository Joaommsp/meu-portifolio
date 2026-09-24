import * as React from "react"

import { cn } from "@/lib/utils"

/** Os três botões da barra de título, nas cores do macOS. */
const LUZES = [
  { cor: "#ff5f57", nome: "fechar" },
  { cor: "#febc2e", nome: "minimizar" },
  { cor: "#28c840", nome: "maximizar" },
] as const

/** Usuário e geometria do terminal — os mesmos em toda janela do site. */
const USUARIO = "joao-marcos"
const GEOMETRIA = "120×32"

type Props = {
  /**
   * Seção que a janela exibe (`sobre`, `projetos`…). Sem ela a barra assume a
   * forma da home, onde a janela é a do próprio shell.
   */
  secao?: string
  /** Vai na moldura — é por aqui que o PageHero aplica `superficie-painel`. */
  className?: string
  children: React.ReactNode
}

/**
 * Moldura de janela de sistema: barra de título com os três botões e o
 * conteúdo embaixo, sobre o painel escuro.
 *
 * A moldura não é enfeite — é o que faz um bloco escuro ler como conteúdo
 * emoldurado em vez de retângulo órfão no meio do creme. Vive em dois lugares:
 * o hero da home (`Hero`) e o hero padrão das internas (`PageHero`), que é a
 * duplicação que este componente existe pra evitar.
 *
 * DEPENDE dos tokens `--painel-*`.
 */
export function WindowFrame({ secao, className, children }: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[15px] border border-[var(--painel-borda)] bg-[var(--painel)] shadow-[0_30px_70px_-28px_var(--shadow-elevated)]",
        className
      )}
    >
      <div className="flex h-9.5 items-center gap-2 border-b border-[var(--painel-borda)] bg-[var(--painel-2)] px-3.5">
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
        <span className="mx-auto truncate font-mono text-[11.5px] text-[var(--painel-texto-2)]">
          {secao ? (
            <>
              <span className="font-medium text-[var(--painel-texto)]">{secao}</span>
              {` — ${USUARIO} — ${GEOMETRIA}`}
            </>
          ) : (
            <>
              <span className="font-medium text-[var(--painel-texto)]">{USUARIO}</span>
              {` — zsh — ${GEOMETRIA}`}
            </>
          )}
        </span>
      </div>

      {children}
    </div>
  )
}
