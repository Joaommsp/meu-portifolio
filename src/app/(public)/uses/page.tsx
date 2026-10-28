import type { Metadata } from "next"

import { ScrollReveal } from "@/components/animations"
import { PageHero } from "@/components/sections/PageHero"
import { HeroSobreposto } from "@/components/layout/HeroSobreposto"
import { Bancada } from "@/components/uses/Bancada"
import { CartaoUso } from "@/components/uses/CartaoUso"
import { getUsesCategories } from "@/lib/data/uses"
import type { UsesCategory } from "@/types/uses"

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Hardware, software e ferramentas que João Marcos usa no dia a dia pra construir produtos digitais.",
}

/** A categoria de hardware vira a mesa; as outras ficam em cartões. */
function ehHardware(cat: UsesCategory) {
  return /hardware|setup|mesa/i.test(cat.title)
}

export default async function UsesPage() {
  const categorias = await getUsesCategories()

  const totalItens = categorias.reduce((t, c) => t + c.items.length, 0)

  return (
    <HeroSobreposto
      hero={
        <PageHero
          titulo="Ferramentas"
          descricao={
            <>
              {totalItens > 0 ? `${totalItens} ferramentas` : "Ferramentas"}{" "}
              que uso no dia a dia. Formato{" "}
              <a
                href="https://uses.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand transition-opacity hover:underline hover:opacity-80"
              >
                uses.tech
              </a>
              .
            </>
          }
        />
      }
    >
      {categorias.length > 0 ? (
        <section className="container mx-auto max-w-6xl space-y-16 px-5 py-10 sm:px-6 md:py-16">
          {categorias.map((cat) => (
            <ScrollReveal key={cat.id}>
              <div id={cat.id} className="scroll-mt-28">
                <header className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{cat.title}</h2>
                  {cat.description && !ehHardware(cat) && (
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  )}
                </header>
                {ehHardware(cat) && cat.items.length > 0 ? (
                  <Bancada categoria={cat} />
                ) : cat.items.length > 0 ? (
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {cat.items.map((item) => (
                      <li key={item.name}>
                        <CartaoUso item={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nada nesta categoria ainda.</p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </section>
      ) : (
        <section className="container mx-auto max-w-4xl px-5 py-10 sm:px-6 md:py-16">
          <div className="vidro rounded-(--raio-vidro) px-6 py-16 text-center">
            <p className="text-muted-foreground">Lista vazia por enquanto.</p>
          </div>
        </section>
      )}
    </HeroSobreposto>
  )
}
