import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { NAV_GROUPS, SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/nav"
import { SpotifyNowPlaying } from "@/components/sections/SpotifyNowPlaying"

/** Logo claro, pro fundo escuro do rodapé. */
const LOGO_CLARO = "/logo-light.png"

/** Colunas de links: os grupos do menu; o link solto ("Início") entra na primeira. */
const COLUNAS = NAV_GROUPS.filter((e) => e.kind === "group")

/**
 * Rodapé escuro atrás do conteúdo: a página (a folha no layout público) tem
 * cantos arredondados embaixo e sombra. A partir de md o rodapé fica preso no
 * fundo da tela e a folha sobe e o revela. No celular ele é mais alto que a
 * tela, e preso o topo dele nunca aparecia: ali ele rola normal, encaixado
 * sob a curva da folha (margem negativa). O nome gigante no pé é decoração.
 *
 * `superficie-painel` reaponta os tokens pra superfície escura.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="superficie-painel relative z-0 -mt-12 overflow-hidden bg-[var(--painel)] pt-12 text-foreground md:sticky md:bottom-0 md:-mt-16 md:pt-16">
      <div className="container relative z-10 mx-auto max-w-6xl px-5 pt-16 pb-8 sm:px-6 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80" aria-label="João Marcos">
              <Image src={LOGO_CLARO} alt="" width={36} height={36} className="size-9" />
              <span className="font-display text-2xl font-semibold tracking-tight">
                joão<span className="text-brand">.</span>marcos
              </span>
            </Link>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              Frontend e UI/UX. Interfaces para sistemas de gestão, sites e apps.
            </p>
            <Link
              href="/contato"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-[var(--painel)] transition-transform active:scale-[0.97]"
            >
              Começar um projeto
              <span className="grid size-6 place-items-center rounded-full bg-[var(--painel)] text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="block text-sm text-muted-foreground transition-colors hover:text-brand">
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {COLUNAS.map((grupo) =>
              grupo.kind === "group" ? (
                <nav key={grupo.label} aria-label={grupo.label}>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {grupo.label}
                  </p>
                  <ul className="grid gap-0.5">
                    {grupo.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="inline-block py-1.5 text-sm text-foreground/85 transition-colors hover:text-brand">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null
            )}
            <div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Redes</p>
              <ul className="grid gap-0.5">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 py-1.5 text-sm text-foreground/85 transition-colors hover:text-brand"
                    >
                      <s.icon className="size-3.5" />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {/* sem Spotify ao vivo o widget some, em vez de inventar faixa */}
          <SpotifyNowPlaying fallbackContent={null} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {year} João Marcos</p>
          <p>Feito com Next.js, Tailwind e Firebase.</p>
        </div>
      </div>

      {/* nome gigante no pé, quase da cor do fundo */}
      <p
        aria-hidden
        className="pointer-events-none -mt-[0.32em] text-center font-display text-[17vw] leading-[0.8] font-bold tracking-[-0.05em] whitespace-nowrap text-foreground/[0.06] select-none"
      >
        joão marcos
      </p>
    </footer>
  )
}
