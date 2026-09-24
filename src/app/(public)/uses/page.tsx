import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animations"
import { PageHero } from "@/components/sections/PageHero"
import { getUsesCategories } from "@/lib/data/uses"
import type { UsesItem } from "@/types/uses"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Hardware, software e ferramentas que João Marcos usa no dia-a-dia pra construir produtos digitais.",
}

function ItemCard({ item }: { item: UsesItem }) {
  // Item sem link não vira âncora — um <a href=""> recarrega a própria página.
  const temLink = item.url.trim() !== "" && item.url.trim() !== "#"
  const externo = temLink && /^https?:/i.test(item.url)

  const conteudo = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "font-display text-base font-semibold tracking-tight transition-colors",
              temLink && "group-hover:text-brand"
            )}
          >
            {item.name}
          </h3>
          {item.starred && (
            <Badge
              variant="outline"
              className="h-4 border-brand/40 bg-brand/10 px-1.5 font-mono text-[0.6rem] uppercase text-brand"
            >
              fav
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
      {temLink && (
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  )

  const classes = cn(
    "group flex h-full items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
    item.starred
      ? "border-brand/40 hover:border-brand"
      : "border-border hover:border-brand/40"
  )

  if (!temLink) return <div className={classes}>{conteudo}</div>

  return (
    <a
      href={item.url}
      {...(externo
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(classes, "cursor-pointer")}
    >
      {conteudo}
    </a>
  )
}

export default async function UsesPage() {
  const categorias = await getUsesCategories()

  const totalItens = categorias.reduce((t, c) => t + c.items.length, 0)

  return (
    <>
      {/* Hero */}
      <PageHero
        rotulo="Uses"
        janela="uses"
        titulo={
          <>
            Hardware, software e{" "}
            <span className="text-gradient-brand-claro">trampo diário</span>
          </>
        }
        descricao={
          <>
            {totalItens > 0 ? `As ${totalItens} ferramentas` : "As ferramentas"}{" "}
            que uso no dia-a-dia pra construir produtos digitais. Atualizada
            quando algo muda. Inspirado por{" "}
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

      {/* Categorias */}
      {categorias.length > 0 ? (
        <section className="container mx-auto max-w-5xl space-y-16 px-5 py-16 sm:px-6">
          {categorias.map((cat, idx) => (
            <ScrollReveal key={cat.id} delay={Math.min(idx, 6) * 0.05}>
              <div>
                <header className="mb-8">
                  <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                    {cat.title}
                  </h2>
                  {cat.description && (
                    <p className="mt-2 text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                </header>

                {cat.items.length > 0 && (
                  <ul className="grid gap-3 md:grid-cols-2">
                    {cat.items.map((item) => (
                      <li key={item.name}>
                        <ItemCard item={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollReveal>
          ))}
        </section>
      ) : (
        <section className="container mx-auto max-w-4xl px-5 py-16 sm:px-6">
          <ScrollReveal>
            <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
              <p className="text-muted-foreground">
                Ainda montando esta lista. Volte em breve.
              </p>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Nota de rodapé */}
      <section className="container mx-auto max-w-4xl px-5 pb-20 sm:px-6">
        <ScrollReveal>
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Sentindo falta de algo?
            </p>
            <p className="mt-2">
              Manda no{" "}
              <a
                href="/contato"
                className="text-brand underline-offset-2 hover:underline"
              >
                contato
              </a>
              . Sempre interessado em ferramentas que outras pessoas amam.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
