import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Cabecalho } from "@/components/services/service-sections"
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
      <div className="container mx-auto max-w-6xl px-5 py-24 sm:px-6 md:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Cabecalho numero={numero} rotulo="Prova" titulo="O que já está no ar" />
          </div>
          <ScrollReveal delay={0.1}>
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Ver todos os projetos
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto, i) => (
            <ScrollReveal key={projeto.id} delay={0.15 + i * 0.07}>
              <ProjectCard project={projeto} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
