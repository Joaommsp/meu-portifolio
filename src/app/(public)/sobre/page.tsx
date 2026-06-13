import type { Metadata } from "next"
import Image from "next/image"
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  Heart,
  Users,
  MessageCircle,
  Target,
  Brain,
  BookOpen,
  Headphones,
  Lightbulb,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal, FadeIn, SlideIn } from "@/components/animations"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { TECH_ICONS, type TechName } from "@/components/icons/tech-icons"

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça João Marcos — desenvolvedor frontend e designer UI/UX em Paulo Afonso, BA. Trajetória, skills, soft skills e CV.",
}

type SkillCategory = {
  label: string
  techs: readonly TechName[]
  extras?: readonly string[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: "Frontend",
    techs: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind", "HTML5", "CSS3", "Vite"],
  },
  {
    label: "Backend",
    techs: ["Node.js", "Firebase"],
    extras: ["Java", "MySQL", "REST APIs"],
  },
  {
    label: "Design",
    techs: ["Figma"],
    extras: ["Photoshop", "Design Systems", "UI/UX"],
  },
  {
    label: "Ferramentas",
    techs: ["Git"],
    extras: ["GitHub", "VS Code", "IntelliJ", "Vercel", "Notion"],
  },
]

type TimelineItem = {
  year: string
  title: string
  org: string
  description: string
  type: "work" | "education"
}

const TIMELINE: TimelineItem[] = [
  {
    year: "2025 — agora",
    title: "Frontend Developer",
    org: "GFI · Consultoria Especializada",
    description:
      "Plataforma de gestão financeira em React, Next.js e Tailwind. Multi-tenant, dashboards comparativos, foco em produto.",
    type: "work",
  },
  {
    year: "2023 — 2025",
    title: "Design Gráfico",
    org: "Egrafil · Gráfica Independência LTDA",
    description:
      "Criação de identidade visual, peças para redes sociais e materiais gráficos — repertório visual que hoje aplico em interface.",
    type: "work",
  },
  {
    year: "2021 — 2025",
    title: "Bacharelado em Sistemas de Informação",
    org: "UNIRIOS — Centro Universitário do Rio São Francisco",
    description:
      "Formado em 2025. Foco em desenvolvimento de software, banco de dados e engenharia de requisitos.",
    type: "education",
  },
  {
    year: "2023",
    title: "Bootcamps Frontend",
    org: "Dio.me",
    description:
      "HTML/CSS/JS, React e o resto do ecossistema. Aprendi mais aqui em 6 meses do que esperava — projetos práticos batem teoria de qualquer dia.",
    type: "education",
  },
  {
    year: "2019",
    title: "Serviços Administrativos",
    org: "SENAC BA · 1.000h",
    description:
      "Curso técnico que parece distante de código, mas a parte de processo e organização ainda me ajuda em produto até hoje.",
    type: "education",
  },
]

