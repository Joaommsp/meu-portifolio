import { NOMES_DE_RECURSO } from "@/lib/conteudo/tipos"
import { DURACAO_DO_UNICO_HORAS, emMegabytes, MAX_BYTES_DA_IMAGEM } from "@/lib/mcp/limites"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { CaixaDeCopia } from "./CaixaDeCopia"
import { ErroBloco } from "./EstadoBloco"
import type { Bloco } from "./useAcessosMcp"

const CAPACIDADES = [
  {
    quem: "Chave pessoal",
    oQue: `Listar, ler, criar, editar e apagar nos ${NOMES_DE_RECURSO.length} recursos; subir imagem`,
  },
  {
    quem: "Uso único",
    oQue: `Só o recurso e as ações marcadas, nunca apagar; ${DURACAO_DO_UNICO_HORAS} h`,
  },
  {
    quem: "Imagens",
    oQue: `Por URL, ou arquivo até ${emMegabytes(MAX_BYTES_DA_IMAGEM)}`,
  },
] as const

type Props = {
  /** Endereço resolvido pelo servidor, junto com a lista de acessos. */
  endereco: Bloco<string>
  onTentarDeNovo: () => void
}

/** Endereço do MCP e o que cada tipo de acesso pode fazer. */
export function ContextoMcp({ endereco, onTentarDeNovo }: Props) {
  let conteudo: React.ReactNode
  if (endereco.carregando) {
    conteudo = <Skeleton className="h-9 w-full" />
  } else if (endereco.erro !== null) {
    conteudo = (
      <ErroBloco oQue="o endereço" mensagem={endereco.erro} onTentarDeNovo={onTentarDeNovo} />
    )
  } else {
    conteudo = <CaixaDeCopia texto={endereco.dados} rotulo="Copiar endereço do MCP" />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Endereço do MCP</CardTitle>
        </CardHeader>
        <CardContent>{conteudo}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>O que a LLM pode fazer</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-2 text-sm">
            {CAPACIDADES.map(({ quem, oQue }) => (
              <div key={quem} className="grid grid-cols-[6rem_1fr] gap-2">
                <dt className="text-muted-foreground">{quem}</dt>
                <dd>{oQue}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  )
}
