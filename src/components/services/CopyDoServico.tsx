import Link from "next/link"

import { FadeIn, SlideIn } from "@/components/animations"
import { ContactActions } from "@/components/services/ContactActions"
import { ROTA_SERVICOS } from "@/lib/rotas"
import type { Servico } from "@/lib/servicos-content"
import { DISPONIBILIDADE } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * A copy do topo da página de serviço: trilha, título, resumo, as duas ações
 * e a disponibilidade.
 *
 * Mora fora do ServiceHero porque aparece em dois lugares: por cima do fundo
 * animado (ServiceHero) e, no serviço com vídeo de palco, como a primeira
 * faixa da folha que sobe por cima do vídeo.
 */
export function CopyDoServico({
  servico,
  className,
}: {
  servico: Servico
  className?: string
}) {
  return (
    <div
      className={cn(
        "container relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-6",
        className
      )}
    >
      <FadeIn>
        <nav
          aria-label="Trilha"
          className="flex items-center justify-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.3em]"
        >
          {/* Padding com margem negativa: a área de toque sobe pra 44px sem
              mexer na linha. */}
          <Link
            href={ROTA_SERVICOS}
            className="-my-3.5 py-3.5 text-muted-foreground hover:text-brand"
          >
            Serviços
          </Link>
          <span aria-hidden className="text-muted-foreground">
            /
          </span>
          <span className="text-brand">{servico.rotulo}</span>
        </nav>
      </FadeIn>

      <SlideIn direction="up" delay={0.1}>
        {/* 2.5rem no celular: a 3rem o destaque partia ("antes / do código"). */}
        <h1 className="mt-7 font-display text-[2.5rem] font-bold leading-[0.98] tracking-[-0.04em] text-balance sm:text-5xl md:text-7xl">
          {servico.titulo.antes}{" "}
          <span className="text-gradient-brand">{servico.titulo.destaque}</span>
          {servico.titulo.depois ? ` ${servico.titulo.depois}` : null}
        </h1>
      </SlideIn>

      <SlideIn direction="up" delay={0.18}>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {servico.resumo}
        </p>
      </SlideIn>

      {/* `w-full` no celular: a coluna centrada encolheria o wrapper até a
          largura do maior botão, e os botões não chegariam à largura total. */}
      <SlideIn direction="up" delay={0.26} className="w-full sm:w-auto">
        <ContactActions className="mt-10 justify-center" />
      </SlideIn>

      <SlideIn direction="up" delay={0.34}>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <li>{DISPONIBILIDADE.resposta}</li>
          <li>{DISPONIBILIDADE.base}</li>
        </ul>
      </SlideIn>
    </div>
  )
}
