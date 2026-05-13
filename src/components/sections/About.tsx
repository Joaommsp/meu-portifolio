import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"

export function About() {
  return (
    <section
      id="about"
      className="container mx-auto max-w-6xl scroll-mt-20 px-6 py-32"
    >
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          01 · Sobre
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Um pouco sobre mim
        </h2>
      </ScrollReveal>

      <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
        {/* Avatar com glow brand */}
        <ScrollReveal direction="left">
          <div className="relative mx-auto md:mx-0">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-2xl opacity-50 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
              }}
            />
            <div className="relative aspect-square w-64 overflow-hidden rounded-xl border-2 border-brand/30 bg-card">
              {/* GitHub avatar — substituível por foto profissional */}
              <Image
                src="https://github.com/Joaommsp.png"
                alt="João Marcos"
                width={256}
                height={256}
                className="size-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest">
              <span className="inline-block size-1.5 rounded-full bg-success" />
              <span className="ml-1.5">disponível pra projetos</span>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-5">
          <ScrollReveal direction="right">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Sou <span className="text-foreground">desenvolvedor frontend</span>{" "}
              e <span className="text-foreground">designer UI/UX</span> com
              foco em construir produtos que combinam usabilidade com
              estética. Trabalho principalmente com React/Next.js e tenho
              forte interesse em sistemas de design escaláveis e animações
              contextuais.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.05}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Acredito que código bom é código que parece simples — mesmo
              quando não é. Por isso pratico clean code, type safety e
              acessibilidade desde o primeiro commit, não como otimização
              tardia.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 font-mono text-xs"
              >
                <MapPin className="size-3" />
                Paulo Afonso, BA
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 font-mono text-xs"
              >
                <GraduationCap className="size-3" />
                UNIRIOS · Sist. de Informação
              </Badge>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15}>
            <Button
              variant="outline"
              className="mt-4"
              render={<Link href="/sobre" />}
            >
              Ler mais sobre mim
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
