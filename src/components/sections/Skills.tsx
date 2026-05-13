"use client"

import { ScrollReveal } from "@/components/animations"
import { TECH_ICONS, type TechName } from "@/components/icons/tech-icons"

const SKILLS: TechName[] = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Tailwind",
  "HTML5",
  "CSS3",
  "Firebase",
  "Node.js",
  "Vite",
  "Git",
  "Figma",
]

export function Skills() {
  return (
    <section
      id="skills"
      className="relative overflow-hidden border-y border-border bg-card/30 py-24"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
            02 · Stack
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Tecnologias do dia-a-dia
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mt-4 max-w-xl text-muted-foreground">
            12 ferramentas que uso pra entregar projetos em produção. Passe
            o mouse pra pausar a esteira.
          </p>
        </ScrollReveal>
      </div>

      {/* Marquee infinito */}
      <div className="marquee mt-12">
        <div className="marquee-track">
          {[...SKILLS, ...SKILLS].map((name, idx) => {
            const Icon = TECH_ICONS[name]
            return (
              <div
                key={`${name}-${idx}`}
                className="group flex shrink-0 items-center gap-3 px-8"
                aria-hidden={idx >= SKILLS.length}
              >
                <Icon
                  colored
                  className="size-8 transition-transform group-hover:scale-110"
                />
                <span className="font-display text-lg font-medium tracking-tight text-muted-foreground transition-colors group-hover:text-foreground">
                  {name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent"
      />
    </section>
  )
}
