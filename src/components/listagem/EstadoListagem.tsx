import type { ReactNode } from "react"
import { Loader2, TriangleAlert, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  icone: LucideIcon
  carregando: boolean
  /** Mensagem da falha, como veio da fonte. */
  erro?: string | null
  /** Se a coleção tem itens antes dos filtros. */
  temConteudo: boolean
  /** Coleção vazia de verdade: ainda não há nada publicado. */
  vazio: { titulo: string; texto: string }
  /** Há conteúdo, mas os filtros não deixaram nada. */
  semResultado: string
  onLimpar: () => void
  onTentarDeNovo?: () => void
}

/**
 * O lugar da grade quando ela não tem o que mostrar.
 *
 * São quatro situações, e cada uma pede uma frase diferente. Antes havia uma
 * só, "ajuste os filtros ou limpe tudo", que aparecia também carregando, com a
 * coleção vazia e com a consulta falhando: o visitante era mandado mexer em
 * filtro que nunca tocou.
 */
export function EstadoListagem({
  icone: Icone,
  carregando,
  erro,
  temConteudo,
  vazio,
  semResultado,
  onLimpar,
  onTentarDeNovo,
}: Props) {
  // O erro vem antes: uma consulta que falhou não está mais carregando.
  if (erro) {
    return (
      <Caixa>
        <Selo>
          <TriangleAlert className="size-5 text-destructive" aria-hidden />
        </Selo>
        <h2 className="font-display text-xl font-semibold">
          Não deu pra carregar agora
        </h2>
        <p className="max-w-md wrap-anywhere text-sm text-muted-foreground" role="alert">
          {erro}
        </p>
        {onTentarDeNovo && (
          <Button variant="outline" onClick={onTentarDeNovo}>
            Tentar de novo
          </Button>
        )}
      </Caixa>
    )
  }

  if (carregando) {
    return (
      <Caixa>
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground" role="status">
          Carregando…
        </p>
      </Caixa>
    )
  }

  if (!temConteudo) {
    return (
      <Caixa>
        <Selo>
          <Icone className="size-5 text-muted-foreground" aria-hidden />
        </Selo>
        <h2 className="font-display text-xl font-semibold">{vazio.titulo}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{vazio.texto}</p>
      </Caixa>
    )
  }

  return (
    <Caixa>
      <Selo>
        <Icone className="size-5 text-muted-foreground" aria-hidden />
      </Selo>
      <h2 className="font-display text-xl font-semibold">{semResultado}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ajuste os filtros ou{" "}
        {/* Padding com margem negativa: 44px de área de toque dentro da frase. */}
        <button
          type="button"
          onClick={onLimpar}
          className="-my-3 py-3 text-brand underline-offset-2 hover:underline"
        >
          limpe tudo
        </button>
        .
      </p>
    </Caixa>
  )
}

function Caixa({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
      {children}
    </div>
  )
}

function Selo({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
      {children}
    </div>
  )
}
