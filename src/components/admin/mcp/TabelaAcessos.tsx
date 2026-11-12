"use client"

import * as React from "react"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  KeyRound,
  Timer,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { CampoBusca } from "@/components/listagem/CampoBusca"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AcessoVisto, TipoAcesso } from "@/lib/mcp/tipos"
import { cn } from "@/lib/utils"

import { ConfirmarAcao, type Confirmacao } from "./ConfirmarAcao"
import { EsqueletoBloco, ErroBloco, SemResultadoBloco, VazioBloco } from "./EstadoBloco"
import { mensagemDoErro } from "./erros"
import {
  formatarData,
  formatarDataHora,
  formatarQuando,
  ROTULO_DA_SITUACAO,
  ROTULO_DO_RECURSO,
  rotuloDasAcoes,
  TOM_DA_SITUACAO,
} from "./formatos"
import type { Bloco } from "./useAcessosMcp"

export const ITENS_POR_PAGINA_DA_TABELA = 10

export type AcaoDaLinha = "revogar" | "encerrar" | "apagar"

type Props = {
  tipo: TipoAcesso
  bloco: Bloco<readonly AcessoVisto[]>
  onTentarDeNovo: () => void
  /** Leva ao formulário de criação (estado vazio). */
  onCriar: () => void
  /** Chama a API; o erro (com a mensagem do servidor) vira toast. */
  onAcao: (acao: AcaoDaLinha, acesso: AcessoVisto) => Promise<unknown>
}

const TEXTOS = {
  pessoal: {
    titulo: "Chaves pessoais",
    busca: "Buscar por nome ou prefixo",
    oQue: "as chaves",
    vazio: "Nenhuma chave criada",
    criar: "Gerar chave",
    icone: KeyRound,
    colunas: ["Nome", "Prefixo", "Criada em", "Vence em", "Último uso", "Situação"],
  },
  unico: {
    titulo: "Acessos únicos",
    busca: "Buscar por tarefa",
    oQue: "os acessos únicos",
    vazio: "Nenhum acesso único criado",
    criar: "Criar acesso único",
    icone: Timer,
    colunas: ["Tarefa", "Recurso", "Ações", "Criado em", "Vence em", "Último uso", "Situação"],
  },
} as const

const SUCESSO: Record<AcaoDaLinha, string> = {
  revogar: "Chave revogada",
  encerrar: "Acesso encerrado",
  apagar: "Acesso apagado",
}

function confirmacaoDe(acao: AcaoDaLinha, acesso: AcessoVisto): Confirmacao {
  switch (acao) {
    case "revogar":
      return {
        titulo: `Revogar a chave "${acesso.nome ?? acesso.prefixo}"?`,
        descricao: "A LLM conectada com ela perde o acesso na próxima chamada.",
        rotulo: "Revogar",
      }
    case "encerrar":
      return {
        titulo: "Encerrar o acesso único?",
        descricao: `A tarefa "${acesso.tarefa ?? acesso.prefixo}" para na próxima chamada.`,
        rotulo: "Encerrar",
      }
    case "apagar":
      return {
        titulo: "Apagar o acesso?",
        descricao: "Sai da lista. A atividade dele continua registrada.",
        rotulo: "Apagar",
        icone: Trash2,
      }
  }
}

function casaComBusca(acesso: AcessoVisto, termo: string): boolean {
  const alvo = [acesso.nome, acesso.tarefa, acesso.prefixo]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR")
  return alvo.includes(termo)
}

