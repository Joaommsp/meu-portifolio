"use client"

import * as React from "react"
import { addDays, startOfDay } from "date-fns"
import { KeyRound, Loader2, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CLIENTES_MCP, type ClienteMcp } from "@/lib/mcp/conexao"
import {
  mensagemLimiteDeChaves,
  TAMANHO_MAX_DO_NOME,
  VALIDADE_PADRAO_DIAS,
  VALIDADES_DA_CHAVE_DIAS,
  type ValidadeDaChave,
} from "@/lib/mcp/limites"
import { cn } from "@/lib/utils"

import { Aviso } from "./Aviso"
import { errosDoEnvio, SEM_ERROS, type ErrosDeCampo } from "./erros"
import { formatarData } from "./formatos"

export type DadosDaChave = {
  cliente: ClienteMcp
  nome: string
  validadeDias: ValidadeDaChave
}

type Props = {
  /** Já há o máximo de chaves ativas: o botão trava e o aviso aparece. */
  noLimite: boolean
  /** Cria a chave; o erro (ErroApi) sobe para o formulário mostrar. */
  onEnviar: (dados: DadosDaChave) => Promise<void>
}

const CLIENTE_PADRAO: ClienteMcp = CLIENTES_MCP[0].id

const rotuloDaValidade = (dias: number) => `${dias} ${dias === 1 ? "dia" : "dias"}`

const SEM_INSCRICAO = () => () => {}
/** Meia-noite de hoje: o mesmo número o dia todo, então serve de snapshot estável. */
const HOJE_NO_CLIENTE = () => startOfDay(new Date()).getTime()
const HOJE_NO_SERVIDOR = () => null

/** Data de hoje lida depois de montar; `null` no servidor, para não quebrar a hidratação. */
function useHoje(): number | null {
  return React.useSyncExternalStore(SEM_INSCRICAO, HOJE_NO_CLIENTE, HOJE_NO_SERVIDOR)
}

/** Chave pessoal: cliente onde será usada, nome e validade. */
export function ChavePessoalForm({ noLimite, onEnviar }: Props) {
  const [cliente, setCliente] = React.useState<ClienteMcp>(CLIENTE_PADRAO)
  const [nome, setNome] = React.useState("")
  const [validade, setValidade] = React.useState<ValidadeDaChave>(VALIDADE_PADRAO_DIAS)
  const [enviando, setEnviando] = React.useState(false)
  const [erros, setErros] = React.useState<ErrosDeCampo>(SEM_ERROS)
  const hoje = useHoje()

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErros(SEM_ERROS)
    try {
      await onEnviar({ cliente, nome, validadeDias: validade })
      setNome("")
    } catch (erro) {
      setErros(errosDoEnvio(erro))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" aria-label="Gerar chave pessoal">
      <fieldset disabled={enviando} className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-medium text-muted-foreground">
            1. Onde você vai usar
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Cliente">
            {CLIENTES_MCP.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cliente === c.id}
                onClick={() => setCliente(c.id)}
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-lg border border-input bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed",
                  cliente === c.id && "border-brand bg-brand/10 hover:bg-brand/10"
                )}
              >
                <span>{c.nome}</span>
                <small
                  className={cn(
                    "truncate text-xs text-muted-foreground",
                    cliente === c.id && "text-brand-texto"
                  )}
                >
                  {c.onde}
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-medium text-muted-foreground">2. Nome e validade</span>
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex min-w-0 flex-[1_1_12rem] flex-col gap-1.5">
              <Label htmlFor="mcp-nome">Nome da chave</Label>
              <Input
                id="mcp-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={TAMANHO_MAX_DO_NOME}
                aria-invalid={Boolean(erros.nome)}
                aria-describedby={erros.nome ? "mcp-nome-erro" : undefined}
              />
              <div className="flex justify-between gap-2 text-xs">
                <span id="mcp-nome-erro" className="text-destructive" role={erros.nome ? "alert" : undefined}>
                  {erros.nome}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {nome.length}/{TAMANHO_MAX_DO_NOME}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label id="mcp-validade">Validade</Label>
              <div
                role="group"
                aria-labelledby="mcp-validade"
                className="inline-flex overflow-hidden rounded-lg border border-input"
              >
                {VALIDADES_DA_CHAVE_DIAS.map((dias) => (
                  <button
                    key={dias}
                    type="button"
                    aria-pressed={validade === dias}
                    onClick={() => setValidade(dias)}
                    className={cn(
                      "cursor-pointer bg-card px-3.5 py-1.5 text-sm tabular-nums transition-colors not-first:border-l not-first:border-input hover:bg-muted disabled:cursor-not-allowed",
                      validade === dias && "bg-foreground text-background hover:bg-foreground"
                    )}
                  >
                    {rotuloDaValidade(dias)}
                  </button>
                ))}
              </div>
              {erros.validadeDias && (
                <span className="text-xs text-destructive" role="alert">
                  {erros.validadeDias}
                </span>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {noLimite && <Aviso papel="status">{mensagemLimiteDeChaves()}</Aviso>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-4" aria-hidden />
          {hoje !== null && `Vence em ${formatarData(addDays(hoje, validade))}`}
        </span>
        <Button
          type="submit"
          disabled={enviando || noLimite}
          className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
        >
          {enviando ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <KeyRound aria-hidden />
          )}
          {enviando ? "Gerando" : "Gerar chave"}
        </Button>
      </div>
    </form>
  )
}
