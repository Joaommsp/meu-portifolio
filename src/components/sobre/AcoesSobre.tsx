import Image from "next/image"
import Link from "next/link"
import { Download, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Lado direito do hero do /sobre: a foto do GitHub e as duas ações, CV e
 * conversar. No celular fica abaixo do título.
 */
export function AcoesSobre() {
  return (
    <div className="flex items-center gap-4 md:flex-col md:items-end">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-3 border-card shadow-[0_8px_24px_-10px_var(--shadow-elevated)] md:size-24">
        <Image
          src="https://github.com/Joaommsp.png"
          alt="Foto de João Marcos"
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
      </span>
      <div className="flex flex-wrap gap-2.5">
        <Button
          size="lg"
          className="h-11"
          render={<a href="/cv-joaomarcos.pdf" target="_blank" rel="noopener noreferrer" />}
        >
          <Download className="size-4" data-icon="inline-start" />
          Baixar CV
        </Button>
        <Button size="lg" variant="outline" className="h-11" render={<Link href="/contato" />}>
          <Mail className="size-4" data-icon="inline-start" />
          Conversar
        </Button>
      </div>
    </div>
  )
}
