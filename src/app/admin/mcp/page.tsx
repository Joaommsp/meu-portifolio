"use client"

import * as React from "react"
import { KeyRound, Timer } from "lucide-react"

import { AtividadeRecente } from "@/components/admin/mcp/AtividadeRecente"
import { ChavePessoalForm, type DadosDaChave } from "@/components/admin/mcp/ChavePessoalForm"
import { ContextoMcp } from "@/components/admin/mcp/ContextoMcp"
import { SegredoDialog, type SegredoMostrado } from "@/components/admin/mcp/SegredoDialog"
import { TabelaAcessos, type AcaoDaLinha } from "@/components/admin/mcp/TabelaAcessos"
import { UsoUnicoForm } from "@/components/admin/mcp/UsoUnicoForm"
import { useAcessosMcp } from "@/components/admin/mcp/useAcessosMcp"
import { useRolarPara } from "@/components/providers/SmoothScrollProvider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NovoUnicoEntrada } from "@/lib/admin-api/mcp"
import { MAX_CHAVES_PESSOAIS_ATIVAS } from "@/lib/mcp/limites"
import type { AcessoVisto, TipoAcesso } from "@/lib/mcp/tipos"

/** Folga acima do formulário ao rolar até ele. */
const FOLGA_DA_ROLAGEM_PX = 24

export default function McpAdminPage() {
  const { pessoais, unicos, enderecoMcp, atividade, recarregarAcessos, recarregarAtividade, acoes } =
    useAcessosMcp()
  const rolarPara = useRolarPara()
  const formulario = React.useRef<HTMLDivElement>(null)
  const [aba, setAba] = React.useState<TipoAcesso>("pessoal")
  const [segredo, setSegredo] = React.useState<SegredoMostrado | null>(null)

  const noLimite = React.useMemo(
    () =>
      pessoais.dados.filter((a) => a.situacao === "ativo").length >=
      MAX_CHAVES_PESSOAIS_ATIVAS,
    [pessoais.dados]
  )

  async function criarChave({ cliente, nome, validadeDias }: DadosDaChave) {
    const criado = await acoes.criarChave({ nome, validadeDias })
    setSegredo({ tipo: "pessoal", cliente, nome, criado })
  }

  async function criarUnico(dados: NovoUnicoEntrada) {
    const criado = await acoes.criarUnico(dados)
    setSegredo({ tipo: "unico", criado })
  }

  const agirNaLinha = React.useCallback(
    (acao: AcaoDaLinha, acesso: AcessoVisto) => acoes[acao](acesso.id),
    [acoes]
  )

  const irParaCriar = React.useCallback(
    (tipo: TipoAcesso) => {
      setAba(tipo)
      const alvo = formulario.current
      if (alvo) {
        rolarPara(alvo.getBoundingClientRect().top + window.scrollY - FOLGA_DA_ROLAGEM_PX)
      }
    },
    [rolarPara]
  )

  return (
    <div className="mx-auto flex max-w-280 flex-col gap-7">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">MCP</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conexões de LLM ao conteúdo do admin
        </p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div ref={formulario} className="min-w-0">
          <Card>
            <CardContent>
              <Tabs value={aba} onValueChange={(v: TipoAcesso) => setAba(v)}>
                <TabsList className="mb-2">
                  <TabsTrigger value="pessoal" className="cursor-pointer px-3">
                    <KeyRound aria-hidden />
                    Chave pessoal
                  </TabsTrigger>
                  <TabsTrigger value="unico" className="cursor-pointer px-3">
                    <Timer aria-hidden />
                    Uso único
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pessoal">
                  <ChavePessoalForm noLimite={noLimite} onEnviar={criarChave} />
                </TabsContent>
                <TabsContent value="unico">
                  <UsoUnicoForm onEnviar={criarUnico} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <ContextoMcp endereco={enderecoMcp} onTentarDeNovo={recarregarAcessos} />
          <AtividadeRecente bloco={atividade} onTentarDeNovo={recarregarAtividade} />
        </div>
      </div>

      <TabelaAcessos
        tipo="pessoal"
        bloco={pessoais}
        onTentarDeNovo={recarregarAcessos}
        onCriar={() => irParaCriar("pessoal")}
        onAcao={agirNaLinha}
      />
      <TabelaAcessos
        tipo="unico"
        bloco={unicos}
        onTentarDeNovo={recarregarAcessos}
        onCriar={() => irParaCriar("unico")}
        onAcao={agirNaLinha}
      />

      <SegredoDialog segredo={segredo} onFechar={() => setSegredo(null)} />
    </div>
  )
}
