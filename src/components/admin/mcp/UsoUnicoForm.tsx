"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { NovoUnicoEntrada } from "@/lib/admin-api/mcp"
import { RECURSOS } from "@/lib/conteudo"
import { NOMES_DE_RECURSO, type Recurso } from "@/lib/conteudo/tipos"
import { DURACAO_DO_UNICO_HORAS, TAMANHO_MAX_DA_TAREFA } from "@/lib/mcp/limites"
import { ACOES_DO_UNICO, type AcaoDoUnico } from "@/lib/mcp/tipos"
import { cn } from "@/lib/utils"

import { errosDoEnvio, SEM_ERROS, type ErrosDeCampo } from "./erros"
import { EsqueletoBloco, ErroBloco } from "./EstadoBloco"
import { ROTULO_DA_ACAO_DO_UNICO, ROTULO_DO_RECURSO } from "./formatos"
import { useItensDoRecurso } from "./useItensDoRecurso"

type Props = {
  /** Cria o acesso; o erro (ErroApi) sobe para o formulário mostrar. */
  onEnviar: (dados: NovoUnicoEntrada) => Promise<void>
}

const RECURSO_PADRAO: Recurso = NOMES_DE_RECURSO[0]
const ACOES_PADRAO: readonly AcaoDoUnico[] = ["ler"]

