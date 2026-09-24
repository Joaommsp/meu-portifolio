import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CONTACT_EMAIL } from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * O par de ações das páginas de serviço, o mesmo no topo e no fim.
 *
 * Existe porque o hero e o CTA final pediam exatamente os mesmos dois botões,
 * e duas cópias divergem: basta alguém trocar o texto de um lado.
 */
export function ContactActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* `h-12` sobre o `size="lg"`: é o mesmo override que o hero da home
          faz. O tamanho padrão do botão é de ação dentro de uma página; aqui
          é a ação PRINCIPAL de uma página de venda. */}
      <Button size="lg" className="h-12" render={<Link href="/contato" />}>
        Começar um projeto
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-12"
        render={<a href={`mailto:${CONTACT_EMAIL}`} />}
      >
        <Mail className="size-4" data-icon="inline-start" />
        Mandar um email
      </Button>
    </div>
  )
}
