import { Plug } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RegistroVisto } from "@/lib/mcp/tipos"

import { EsqueletoBloco, ErroBloco, VazioBloco } from "./EstadoBloco"
import { formatarQuando, ROTULO_DA_ACAO_AUDITADA, ROTULO_DO_RECURSO } from "./formatos"
import type { Bloco } from "./useAcessosMcp"

type Props = {
  bloco: Bloco<readonly RegistroVisto[]>
  onTentarDeNovo: () => void
}

/** As últimas ações da auditoria: ação · recurso · item, prefixo e quando. */
export function AtividadeRecente({ bloco, onTentarDeNovo }: Props) {
  let corpo: React.ReactNode
  if (bloco.erro) {
    corpo = <ErroBloco oQue="a atividade" mensagem={bloco.erro} onTentarDeNovo={onTentarDeNovo} />
  } else if (bloco.carregando) {
    corpo = <EsqueletoBloco rotulo="Carregando a atividade" />
  } else if (bloco.dados.length === 0) {
    corpo = <VazioBloco icone={Plug} titulo="Nenhuma ação ainda" />
  } else {
    corpo = (
      <ul className="flex flex-col">
        {bloco.dados.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0.5 border-t border-border py-2 text-sm first:border-t-0"
          >
            <span className="min-w-0 wrap-anywhere">
              {ROTULO_DA_ACAO_AUDITADA[r.acao]}
              {r.recurso && ` · ${ROTULO_DO_RECURSO[r.recurso]}`}
              {r.itemId && <span className="text-muted-foreground"> · {r.itemId}</span>}
            </span>
            <time
              dateTime={r.em}
              className="row-span-2 self-center text-xs text-muted-foreground tabular-nums"
            >
              {formatarQuando(r.em)}
            </time>
            <span className="font-mono text-xs text-muted-foreground">{r.prefixo}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card data-testid="atividade-recente">
      <CardHeader>
        <CardTitle className="text-base">Atividade recente</CardTitle>
      </CardHeader>
      <CardContent>{corpo}</CardContent>
    </Card>
  )
}