/** Acesso de uso único: recurso, item opcional, ações e a tarefa. */
export function UsoUnicoForm({ onEnviar }: Props) {
  const [recurso, setRecurso] = React.useState<Recurso>(RECURSO_PADRAO)
  const [itemId, setItemId] = React.useState<string | null>(null)
  const [acoes, setAcoes] = React.useState<readonly AcaoDoUnico[]>(ACOES_PADRAO)
  const [tarefa, setTarefa] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)
  const [erros, setErros] = React.useState<ErrosDeCampo>(SEM_ERROS)

  function trocarRecurso(valor: Recurso | null) {
    if (!valor) return
    setRecurso(valor)
    setItemId(null)
  }

  function alternarAcao(acao: AcaoDoUnico, marcada: boolean) {
    setAcoes((atuais) =>
      marcada ? [...atuais, acao] : atuais.filter((a) => a !== acao)
    )
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErros(SEM_ERROS)
    try {
      // Na ordem de ACOES_DO_UNICO, não na ordem do clique.
      const marcadas = ACOES_DO_UNICO.filter((a) => acoes.includes(a))
      await onEnviar({ recurso, itemId, acoes: marcadas, tarefa })
      setTarefa("")
    } catch (erro) {
      setErros(errosDoEnvio(erro))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" aria-label="Gerar acesso único">
      <fieldset disabled={enviando} className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-0 flex-[1_1_12rem] flex-col gap-1.5">
            <Label htmlFor="mcp-recurso">Recurso</Label>
            <Select value={recurso} onValueChange={trocarRecurso} disabled={enviando}>
              <SelectTrigger id="mcp-recurso" className="w-full cursor-pointer">
                <SelectValue>{(v: Recurso) => ROTULO_DO_RECURSO[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {NOMES_DE_RECURSO.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROTULO_DO_RECURSO[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.recurso && <ErroDoCampo>{erros.recurso}</ErroDoCampo>}
          </div>

          <div className="flex min-w-0 flex-[1_1_12rem] flex-col gap-1.5">
            <Label htmlFor="mcp-item">Item</Label>
            <SeletorDeItem
              recurso={recurso}
              itemId={itemId}
              onEscolher={setItemId}
              desabilitado={enviando}
            />
            {erros.itemId && <ErroDoCampo>{erros.itemId}</ErroDoCampo>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span id="mcp-acoes" className="text-sm font-medium">
            O que a LLM pode fazer
          </span>
          <div role="group" aria-labelledby="mcp-acoes" className="flex flex-wrap gap-2">
            {ACOES_DO_UNICO.map((acao) => (
              <Label
                key={acao}
                className="cursor-pointer rounded-lg border border-input bg-card px-3 py-2 font-normal"
              >
                <Checkbox
                  checked={acoes.includes(acao)}
                  onCheckedChange={(marcada) => alternarAcao(acao, marcada)}
                  disabled={enviando}
                />
                {ROTULO_DA_ACAO_DO_UNICO[acao]}
              </Label>
            ))}
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    tabIndex={0}
                    className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                  />
                }
              >
                <Checkbox disabled aria-label="Apagar" />
                Apagar
              </TooltipTrigger>
              <TooltipContent>Apagar só com chave pessoal</TooltipContent>
            </Tooltip>
          </div>
          {erros.acoes && <ErroDoCampo>{erros.acoes}</ErroDoCampo>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mcp-tarefa">Tarefa</Label>
          <Textarea
            id="mcp-tarefa"
            value={tarefa}
            onChange={(e) => setTarefa(e.target.value)}
            maxLength={TAMANHO_MAX_DA_TAREFA}
            aria-invalid={Boolean(erros.tarefa)}
            className="min-h-21"
          />
          <div className="flex justify-between gap-2 text-xs">
            <span className="text-destructive" role={erros.tarefa ? "alert" : undefined}>
              {erros.tarefa}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {tarefa.length}/{TAMANHO_MAX_DA_TAREFA}
            </span>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-4" aria-hidden />
          Encerra ao concluir a tarefa ou em {DURACAO_DO_UNICO_HORAS} h
        </span>
        <Button
          type="submit"
          disabled={enviando || acoes.length === 0}
          className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
        >
          {enviando ? <Loader2 className="animate-spin" aria-hidden /> : <Timer aria-hidden />}
          {enviando ? "Gerando" : "Gerar acesso único"}
        </Button>
      </div>
    </form>
  )
}

function ErroDoCampo({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-destructive" role="alert">
      {children}
    </span>
  )
}

type SeletorProps = {
  recurso: Recurso
  itemId: string | null
  onEscolher: (id: string | null) => void
  desabilitado: boolean
}

/** Item opcional do escopo, com busca. Documento único não tem item. */
function SeletorDeItem({ recurso, itemId, onEscolher, desabilitado }: SeletorProps) {
  const [aberto, setAberto] = React.useState(false)
  const { itens, erro, carregando, tentarDeNovo } = useItensDoRecurso(recurso)
  const documentoUnico = RECURSOS[recurso].unico
  const todos = `Todos os itens de ${ROTULO_DO_RECURSO[recurso]}`
  const escolhido = itens.find((i) => i.id === itemId)

  if (documentoUnico) {
    return (
      <Button
        id="mcp-item"
        type="button"
        variant="outline"
        disabled
        className="w-full justify-between font-normal disabled:pointer-events-auto disabled:cursor-not-allowed"
      >
        Documento único
      </Button>
    )
  }

  function escolher(id: string | null) {
    onEscolher(id)
    setAberto(false)
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        render={
          <Button
            id="mcp-item"
            type="button"
            variant="outline"
            disabled={desabilitado}
            className="w-full cursor-pointer justify-between font-normal"
          />
        }
      >
        <span className="truncate">{escolhido?.titulo ?? todos}</span>
        <ChevronsUpDown className="text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar item" />
          <CommandList>
            {carregando ? (
              <div className="px-2">
                <EsqueletoBloco rotulo="Carregando itens" />
              </div>
            ) : erro ? (
              <ErroBloco oQue="os itens" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
            ) : (
              <>
                <CommandEmpty>Nada encontrado</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="__todos__" keywords={[todos]} onSelect={() => escolher(null)}>
                    {todos}
                    <Check className={cn("ml-auto", itemId !== null && "opacity-0")} aria-hidden />
                  </CommandItem>
                  {itens.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      keywords={[item.titulo]}
                      onSelect={() => escolher(item.id)}
                    >
                      <span className="truncate">{item.titulo}</span>
                      <Check
                        className={cn("ml-auto", itemId !== item.id && "opacity-0")}
                        aria-hidden
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
