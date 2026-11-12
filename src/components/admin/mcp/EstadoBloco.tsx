import { RefreshCw, Search, TriangleAlert, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Estados de um bloco da tela do MCP (tabela ou atividade): esqueleto, erro,
 * vazio e busca sem resultado. Ficam dentro do cartão, sem cobrir a página.
 * O `EstadoListagem` das listagens públicas não serve aqui: carrega com
 * spinner, tem texto fixo e ocupa a área toda da grade.
 */

const LINHAS_DO_ESQUELETO = 3

export function EsqueletoBloco({ rotulo }: { rotulo: string }) {
  return (
    <div className="flex flex-col gap-2.5 py-4" role="status" aria-label={rotulo}>
      {Array.from({ length: LINHAS_DO_ESQUELETO }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

function Caixa({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-3 py-7 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

export function ErroBloco({
  oQue,
  mensagem,
  onTentarDeNovo,
}: {
  /** "as chaves", "a atividade". */
  oQue: string
  /** Mensagem do servidor, como veio. */
  mensagem: string
  onTentarDeNovo: () => void
}) {
  return (
    <Caixa>
      <TriangleAlert className="size-4 text-destructive" aria-hidden />
      <strong className="font-medium text-destructive">Não foi possível carregar {oQue}.</strong>
      <span className="wrap-anywhere" role="alert">
        {mensagem}
      </span>
      <Button type="button" variant="outline" onClick={onTentarDeNovo} className="cursor-pointer">
        <RefreshCw aria-hidden />
        Tentar de novo
      </Button>
    </Caixa>
  )
}

export function VazioBloco({
  icone: Icone,
  titulo,
  acao,
}: {
  icone: LucideIcon
  titulo: string
  acao?: { rotulo: string; onClick: () => void }
}) {
  return (
    <Caixa>
      <Icone className="size-4" aria-hidden />
      <strong className="font-medium text-foreground">{titulo}</strong>
      {acao && (
        <Button type="button" variant="outline" onClick={acao.onClick} className="cursor-pointer">
          {acao.rotulo}
        </Button>
      )}
    </Caixa>
  )
}

export function SemResultadoBloco({ termo, onLimpar }: { termo: string; onLimpar: () => void }) {
  return (
    <Caixa>
      <Search className="size-4" aria-hidden />
      <strong className="font-medium text-foreground">Nada encontrado para &quot;{termo}&quot;</strong>
      <Button type="button" variant="outline" onClick={onLimpar} className="cursor-pointer">
        Limpar busca
      </Button>
    </Caixa>
  )
}
