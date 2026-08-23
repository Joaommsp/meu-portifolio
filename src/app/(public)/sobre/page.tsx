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
import { ScrollReveal, FadeIn, SlideIn } from "@/components/animations"
import { Education } from "@/components/sections/Education"
import { SkillGroups } from "@/components/sections/SkillGroups"
import { getCurrently } from "@/lib/data/currently"
import { cn } from "@/lib/utils"
import {
  CURRENTLY_SLOTS,
  CURRENTLY_LABELS,
  CURRENTLY_EMPTY_TEXT,
} from "@/types/currently"
import { GridBackground, GradientOrbs, NoiseTexture } from "@/components/backgrounds"

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça João Marcos — desenvolvedor frontend e designer UI/UX em Paulo Afonso, BA. Trajetória, skills, soft skills e CV.",
}

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
    title: "Desenvolvedor Frontend & UI/UX Designer",
    org: "GFI · Consultoria Especializada",
    description:
      "No principal produto da empresa — plataforma de gestão financeira — atuo só no frontend: projeto a UX/UI e construo a interface em React, Next.js e React Native, com foco em data storytelling — KPIs, dashboards e relatórios. Nos projetos que toco sozinho, sou full stack: vou do backend em Node.js e NestJS até a camada visual.",
    type: "work",
  },
  {
    year: "2024 — 2025",
    title: "Estagiário em Tecnologia da Informação",
    org: "Laboratório Estrela",
    description:
      "Responsável pela infraestrutura e pelos equipamentos de TI das unidades em Paulo Afonso e Alagoas — manutenção, ações preventivas e melhorias. Também administrava o sistema Pixeon SMART: gestão de usuários, controle de acesso, cadastro de exames e resolução de erros no sistema e no banco de dados. Foi onde aprendi servidores, redes e o lado de infra que sustenta o software.",
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

/** Ícone de cada categoria — fixo, porque a categoria também é. */
const CURRENTLY_ICONS = {
  lendo: BookOpen,
  ouvindo: Headphones,
  estudando: Lightbulb,
} as const

function CurrentlyCard({
  icon: Icon,
  label,
  title,
  subtitle,
  link,
  vazio = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  title: string
  subtitle: string
  link?: string
  /** Sem conteúdo: o card declara o vazio, em vez de sumir ou mentir. */
  vazio?: boolean
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
      <p
        className={cn(
          "mt-3 font-display text-base leading-tight tracking-tight",
          vazio
            ? "font-normal text-muted-foreground/70"
            : "font-semibold"
        )}
      >
        {title}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      {link && (
        <ExternalLink className="absolute right-4 top-4 size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  )
  const baseClass = cn(
    "group relative block h-full rounded-xl border border-border bg-card p-5 transition-colors",
    !vazio && "hover:border-brand/40",
    vazio && "border-dashed"
  )
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

export default async function SobrePage() {
  const currently = await getCurrently()
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

        <div className="container relative mx-auto max-w-4xl px-5 sm:px-6 py-24 md:py-32">
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
      <section className="container mx-auto max-w-4xl px-5 sm:px-6 py-24">
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
                Sou{" "}
                <span className="text-foreground">
                  Desenvolvedor Front-End e UI/UX Designer
                </span>
                . Trabalho na construção de sistemas e aplicativos de gestão —
                principalmente financeira e organizacional — onde a interface
                precisa dar conta de muito dado sem virar ruído.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.05}>
              <p>
                No principal produto da empresa atuo{" "}
                <span className="text-foreground">só no frontend</span>: projeto
                a experiência e construo a interface em{" "}
                <span className="text-foreground">
                  React, Next.js e React Native
                </span>
                . É onde aplico{" "}
                <span className="text-foreground">data storytelling</span> —
                transformar KPIs, dashboards e relatórios em algo que a pessoa
                usa para decidir, não apenas para consultar.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <p>
                Nos projetos que desenvolvo sozinho, sou{" "}
                <span className="text-foreground">full stack</span>: vou do
                backend em <span className="text-foreground">Node.js e NestJS</span>,
                passando pela modelagem do banco, até a camada visual.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <p>
                Meu objetivo é{" "}
                <span className="text-foreground">
                  entregar valor real ao cliente
                </span>{" "}
                por meio de interfaces bem projetadas, intuitivas e alinhadas a
                um propósito — principalmente na melhoria e otimização de
                análises e processos.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Atualmente — conteúdo vem do Firestore, editável no /admin.
          Categoria sem conteúdo declara "nada no momento": a grade fica
          completa sem inventar informação. */}
      <section className="container mx-auto max-w-4xl px-5 sm:px-6 pb-12">
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
          {CURRENTLY_SLOTS.map((slot, idx) => {
            const item = currently[slot]
            const preenchido = item.visible && item.title.trim().length > 0
            return (
              <ScrollReveal key={slot} delay={0.1 + idx * 0.05}>
                <CurrentlyCard
                  icon={CURRENTLY_ICONS[slot]}
                  label={CURRENTLY_LABELS[slot]}
                  title={preenchido ? item.title : CURRENTLY_EMPTY_TEXT}
                  subtitle={preenchido ? item.subtitle : ""}
                  link={preenchido ? item.link || undefined : undefined}
                  vazio={!preenchido}
                />
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* Skills — trilhos por categoria */}
      <section className="border-t border-border bg-card/30 py-24">
        <SkillGroups />
      </section>

      {/* Timeline */}
      <section className="container mx-auto max-w-4xl px-5 sm:px-6 py-24">
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

      {/* Formação — diploma + trilha de certificações */}
      <Education />

      {/* Soft skills */}
      <section className="border-t border-border bg-card/30 py-24">
        <div className="container mx-auto max-w-5xl px-5 sm:px-6">
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
      <section className="container mx-auto max-w-3xl px-5 sm:px-6 py-24 text-center">
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
