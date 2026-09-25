import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Cabecalho, SECAO } from "@/components/services/service-sections"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

/**
 * A prova da página: projetos reais do catálogo.
 *
 * Recebe a lista pronta em vez de buscar: quem monta a página precisa saber
 * ANTES se vai haver prova, porque é isso que define a numeração das seções.
 * Uma seção que se esconde sozinha depois de já ter um número deixa buraco na
 * sequência.
 *
 * Reusa o `ProjectCard` da listagem — mesma capa, mesmas tags, mesmo hover.
 * Uma página de venda que desenha o próprio card acaba divergindo do
 * catálogo, e aí o visitante vê duas versões do mesmo projeto.
 */
export function ServiceProof({
  projetos,
  numero,
}: {
  projetos: readonly Project[]
  numero: string
}) {
  return (
    <section className="border-y border-border bg-card/40">
      <div className={SECAO}>
        {/* Tudo aqui troca em `md`, o ponto em que o grid sai da coluna única:
            abaixo dele os cards estão empilhados, e o link desce pra depois. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Cabecalho numero={numero} rotulo="Prova" titulo="O que já está no ar" />
          </div>
          <ScrollReveal delay={0.1} className="hidden md:block">
            <VerTodos />
          </ScrollReveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto, i) => (
            /* Empilhados, cada card tem ~480px: dois já provam, e o terceiro
               só alongava a página. */
            <ScrollReveal
              key={projeto.id}
              delay={0.15 + i * 0.07}
              className={cn(i >= LIMITE_EMPILHADO && "max-md:hidden")}
            >
              <ProjectCard project={projeto} />
            </ScrollReveal>
          ))}
        </div>

        {/* Empilhado, o link vem DEPOIS dos cards: é o próximo passo de quem
            acabou de ver a prova, não uma saída antes dela. */}
        <div className="mt-8 md:hidden">
          <VerTodos />
        </div>
      </div>
    </section>
  )
}

/** Quantos cards a prova mostra enquanto eles ficam em coluna única. */
const LIMITE_EMPILHADO = 2

function VerTodos() {
  return (
    /* Padding com margem negativa: 44px de área de toque sem mexer no layout. */
    <Link
      href="/projetos"
      className="-my-3 inline-flex items-center gap-2 py-3 text-sm font-medium text-brand hover:underline"
    >
      Ver todos os projetos
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  )
}
