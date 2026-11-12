"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AcessoCriado } from "@/lib/admin-api/mcp"
import { CLIENTES_MCP, configuracaoDoCliente, type ClienteMcp } from "@/lib/mcp/conexao"

import { Aviso } from "./Aviso"
import { CaixaDeCopia } from "./CaixaDeCopia"
import { formatarHora, ROTULO_DO_RECURSO, rotuloDasAcoes } from "./formatos"

/** O que acabou de ser criado; só existe até o dialog fechar. */
export type SegredoMostrado =
  | { tipo: "pessoal"; cliente: ClienteMcp; nome: string; criado: AcessoCriado }
  | { tipo: "unico"; criado: AcessoCriado }

type Props = {
  segredo: SegredoMostrado | null
  /** Fechar descarta o segredo. */
  onFechar: () => void
}

/** Mostra o segredo uma vez: configuração do cliente ou prompt pronto. */
export function SegredoDialog({ segredo, onFechar }: Props) {
  return (
    <Dialog open={segredo !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {segredo?.tipo === "pessoal" && <ConteudoDaChave segredo={segredo} onFechar={onFechar} />}
        {segredo?.tipo === "unico" && <ConteudoDoUnico criado={segredo.criado} onFechar={onFechar} />}
      </DialogContent>
    </Dialog>
  )
}

function Rodape({ onFechar }: { onFechar: () => void }) {
  return (
    <DialogFooter>
      <Button type="button" onClick={onFechar} className="cursor-pointer">
        Já copiei
      </Button>
    </DialogFooter>
  )
}

function ConteudoDaChave({
  segredo,
  onFechar,
}: {
  segredo: Extract<SegredoMostrado, { tipo: "pessoal" }>
  onFechar: () => void
}) {
  const cliente = CLIENTES_MCP.find((c) => c.id === segredo.cliente) ?? CLIENTES_MCP[0]
  const { segredo: chave, enderecoMcp } = segredo.criado
  const configuracao = configuracaoDoCliente(cliente.id, segredo.nome, enderecoMcp, chave)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Chave criada</DialogTitle>
        <DialogDescription>
          Configuração para {cliente.nome} ({cliente.onde})
        </DialogDescription>
      </DialogHeader>
      <Aviso>Esta chave não será mostrada de novo.</Aviso>
      <CaixaDeCopia texto={configuracao} rotulo="Copiar configuração" alto />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Só a chave</span>
        <CaixaDeCopia texto={chave} rotulo="Copiar chave" />
      </div>
      <Rodape onFechar={onFechar} />
    </>
  )
}

function ConteudoDoUnico({ criado, onFechar }: { criado: AcessoCriado; onFechar: () => void }) {
  const { acesso, prompt } = criado
  const escopo = acesso.escopo

  return (
    <>
      <DialogHeader>
        <DialogTitle>Prompt pronto</DialogTitle>
        <DialogDescription>
          {escopo && `${ROTULO_DO_RECURSO[escopo.recurso]} · ${rotuloDasAcoes(escopo.acoes)} · `}
          encerra às {formatarHora(acesso.expiraEm)}
        </DialogDescription>
      </DialogHeader>
      {prompt ? (
        <>
          <Aviso>O acesso não será mostrado de novo.</Aviso>
          <CaixaDeCopia texto={prompt} rotulo="Copiar prompt" alto />
        </>
      ) : (
        // O prompt só existe no 201 do servidor; sem ele, o acesso não tem como ser usado.
        <p role="alert" className="text-sm text-destructive">
          O servidor não devolveu o prompt. Encerre este acesso e gere outro.
        </p>
      )}
      <Rodape onFechar={onFechar} />
    </>
  )
}
