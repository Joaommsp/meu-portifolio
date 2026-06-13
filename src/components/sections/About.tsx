"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import {
  ArrowRight,
  MapPin,
  GraduationCap,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"
import { DataStoryChart } from "@/components/charts/DataStoryChart"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────── */
/* Slides                                                       */
/* ─────────────────────────────────────────────────────────── */

const SLIDE_TITLES = [
  "Um pouco sobre mim",
  "Como eu uso a IA",
  "Como busco me diferenciar",
  "Storytelling de dados",
] as const

const SLIDE_EYEBROWS = [
  "Quem sou",
  "No fluxo de trabalho",
  "Na era da IA",
  "Narrativa com dados",
] as const

const SLIDE_COUNT = SLIDE_TITLES.length

/** IAs que uso no dia-a-dia — SVGs em /public/icons. */
const AI_TOOLS = [
  { name: "Claude", src: "/icons/claude-ai-icon.svg" },
  { name: "Claude Code", src: "/icons/claudecode-color.svg" },
  { name: "ChatGPT", src: "/icons/chatgpt-icon.svg" },
  { name: "Gemini", src: "/icons/google-gemini-icon.svg" },
] as const

/** Moldura quadrada com glow brand — compartilhada pelos slides.
 *  `overlay` renderiza FORA do clip da moldura (ex.: badge que vaza embaixo). */
function VisualFrame({
  children,
  overlay,
}: {
  children: React.ReactNode
  overlay?: React.ReactNode
}) {
  return (
    <div className="relative mx-auto w-64 md:mx-0">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-2xl opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
        }}
      />
      <div className="relative aspect-square w-64 overflow-hidden rounded-xl border-2 border-brand/30 bg-card">
        {children}
      </div>
      {overlay}
    </div>
  )
}

/** Painel de ícone p/ slides sem foto — ícone grande + índice mono. */
function IconPanel({
  icon: Icon,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>
  index: string
}) {
  return (
    <div className="relative flex size-full items-center justify-center">
      {/* textura grid sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* glow radial interno */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, var(--brand-glow) 0%, transparent 65%)",
          opacity: 0.35,
        }}
      />
      <Icon className="relative size-20 text-brand" />
      <span className="absolute bottom-4 right-4 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        {index}
      </span>
    </div>
  )
}

/** Grade 2x2 com os logos das IAs — visual do slide "Como eu uso a IA". */
function AILogosPanel() {
  return (
    <div className="relative flex size-full items-center justify-center">
      {/* glow radial interno */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, var(--brand-glow) 0%, transparent 65%)",
          opacity: 0.3,
        }}
      />
      <div className="relative grid size-full grid-cols-2 gap-3 p-5">
        {AI_TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-brand/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.src}
              alt={tool.name}
              width={36}
              height={36}
              className="size-9"
            />
            <span className="text-center font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
      <span className="absolute bottom-4 right-4 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        02
      </span>
    </div>
  )
}

