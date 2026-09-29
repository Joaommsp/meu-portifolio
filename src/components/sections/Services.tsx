import { ScrollReveal } from "@/components/animations"
import { ServiceCard } from "@/components/services/ServiceCard"
import { ANCORA_SERVICOS } from "@/lib/rotas"
import { SERVICOS } from "@/lib/servicos-content"
import { SECAO_HOME } from "@/components/sections/secao"
import { cn } from "@/lib/utils"

/**
 * A seção que faz a pergunta: quatro frentes de trabalho, cada uma com o
 * próprio fundo animado, cada card levando pra página da frente.
 *
 * Os dados vêm de `lib/servicos-content`, o mesmo arquivo que alimenta
 * `/servicos/[slug]`: a promessa que aparece no card é literalmente a que
 * abre a página, sem duas cópias pra sair de sincronia.
 *
 * Vem logo depois do cartão de apresentação (ProfileIntro) e antes do
 * `About`: quem chega vê primeiro o que pode contratar, e o "sobre mim" vem
 * depois, pra quem quer saber com quem está falando.
 */
export function Services() {
  return (
    <section
      id={ANCORA_SERVICOS}
      className={cn(SECAO_HOME, "scroll-mt-20")}
    >
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          01 · Serviços
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          O que você precisa construir?
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Quatro frentes, o mesmo cuidado com a interface e com o que roda por
          trás dela.
        </p>
      </ScrollReveal>

      <div className="mt-13 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICOS.map((servico, i) => (
          <ScrollReveal
            key={servico.slug}
            delay={0.15 + i * 0.05}
            className="h-full"
          >
            <ServiceCard servico={servico} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
