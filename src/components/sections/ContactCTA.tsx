import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal, TextReveal } from "@/components/animations"
import { CONTACT_EMAIL } from "@/lib/nav"
import { GradientOrbs } from "@/components/backgrounds/GradientOrbs"

export function ContactCTA() {
  return (
    <section
      id="contact-cta"
      className="relative isolate overflow-hidden scroll-mt-20"
    >
      <GradientOrbs
        orbs={[
          {
            size: 500,
            x: "20%",
            y: "10%",
            color: "var(--brand)",
            duration: 22,
            delay: 0,
            opacity: 0.2,
          },
          {
            size: 400,
            x: "70%",
            y: "60%",
            color: "var(--brand-glow)",
            duration: 26,
            delay: 3,
            opacity: 0.15,
          },
        ]}
      />

      <div className="container relative mx-auto max-w-3xl px-6 py-32 text-center">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
            06 · Contato
          </p>
        </ScrollReveal>

        <h2 className="mt-3 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          <ScrollReveal>
            <span className="block">Vamos</span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <span className="block text-gradient-brand">
              <TextReveal text="conversar?" by="letter" inView staggerDelay={0.04} />
            </span>
          </ScrollReveal>
        </h2>

        <ScrollReveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Tô sempre aberto a novos projetos, parcerias ou só uma boa
            conversa sobre design e código. Manda um email ou usa o
            formulário.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="min-w-0 max-w-full"
              render={<a href={`mailto:${CONTACT_EMAIL}`} />}
            >
              <Mail className="size-4" data-icon="inline-start" />
              <span className="truncate">{CONTACT_EMAIL}</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/contato" />}
            >
              Ir pra página de contato
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
