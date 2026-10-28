import { Abertura } from "@/components/layout/Abertura"
import { SCRIPT_ABERTURA } from "@/components/layout/abertura-script"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LinkPreview } from "@/components/layout/LinkPreview"
import { SocialFloater } from "@/components/sections/SocialFloater"
import { PageTransition } from "@/components/animations/PageTransition"
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider"

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
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_ABERTURA }} />
      <Abertura />
      <Header />
      <SocialFloater />
      <LinkPreview />
      {/* A página é uma folha por cima do rodapé: cantos arredondados embaixo
          e sombra. O rodapé fica preso no fundo (sticky) e aparece por trás
          quando a folha sobe no fim da rolagem. Fundo opaco obrigatório. Sem
          padding embaixo: a borda da folha de conteúdo aparecia como uma linha
          cortando a página antes da curva. `overflow-clip` (não `hidden`)
          recorta na curva sem quebrar os `sticky` lá dentro. */}
      <div className="relative z-10 flex flex-1 flex-col overflow-clip rounded-b-[2rem] bg-background shadow-[0_24px_50px_-10px_oklch(0.2_0.02_330/0.35)] md:rounded-b-[3rem]">
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <Footer />
    </CommandPaletteProvider>
  )
}
