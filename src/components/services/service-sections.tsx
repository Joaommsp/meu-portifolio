import Link from "next/link"
import { ArrowRight, Check, Plus } from "lucide-react"

import { ScrollReveal } from "@/components/animations"
import { ContactActions } from "@/components/services/ContactActions"
import { SERVICOS, rotaServico, type Servico } from "@/lib/servicos-content"
import { cn } from "@/lib/utils"

/**
 * Shell de seção, no mesmo ritmo das seções da home.
 *
 * `py-16` no celular: com `py-24`, o fim de uma seção e o começo da próxima
 * somavam 192px de vazio, e as páginas passavam de 8 mil px de altura.
 */
export const SECAO = "container mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-28"

/**
 * Cabeçalho de seção.
 *
 * `numero` vem de FORA porque a ordem não é fixa: a seção de prova some
 * quando não há projeto da categoria, e um número cravado em cada componente
 * deixaria buraco na sequência (01, 02, 04…) numa página de venda.
 */
export function Cabecalho({
  numero,
  rotulo,
  titulo,
  apoio,
}: {
  numero: string
  rotulo: string
  titulo: string
  apoio?: string
}) {
  return (
    <>
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          {numero} · {rotulo}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-pretty md:text-5xl">
          {titulo}
        </h2>
      </ScrollReveal>
      {apoio && (
        <ScrollReveal delay={0.1}>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            {apoio}
          </p>
        </ScrollReveal>
      )}
    </>
  )
}

type PropsSecao = { servico: Servico; numero: string }

export function Entregaveis({ servico, numero }: PropsSecao) {
  return (
    <section className={SECAO}>
      <Cabecalho
        numero={numero}
        rotulo="O que você recebe"
        titulo="O que posso garantir"
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {servico.entregaveis.map(({ icone: Icone, titulo, texto }, i) => (
          <ScrollReveal key={titulo} delay={0.15 + i * 0.05} className="h-full">
            <div className="h-full rounded-2xl border border-border bg-card p-7">
              <Icone className="size-5.5 text-brand" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                {titulo}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {texto}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

export function Processo({ servico, numero }: PropsSecao) {
  return (
    <section className={SECAO}>
      <Cabecalho
        numero={numero}
        rotulo="Como funciona"
        titulo="Quatro etapas, e você aprova cada uma"
      />

      <div className="relative mt-14">
        {/* A linha só aparece onde as etapas ficam lado a lado; empilhadas,
            ela cortaria o texto na diagonal. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-6.75 hidden h-px bg-border lg:block"
        />
        <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {servico.processo.map(({ numero: passo, titulo, texto }, i) => (
            <li key={passo} className="lg:pr-5">
              <ScrollReveal delay={0.15 + i * 0.07}>
                <div className="flex size-13.5 items-center justify-center rounded-full border border-brand bg-background">
                  <span className="font-mono text-sm font-medium text-brand">
                    {passo}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  {titulo}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {texto}
                </p>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Escopo({ servico, numero }: PropsSecao) {
  return (
    <section className={SECAO}>
      <Cabecalho
        numero={numero}
        rotulo="Escopo"
        titulo="O que está incluso"
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <ScrollReveal delay={0.15} className="h-full">
          <div className="h-full rounded-2xl border border-border bg-card p-8">
            <h3 className="font-display text-xl font-bold tracking-tight">
              Está incluso
            </h3>
            <ul className="mt-6 flex flex-col gap-3.5">
              {servico.escopo.incluso.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <Check className="mt-1 size-4.5 shrink-0 text-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="h-full">
          <div className="h-full rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-muted-foreground">
            <h3 className="font-display text-xl font-bold tracking-tight">
              Você também pode querer
            </h3>
            <ul className="mt-6 flex flex-col gap-3.5">
              {servico.escopo.tambem.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <Plus className="mt-1 size-4.5 shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export function Faq({ servico, numero }: PropsSecao) {
  return (
    <section className={SECAO}>
      <Cabecalho numero={numero} rotulo="Dúvidas" titulo="O que sempre me perguntam" />
      <dl className="mt-12 grid gap-x-10 gap-y-9 md:grid-cols-2">
        {servico.faq.map(({ pergunta, resposta }, i) => (
          <ScrollReveal key={pergunta} delay={0.1 + i * 0.04}>
            <dt className="font-display text-lg font-bold tracking-tight">
              {pergunta}
            </dt>
            <dd className="mt-2.5 leading-relaxed text-muted-foreground">
              {resposta}
            </dd>
          </ScrollReveal>
        ))}
      </dl>
    </section>
  )
}

export function Relacionados({ servico, numero }: PropsSecao) {
  const outros = SERVICOS.filter((s) => s.slug !== servico.slug)

  return (
    /* `md:pb-0` não é redundante: o `SECAO` traz `md:py-28`, que a partir de
       768px sobrescreveria um `pb-0` sem variante. */
    <section className={cn(SECAO, "pb-0 md:pb-0")}>
      <Cabecalho numero={numero} rotulo="Também faço" titulo="As outras três frentes" />
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {outros.map((outro, i) => (
          <li key={outro.slug} className="h-full">
            <ScrollReveal delay={0.12 + i * 0.05} className="h-full">
              <Link
                href={rotaServico(outro.slug)}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-brand/40"
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
                  {outro.categoria}
                </span>
                <span className="mt-3 font-display text-xl font-bold tracking-tight text-pretty">
                  {outro.promessa}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-brand">
                  Ver a página
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CtaFinal() {
  return (
    <section className={SECAO}>
      <ScrollReveal>
        {/* `superficie-painel` reaponta os tokens: o que cair aqui dentro já
            lê as cores da superfície escura. */}
        <div className="superficie-painel relative isolate overflow-hidden rounded-3xl border border-[var(--painel-borda)] bg-[var(--painel)] px-8 py-16 text-foreground md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -bottom-44 size-140 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(ellipse, var(--brand) 0%, transparent 68%)",
            }}
          />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-pretty md:text-[2.75rem]">
                Me conta o que você precisa construir
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground md:text-lg">
                Uma conversa de 20 minutos já é suficiente pra entender o que você
                precisa e se eu sou a pessoa certa pro seu caso.
              </p>
            </div>
            <ContactActions className="shrink-0" />
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
