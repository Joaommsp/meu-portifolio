import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations"
import { WindowFrame } from "@/components/misc/WindowFrame"
import { CONTACT_EMAIL } from "@/lib/nav"
import { CABECALHO_SECAO_HOME, SECAO_HOME, TITULO_SECAO_HOME } from "@/components/sections/secao"
import { cn } from "@/lib/utils"

/** Contato da home, dentro da mesma janela de sistema do hero. */
export function ContactCTA() {
  return (
    <section id="contact-cta" className={cn(SECAO_HOME, "max-w-3xl scroll-mt-20 text-center")}>
      <ScrollReveal>
        <WindowFrame secao="contato" className="superficie-painel text-foreground">
          <div className="px-6 py-12 md:px-12 md:py-16">
            <h2 className={TITULO_SECAO_HOME}>Contato</h2>

            <p className={cn(CABECALHO_SECAO_HOME, "mt-4 text-lg text-muted-foreground")}>
              Aberto a projetos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="min-w-0 max-w-full"
                render={<a href={`mailto:${CONTACT_EMAIL}`} />}
              >
                <Mail className="size-4" data-icon="inline-start" />
                <span className="truncate">{CONTACT_EMAIL}</span>
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/contato" />}>
                Formulário
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </WindowFrame>
      </ScrollReveal>
    </section>
  )
}
