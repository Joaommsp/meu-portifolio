import Link from "next/link"
import { NAV_ITEMS, SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/nav"
import { SpotifyNowPlaying } from "@/components/sections/SpotifyNowPlaying"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-32 border-t border-border">
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 mb-10">
          {/* Brand + tagline */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block font-display text-lg font-semibold tracking-tight"
            >
              joão<span className="text-brand">.</span>marcos
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Frontend developer & UI/UX designer construindo interfaces
              modernas e experiências memoráveis.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block text-sm text-muted-foreground transition-colors hover:text-brand"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-2.5" aria-label="Rodapé">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Navegação
            </p>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-sm text-foreground/80 transition-colors hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/uses"
              className="w-fit text-sm text-foreground/80 transition-colors hover:text-brand"
            >
              Uses
            </Link>
          </nav>

          {/* Socials */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Conecte-se
            </p>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-fit items-center gap-2.5 text-sm text-foreground/80 transition-colors hover:text-brand"
              >
                <s.icon className="size-3.5" />
                <span>{s.handle}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Spotify widget */}
        <div className="mb-6">
          <SpotifyNowPlaying />
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
