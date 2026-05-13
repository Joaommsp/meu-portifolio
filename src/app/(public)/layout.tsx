import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { SocialFloater } from "@/components/sections/SocialFloater"
import { PageTransition } from "@/components/animations/PageTransition"
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider"
import { KonamiEasterEgg } from "@/components/misc/KonamiEasterEgg"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CommandPaletteProvider>
      {/* Skip-to-content: visível só com foco do teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-foreground focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <KonamiEasterEgg />
      <Header />
      <SocialFloater />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </CommandPaletteProvider>
  )
}
