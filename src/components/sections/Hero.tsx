"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ArrowDown, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  GridBackground,
  GradientOrbs,
  NoiseTexture,
  ParticlesBackground,
} from "@/components/backgrounds"
import {
  FadeIn,
  SlideIn,
  TextReveal,
  MagneticButton,
} from "@/components/animations"
import { CONTACT_EMAIL } from "@/lib/nav"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

/**
 * Hero com video scrubbing scroll-driven (estilo iron-man / Apple AirPods)
 *  + overlays atmosféricos do hero original (orbs, particles, grid, noise).
 *
 * Layering (do fundo pra frente):
 *   1. Video (behind everything)
 *   2. Dark overlay + vinheta radial (escurece e foca centro)
 *   3. GradientOrbs + ParticlesBackground (atmosfera sutil)
 *   4. GridBackground + NoiseTexture (textura no topo)
 *   5. Hero content (texto, CTAs)
 *   6. Scroll hint
 *
 * Como o scrub funciona:
 *   - Section tem altura 400vh (3 viewports a mais que tela)
 *   - Inner div é sticky no topo, ocupa 100dvh
 *   - Conforme scroll progride 0 → 1, video.currentTime vai 0 → duration
 *   - Texto + CTAs fadem entre 0 e 15% do scroll
 *   - Lenis providencia smooth scroll (em layout.tsx via SmoothScrollProvider)
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = React.useRef<HTMLElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const heroTextRef = React.useRef<HTMLDivElement>(null)
  const scrollHintRef = React.useRef<HTMLDivElement>(null)

  // Vídeo + scroll-scrubbing só no desktop. No mobile o Hero é uma tela
  // estática (não baixa o mp4, sem listeners de scroll/rAF — poupa bateria).
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    if (!isDesktop) return
    const video: HTMLVideoElement | null = videoRef.current
    if (!video) return
    const v = video // TS narrowing closure-safe

    // Dois progressos:
    //  - progressTarget: o que o scroll está pedindo (atualiza instantâneo)
    //  - progressCurrent: o que estamos exibindo (lerp em direção ao target)
    // O rAF tick roda continuamente a 60fps interpolando, isso elimina o
    // "stutter" entre eventos de scroll discretos e o decode do vídeo.
    let progressTarget = 0
    let progressCurrent = 0
    let rafId = 0
    let lastVideoTimeWritten = -1
    const LERP = 0.12 // 0.06 = bem suave, 0.2 = mais responsivo
    const startTime = performance.now()
    const HINT_ENTRY_DELAY = 2200 // ms — quando o hint começa a aparecer
    const HINT_ENTRY_DURATION = 600 // ms — duração do fade-in
    const HINT_SCROLL_RANGE = 0.18 // fração do progress pro fade-out completar

    function readScrollProgress(): number {
      const section = sectionRef.current
      if (!section) return 0
      const rect = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      if (scrollable <= 0) return 0
      return Math.min(1, Math.max(0, -rect.top / scrollable))
    }

    function tick() {
      // Lerp progressCurrent → progressTarget
      const diff = progressTarget - progressCurrent
      if (Math.abs(diff) < 0.0001) {
        progressCurrent = progressTarget
      } else {
        progressCurrent += diff * LERP
      }

      // Vídeo
      if (v.duration) {
        const target = progressCurrent * v.duration
        // Só re-escreve se mudou >1 frame (~33ms a 30fps)
        if (Math.abs(target - lastVideoTimeWritten) > 0.033) {
          try {
            v.currentTime = target
            lastVideoTimeWritten = target
          } catch {
            /* video carregando */
          }
        }
      }

      // Texto — escala 1 → 0.88, opacity 1 → 0.7 (nunca some)
      if (heroTextRef.current) {
        const scale = 1 - progressCurrent * 0.12
        const opacity = 1 - progressCurrent * 0.3
        heroTextRef.current.style.opacity = String(opacity)
        heroTextRef.current.style.transform = `scale(${scale})`
      }

      // Scroll hint — entrada (delay + fade-in) + saída (smoothstep no scroll)
      // Combina os dois via Math.min: entrada controla até aparecer 100%,
      // depois scroll começa a comer a opacity. Sem conflito entre Motion+JS.
      if (scrollHintRef.current) {
        const elapsed = performance.now() - startTime
        const entryT = Math.max(
          0,
          Math.min(1, (elapsed - HINT_ENTRY_DELAY) / HINT_ENTRY_DURATION)
        )
        const entryEased = entryT * entryT * (3 - 2 * entryT)

        const scrollT = Math.min(1, progressCurrent / HINT_SCROLL_RANGE)
        const scrollEased = scrollT * scrollT * (3 - 2 * scrollT)

        const opacity = Math.min(entryEased, 1 - scrollEased)
        scrollHintRef.current.style.opacity = String(opacity)
      }

      rafId = requestAnimationFrame(tick)
    }

    function onScroll() {
      progressTarget = readScrollProgress()
    }

    function onLoadedMetadata() {
      // Inicializa quando o video carrega
      progressTarget = readScrollProgress()
      progressCurrent = progressTarget
    }

    v.pause()
    v.addEventListener("loadedmetadata", onLoadedMetadata)
    window.addEventListener("scroll", onScroll, { passive: true })
    progressTarget = readScrollProgress()
    progressCurrent = progressTarget
    rafId = requestAnimationFrame(tick)

    return () => {
      v.removeEventListener("loadedmetadata", onLoadedMetadata)
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [isDesktop])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate min-h-[100dvh]"
      style={{ height: isDesktop ? "200vh" : undefined }}
    >
      <div
        className="sticky top-0 flex h-[100dvh] w-full items-end overflow-hidden bg-background"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* 1. Vídeo de fundo (scroll-scrub) — só desktop, z-0 (deep) */}
        {isDesktop && (
          <video
            ref={videoRef}
            src="/hero-video/hero.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 z-0 h-full w-full object-cover"
            style={{
              willChange: "contents",
              transform: "translateZ(0)",
              filter: "brightness(0.55) saturate(0.85)",
            }}
          />
        )}

        {/* 2a. Overlay escuro sólido — sobe contraste */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, oklch(0.13 0.012 260 / 0.92) 0%, oklch(0.13 0.012 260 / 0.5) 45%, oklch(0.13 0.012 260 / 0.6) 100%)",
          }}
        />

        {/* 2b. Vinheta radial (escurece bordas, foca centro) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, oklch(0.13 0.012 260 / 0.5) 70%, oklch(0.10 0.012 260 / 0.85) 100%)",
          }}
        />

        {/* 3. Atmosfera — orbs + particles (z-2) */}
        <div className="pointer-events-none absolute inset-0 z-[2] opacity-50">
          <GradientOrbs />
          <ParticlesBackground count={20} />
        </div>

        {/* 4. Textura — grid + noise (z-3) */}
        <div className="pointer-events-none absolute inset-0 z-[3]">
          <GridBackground opacity={0.04} />
          <NoiseTexture opacity={0.05} />
        </div>

        {/* 5. Conteúdo (texto + CTAs) — z-10 */}
        <div
          ref={heroTextRef}
          className="relative z-10 w-full px-6 pb-20 md:pb-28"
          style={{
            // SEM CSS transition — rAF lerp do tick já cuida da suavidade.
            // Transition aqui CONFLITA com lerp (CSS tenta animar enquanto
            // JS escreve a cada 16ms → stutter "bruto").
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}
        >
          <div className="container mx-auto max-w-5xl">
            <FadeIn delay={0.1}>
              <p className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-brand"
                />
                João Marcos
              </p>
            </FadeIn>

            <h1 className="mb-6 font-display text-4xl font-bold leading-[1] tracking-tight sm:text-6xl sm:leading-[0.95] md:text-8xl lg:text-[7.5rem]">
              <span className="block text-foreground">
                <TextReveal
                  text="Desenvolvedor"
                  by="letter"
                  delay={0.3}
                  staggerDelay={0.04}
                />
              </span>
              <motion.span
                className="mt-2 block text-gradient-brand"
                initial={reduced ? undefined : { opacity: 0, y: 30 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  delay: 1.0,
                  duration: 0.7,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                <TextReveal
                  text="Frontend & UI/UX"
                  by="word"
                  delay={1.05}
                  staggerDelay={0.08}
                />
              </motion.span>
            </h1>

            <SlideIn direction="up" delay={1.55} duration={0.7}>
              <p className="mb-3 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
                Construo interfaces em{" "}
                <span className="text-foreground">React</span>,{" "}
                <span className="text-foreground">Next.js</span> e{" "}
                <span className="text-foreground">TypeScript</span>. Trabalho
                na construção de interfaces UI/UX interativas, combinando o
                visual agradável com o funcional.
              </p>
            </SlideIn>

            <SlideIn direction="up" delay={1.7}>
              <p className="mb-10 max-w-xl text-base text-muted-foreground/80">
                Bacharel em Sistemas de Informação pela UNIRIOS (2025).
                Paulo Afonso, BA.
              </p>
            </SlideIn>

            <SlideIn direction="up" delay={1.85}>
              <div className="flex flex-wrap gap-3">
                <MagneticButton strength={0.3}>
                  <Button size="lg" render={<Link href="/projetos" />}>
                    Ver projetos
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                </MagneticButton>
                <MagneticButton strength={0.3}>
                  <Button
                    size="lg"
                    variant="outline"
                    render={<a href={`mailto:${CONTACT_EMAIL}`} />}
                  >
                    <Mail className="size-4" data-icon="inline-start" />
                    Entrar em contato
                  </Button>
                </MagneticButton>
              </div>
            </SlideIn>
          </div>
        </div>

        {/* 6. Scroll hint — z-10 (opacity controlada 100% via JS no rAF tick) */}
        <div
          ref={scrollHintRef}
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
          style={{ opacity: 0 }}
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">
            Role
          </span>
          <ArrowDown className="size-4 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