function CurrentlyCard({
  icon: Icon,
  label,
  title,
  subtitle,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  title: string
  subtitle: string
  link?: string
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="size-4" />
        </div>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 font-display text-base font-semibold leading-tight tracking-tight">
        {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      {link && (
        <ExternalLink className="absolute right-4 top-4 size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  )
  const baseClass =
    "group relative block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className={baseClass}>
      {inner}
    </a>
  ) : (
    <div className={baseClass}>{inner}</div>
  )
}

type SoftSkill = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const SOFT_SKILLS: SoftSkill[] = [
  {
    icon: MessageCircle,
    label: "Comunicação clara",
    description:
      "Falo a mesma língua com designer, PM e back. Menos ruído entre o que foi pedido e o que sai.",
  },
  {
    icon: Users,
    label: "Time",
    description:
      "Code review sem ego, pair quando precisa, feedback honesto. Sem drama.",
  },
  {
    icon: Target,
    label: "Foco no problema",
    description:
      "Decisão de stack vem depois do problema, nunca antes. Ferramenta da moda não é argumento.",
  },
  {
    icon: Brain,
    label: "Curiosidade",
    description:
      "Leio, testo, quebro coisas em side projects. O que aprendo hoje aparece no trabalho semana que vem.",
  },
  {
    icon: Heart,
    label: "Detalhe",
    description:
      "Spacing, easing, copy, ARIA. Ninguém comenta — mas é o que separa amador de profissional.",
  },
  {
    icon: Sparkles,
    label: "Design",
    description:
      "Estética é função. Interface bonita resolve o problema melhor que feia, e ponto.",
  },
]

export default function SobrePage() {
  return (
    <>
      {/* Hero da página */}
      <section className="relative isolate overflow-hidden">
        <GridBackground />
        <GradientOrbs
          orbs={[
            {
              size: 400,
              x: "10%",
              y: "20%",
              color: "var(--brand)",
              duration: 18,
              delay: 0,
              opacity: 0.25,
            },
            {
              size: 350,
              x: "75%",
              y: "60%",
              color: "var(--brand-glow)",
              duration: 22,
              delay: 2,
              opacity: 0.2,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />

        <div className="container relative mx-auto max-w-4xl px-6 py-24 md:py-32">
          <FadeIn>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Sobre mim
            </p>
          </FadeIn>
          <SlideIn direction="up" delay={0.1}>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Frontend dev que pensa
              <br />
              <span className="text-gradient-brand">como designer</span>
            </h1>
          </SlideIn>
          <SlideIn direction="up" delay={0.25}>
            <Button
              variant="outline"
              className="mt-8"
              render={
                <a
                  href="/cv-joaomarcos.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Download className="size-4" data-icon="inline-start" />
              Baixar CV
            </Button>
          </SlideIn>
        </div>
      </section>

      {/* Bio extendida */}
      <section className="container mx-auto max-w-4xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
          <div className="self-start md:sticky md:top-24">
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
                  <Image
                    src="https://github.com/Joaommsp.png"
                    alt="João Marcos"
                    width={256}
                    height={256}
                    className="size-full object-cover"
                    priority
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <ScrollReveal direction="right">
              <p>
                <span className="text-foreground">Comecei programando</span>{" "}
                aos 17 mexendo em CSS. Foi quando descobri que escrever
                código pra mudar o jeito que algo aparecia era a coisa
                mais legal do mundo. Daí pra{" "}
                <code className="font-mono text-sm">git push</code> no
                primeiro repo público foi questão de tempo.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.05}>
              <p>
                Hoje trabalho com{" "}
                <span className="text-foreground">
                  desenvolvimento de dashboards interativos
                </span>{" "}
                — interfaces que precisam mostrar muito dado sem virar
                ruído. Stack do dia-a-dia: Next.js, TypeScript, Tailwind,
                com atenção a performance, acessibilidade e UX.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <p>
                Na ponta de design, uso{" "}
                <span className="text-foreground">Figma</span> pra
                prototipar e desenhar componentes antes de codar — entrego
                mais rápido e com menos retrabalho. Acho que o melhor
                frontend dev é meio designer, e o melhor designer é meio
                dev.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <p>
                Uso <span className="text-foreground">IA</span> no dia-a-dia
                pra acelerar e prototipar ideias rápido — mas o que conta pra
                mim é a{" "}
                <span className="text-foreground">
                  criatividade e a gestão de ideias
                </span>
                , não a ferramenta.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <p>
                Fora do trabalho, gosto de testar ferramentas novas,
                escrever sobre o que aprendi (ver o blog) e jogar uns
                games quando o cérebro pede pausa.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Atualmente — o que tô lendo, ouvindo, estudando */}
      <section className="container mx-auto max-w-4xl px-6 pb-12">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
            Atualmente
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            O que tá rolando
          </h2>
        </ScrollReveal>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <ScrollReveal delay={0.1}>
            <CurrentlyCard
              icon={BookOpen}
              label="Lendo"
              title="Refactoring UI"
              subtitle="Adam Wathan & Steve Schoger"
              link="https://www.refactoringui.com"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <CurrentlyCard
              icon={Headphones}
              label="Ouvindo"
              title="Lo-fi Hip Hop Radio"
              subtitle="Lofi Girl"
              link="https://www.youtube.com/@LofiGirl"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <CurrentlyCard
              icon={Lightbulb}
              label="Estudando"
              title="Three.js + WebGL"
              subtitle="Pra animações 3D em hero sections"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Skills categorizadas */}
      <section className="border-t border-border bg-card/30 py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Skills
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Stack categorizada
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SKILL_CATEGORIES.map((cat, idx) => (
              <ScrollReveal key={cat.label} delay={idx * 0.05}>
                <Card className="h-full">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-xl font-semibold tracking-tight">
                        {cat.label}
                      </h3>
                      <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.techs.map((tech) => {
                        const Icon = TECH_ICONS[tech]
                        return (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm"
                          >
                            <Icon colored className="size-3.5" />
                            {tech}
                          </span>
                        )
                      })}
                      {cat.extras?.map((extra) => (
                        <span
                          key={extra}
                          className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-sm text-muted-foreground"
                        >
                          {extra}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto max-w-4xl px-6 py-24">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
            Trajetória
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Carreira & educação
          </h2>
        </ScrollReveal>

        <ol className="relative mt-12 ml-4 border-l-2 border-border">
          {TIMELINE.map((item, idx) => (
            <ScrollReveal key={`${item.year}-${item.title}`} delay={idx * 0.05}>
              <li className="relative ml-6 pb-10 last:pb-0">
                <span className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-brand ring-4 ring-background">
                  {item.type === "work" ? (
                    <Briefcase className="size-2 text-brand-foreground" />
                  ) : (
                    <GraduationCap className="size-2 text-brand-foreground" />
                  )}
                </span>
                <time className="font-mono text-xs uppercase tracking-widest text-brand">
                  {item.year}
                </time>
                <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.org}</p>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      {/* Soft skills */}
      <section className="border-t border-border bg-card/30 py-24">
        <div className="container mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
              Soft skills
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Como eu trabalho
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFT_SKILLS.map((skill, idx) => {
              const Icon = skill.icon
              return (
                <ScrollReveal key={skill.label} delay={idx * 0.05}>
                  <div className="group h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold">
                      {skill.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {skill.description}
                    </p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA pra contato */}
      <section className="container mx-auto max-w-3xl px-6 py-24 text-center">
        <ScrollReveal>
          <Badge variant="outline" className="mb-6 font-mono text-[0.7rem] uppercase">
            Próximo passo
          </Badge>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Disponível para projetos.{" "}
            <span className="text-gradient-brand">Entre em contato.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <Button size="lg" className="mt-8" render={<a href="/contato" />}>
            Entrar em contato
          </Button>
        </ScrollReveal>
      </section>
    </>
  )
}