function TechPills({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

/* ── Conteúdo de cada slide ─────────────────────────────────── */

function SlideSobre() {
  return (
    <div className="grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
      <VisualFrame
        overlay={
          <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest">
            <span className="inline-block size-1.5 rounded-full bg-success" />
            <span className="ml-1.5">disponível pra projetos</span>
          </div>
        }
      >
        <Image
          src="https://github.com/Joaommsp.png"
          alt="João Marcos"
          width={256}
          height={256}
          className="size-full object-cover"
          priority
        />
      </VisualFrame>

      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-muted-foreground">
          <span className="text-foreground">Desenvolvedor frontend</span> e{" "}
          <span className="text-foreground">designer UI/UX</span>. Crio{" "}
          <span className="text-foreground">
            interfaces criativas, modernas e funcionais
          </span>{" "}
          em React, Next.js e TypeScript — pensadas pra atender públicos e
          clientes específicos, não soluções genéricas.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Meu foco está na experiência: que a interface seja bonita, fácil de
          usar e resolva de verdade o problema de quem está do outro lado da
          tela.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <MapPin className="size-3" />
            Paulo Afonso, BA
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <GraduationCap className="size-3" />
            UNIRIOS · Sist. de Informação
          </Badge>
        </div>
        <Button variant="outline" className="mt-4" render={<Link href="/sobre" />}>
          Ler mais sobre mim
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

function SlideIA() {
  return (
    <div className="grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
      <VisualFrame>
        <AILogosPanel />
      </VisualFrame>

      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-muted-foreground">
          A IA virou parte do meu fluxo de trabalho — não um atalho pra pular
          etapas. Construo{" "}
          <span className="text-foreground">ecossistemas próprios</span> pra
          desenvolver e revisar com rapidez: crio skills sob medida, combino com
          boas skills da comunidade e automatizo o repetitivo (scaffolding,
          refactor, revisão).
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground">
          O ponto é fazer isso{" "}
          <span className="text-foreground">
            sem perder qualidade nem deixar o produto genérico
          </span>
          . Trato o que a IA gera como rascunho, nunca como verdade pronta —
          reviso, testo e adapto cada saída ao padrão do projeto. Continuo
          responsável por cada linha que vai pra produção.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground">
          No fim, a ferramenta virou commodity. O que separa hoje é a{" "}
          <span className="text-foreground">
            criatividade e a gestão de ideias
          </span>{" "}
          — saber o que pedir, o que descartar e como direcionar a IA pra
          construir algo com identidade, não mais do mesmo.
        </p>
        <TechPills
          items={["Skills próprias", "Ecossistemas", "Code review", "Criatividade + gestão"]}
        />
      </div>
    </div>
  )
}

function SlideDiferencial() {
  return (
    <div className="grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
      <VisualFrame>
        <IconPanel icon={Target} index="03" />
      </VisualFrame>

      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Me diferencio{" "}
          <span className="text-foreground">alimentando a criatividade</span>{" "}
          todo dia e buscando expressar minhas ideias pro time. Com a IA,
          transformo um esboço em wireframe ou protótipo rápido — uma ideia
          deixa de ser só conversa e vira algo concreto pra apresentar e
          discutir.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Procuro me manter sempre ativo, resolvendo problemas de verdade, e
          aprofundar no que{" "}
          <span className="text-foreground">não é commodity</span>: nuvem,
          deploy, segurança e design com identidade — não o genérico que
          qualquer ferramenta entrega.
        </p>
        <TechPills
          items={["Criatividade", "Wireframe & protótipo", "Cloud / deploy / segurança", "Design com identidade"]}
        />
      </div>
    </div>
  )
}

function SlideStorytelling() {
  return (
    <div className="grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
      <VisualFrame>
        <IconPanel icon={TrendingUp} index="04" />
      </VisualFrame>

      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-muted-foreground">
          <span className="text-foreground">Storytelling de dados</span> é o que
          mais venho explorando: transformar números numa narrativa visual que
          qualquer pessoa entende e usa pra decidir. Aprimoro isso todo dia,
          inclusive lendo sobre o assunto. Um gráfico não é enfeite, é argumento
          — troque o tipo de visualização e veja:
        </p>
        <DataStoryChart />
      </div>
    </div>
  )
}

const SLIDES = [
  SlideSobre,
  SlideIA,
  SlideDiferencial,
  SlideStorytelling,
] as const

/* ─────────────────────────────────────────────────────────── */
/* Carousel                                                     */
/* ─────────────────────────────────────────────────────────── */

const SWIPE_THRESHOLD = 70

export function About() {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const paginate = React.useCallback((dir: number) => {
    setDirection(dir)
    setIndex((prev) => (prev + dir + SLIDE_COUNT) % SLIDE_COUNT)
  }, [])

  const goTo = React.useCallback(
    (target: number) => {
      setIndex((prev) => {
        if (target === prev) return prev
        setDirection(target > prev ? 1 : -1)
        return target
      })
    },
    []
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      paginate(-1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      paginate(1)
    }
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) paginate(1)
    else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1)
  }

  const ActiveSlide = SLIDES[index]!

  const variants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
        center: { opacity: 1, x: 0 },
        exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56 }),
      }

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

      {/* Título + eyebrow do slide ativo (anima junto) */}
      <div className="mt-3 min-h-[3.5rem] md:min-h-[4rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`head-${index}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              {SLIDE_EYEBROWS[index]}
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              {SLIDE_TITLES[index]}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trilho do carousel */}
      <div
        role="group"
        aria-roledescription="carrossel"
        aria-label="Sobre João Marcos"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative mt-10 min-h-[520px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:min-h-[440px]"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={reduced ? undefined : handleDragEnd}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${SLIDE_COUNT}: ${SLIDE_TITLES[index]}`}
            className={cn(!reduced && "cursor-grab active:cursor-grabbing")}
          >
            <ActiveSlide />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles: dots + setas */}
      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5" role="tablist" aria-label="Selecionar slide">
          {SLIDE_TITLES.map((title, i) => (
            <button
              key={title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir para: ${title}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-brand"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          ))}
          <span className="ml-3 font-mono text-xs tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(SLIDE_COUNT).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Slide anterior"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Próximo slide"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand/60 hover:text-brand"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
