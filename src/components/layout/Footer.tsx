import Link from "next/link"
import Image from "next/image"
import { NAV_ITEMS, SOCIAL_LINKS, CONTACT_EMAIL, LOGO_SRC } from "@/lib/nav"
import { SpotifyNowPlaying } from "@/components/sections/SpotifyNowPlaying"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-32 border-t border-border">
      <div className="container mx-auto max-w-6xl px-5 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 mb-10">
          {/* Brand + tagline */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label="João Marcos"
            >
              <Image
                src={LOGO_SRC}
                alt="João Marcos"
                width={32}
                height={32}
                className="size-8"
              />
              <span className="font-display text-base font-semibold tracking-tight">
                joão<span className="text-brand">.</span>marcos
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Frontend dev & designer. React, Next.js e atenção ao detalhe.
              De Paulo Afonso, BA.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block text-sm text-muted-foreground transition-colors hover:text-brand"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Nav */}
          {/* O espaço entre links vem do `py-2` de cada um, não do `gap`: assim
              ele vira área de toque em vez de vão morto entre alvos de 20px.
              Duas colunas abaixo de md: numa só, os 15 links davam ~570px. */}
          <nav aria-label="Rodapé">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Navegação
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 md:grid-cols-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit py-2 text-sm text-foreground/80 transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Socials */}
          <div className="flex flex-col gap-0.5">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Conecte-se
            </p>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-fit items-center gap-2.5 py-2 text-sm text-foreground/80 transition-colors hover:text-brand"
              >
                <s.icon className="size-3.5" />
                <span>{s.handle}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Spotify widget */}
        <div className="mb-6">
          {/* fallbackContent={null}: sem Spotify ao vivo o widget some, em vez
              de anunciar uma faixa fictícia como se estivesse tocando. */}
          <SpotifyNowPlaying fallbackContent={null} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} João Marcos · Paulo Afonso, BA
          </p>
          <p>
            Construído com Next.js, Tailwind CSS, Firebase e{" "}
            <span className="text-brand">muito café</span> ☕
          </p>
        </div>
      </div>
    </footer>
  )
}