/** Chaves pessoais ou acessos únicos: busca, situação, ações e paginação. */
export function TabelaAcessos({ tipo, bloco, onTentarDeNovo, onCriar, onAcao }: Props) {
  const textos = TEXTOS[tipo]
  const [busca, setBusca] = React.useState("")
  const [pagina, setPagina] = React.useState(0)
  const [pendente, setPendente] = React.useState<{
    acao: AcaoDaLinha
    acesso: AcessoVisto
  } | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  const termo = busca.trim().toLocaleLowerCase("pt-BR")
  const filtrados = React.useMemo(
    () => (termo ? bloco.dados.filter((a) => casaComBusca(a, termo)) : bloco.dados),
    [bloco.dados, termo]
  )
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA_DA_TABELA))
  const paginaAtual = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaAtual * ITENS_POR_PAGINA_DA_TABELA
  const visiveis = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA_DA_TABELA)

  function buscar(valor: string) {
    setBusca(valor)
    setPagina(0)
  }

  async function confirmar() {
    if (!pendente) return
    setEnviando(true)
    try {
      await onAcao(pendente.acao, pendente.acesso)
      toast.success(SUCESSO[pendente.acao])
      setPendente(null)
    } catch (e) {
      toast.error(mensagemDoErro(e))
    } finally {
      setEnviando(false)
    }
  }

  let corpo: React.ReactNode
  if (bloco.erro) {
    corpo = <ErroBloco oQue={textos.oQue} mensagem={bloco.erro} onTentarDeNovo={onTentarDeNovo} />
  } else if (bloco.carregando) {
    corpo = <EsqueletoBloco rotulo={`Carregando ${textos.oQue}`} />
  } else if (bloco.dados.length === 0) {
    corpo = (
      <VazioBloco
        icone={textos.icone}
        titulo={textos.vazio}
        acao={{ rotulo: textos.criar, onClick: onCriar }}
      />
    )
  } else if (filtrados.length === 0) {
    corpo = <SemResultadoBloco termo={busca.trim()} onLimpar={() => buscar("")} />
  } else {
    corpo = (
      <>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table className="min-w-180">
            <TableHeader>
              <TableRow className="bg-muted/60">
                {textos.colunas.map((c) => (
                  <TableHead key={c} className="text-xs text-muted-foreground">
                    {c}
                  </TableHead>
                ))}
                <TableHead>
                  <span className="sr-only">Ações da linha</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiveis.map((acesso) => (
                <LinhaDoAcesso
                  key={acesso.id}
                  acesso={acesso}
                  onPedir={(acao) => setPendente({ acao, acesso })}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {inicio + 1} a {inicio + visiveis.length} de {filtrados.length}
          </span>
          <div className="flex items-center gap-1">
            <span className="mr-1 tabular-nums">
              Página {paginaAtual + 1} de {totalPaginas}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={paginaAtual === 0}
              onClick={() => setPagina(paginaAtual - 1)}
              className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Próxima página"
              disabled={paginaAtual >= totalPaginas - 1}
              onClick={() => setPagina(paginaAtual + 1)}
              className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <Card data-testid={tipo === "pessoal" ? "tabela-chaves" : "tabela-unicos"}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle className="text-base">{textos.titulo}</CardTitle>
        <div className="w-full min-w-0 sm:w-72">
          <CampoBusca
            valor={busca}
            onChange={buscar}
            placeholder={textos.busca}
            rotulo={`Buscar em ${textos.titulo.toLowerCase()}`}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{corpo}</CardContent>
      <ConfirmarAcao
        confirmacao={pendente && confirmacaoDe(pendente.acao, pendente.acesso)}
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setPendente(null)}
      />
    </Card>
  )
}

function SeloDaSituacao({ acesso }: { acesso: AcessoVisto }) {
  return (
    <Badge className={cn("gap-1.5 border", TOM_DA_SITUACAO[acesso.situacao])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {ROTULO_DA_SITUACAO[acesso.situacao]}
    </Badge>
  )
}

function BotaoDaLinha({
  rotulo,
  dica,
  icone: Icone,
  destrutivo = false,
  onClick,
}: {
  rotulo: string
  dica: string
  icone: typeof Ban
  destrutivo?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={rotulo}
            onClick={onClick}
            className={cn("cursor-pointer", destrutivo && "text-destructive hover:text-destructive")}
          />
        }
      >
        <Icone aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}

function LinhaDoAcesso({
  acesso,
  onPedir,
}: {
  acesso: AcessoVisto
  onPedir: (acao: AcaoDaLinha) => void
}) {
  const unico = acesso.tipo === "unico"
  const formatar = unico ? formatarDataHora : formatarData
  const ativo = acesso.situacao === "ativo"
  const nomeDaLinha = acesso.nome ?? acesso.tarefa ?? acesso.prefixo

  return (
    <TableRow data-testid={`acesso-${acesso.prefixo}`}>
      {unico ? (
        <>
          <TableCell className="max-w-72 truncate" title={acesso.tarefa ?? undefined}>
            {acesso.tarefa}
          </TableCell>
          <TableCell>{acesso.escopo && ROTULO_DO_RECURSO[acesso.escopo.recurso]}</TableCell>
          <TableCell>{acesso.escopo && rotuloDasAcoes(acesso.escopo.acoes)}</TableCell>
        </>
      ) : (
        <>
          <TableCell>{acesso.nome}</TableCell>
          <TableCell className="font-mono text-xs">{acesso.prefixo}</TableCell>
        </>
      )}
      <TableCell className="tabular-nums">{formatar(acesso.criadoEm)}</TableCell>
      <TableCell className="tabular-nums">{formatar(acesso.expiraEm)}</TableCell>
      <TableCell className="tabular-nums">
        {acesso.ultimoUsoEm ? (
          formatarQuando(acesso.ultimoUsoEm)
        ) : (
          <span className="text-muted-foreground">Nunca usado</span>
        )}
      </TableCell>
      <TableCell>
        <SeloDaSituacao acesso={acesso} />
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {!ativo ? (
          <BotaoDaLinha
            rotulo={`Apagar ${nomeDaLinha}`}
            dica="Apagar"
            icone={Trash2}
            destrutivo
            onClick={() => onPedir("apagar")}
          />
        ) : unico ? (
          <BotaoDaLinha
            rotulo={`Encerrar ${nomeDaLinha}`}
            dica="Encerrar"
            icone={CircleStop}
            onClick={() => onPedir("encerrar")}
          />
        ) : (
          <BotaoDaLinha
            rotulo={`Revogar ${nomeDaLinha}`}
            dica="Revogar"
            icone={Ban}
            onClick={() => onPedir("revogar")}
          />
        )}
      </TableCell>
    </TableRow>
  )
}
