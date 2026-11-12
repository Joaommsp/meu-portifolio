import "server-only"

import { definicaoDe } from "@/lib/conteudo"
import { AGORA, type CamposDerivados, type Recurso } from "@/lib/conteudo/tipos"
import { ITENS_POR_PAGINA } from "@/lib/mcp/limites"

import {
  paraItem,
  type ItemLido,
  type OpcoesDeListagem,
  type Pagina,
  type RepositorioConteudo,
} from "./repositorio"

type Documento = Record<string, unknown>

function comparar(a: unknown, b: unknown): number {
  const va = a instanceof Date ? a.getTime() : a
  const vb = b instanceof Date ? b.getTime() : b
  if (va === vb) return 0
  if (va === undefined || va === null) return 1
  if (vb === undefined || vb === null) return -1
  return (va as number | string) < (vb as number | string) ? -1 : 1
}

/**
 * Repositório em memória com o mesmo contrato do Firestore: os testes dos
 * serviços e das rotas usam este. O carimbo do servidor vira `agora()`.
 */
export class RepositorioConteudoEmMemoria implements RepositorioConteudo {
  readonly colecoes = new Map<Recurso, Map<string, Documento>>()
  private sequencia = 0

  constructor(private readonly agora: () => Date = () => new Date()) {}

  private colecao(recurso: Recurso): Map<string, Documento> {
    let c = this.colecoes.get(recurso)
    if (!c) {
      c = new Map()
      this.colecoes.set(recurso, c)
    }
    return c
  }

  /** Semeia um documento como se já estivesse no banco. */
  semear(recurso: Recurso, id: string, dados: Documento): void {
    this.colecao(recurso).set(id, { ...dados })
  }

  async listar(recurso: Recurso, opcoes: OpcoesDeListagem = {}): Promise<Pagina> {
    const ordem = definicaoDe(recurso).ordem
    const limite = opcoes.limite ?? ITENS_POR_PAGINA
    const todos = [...this.colecao(recurso).entries()].sort(([ia, a], [ib, b]) => {
      if (!ordem) return comparar(ia, ib)
      const c = comparar(a[ordem.campo], b[ordem.campo])
      return (ordem.direcao === "desc" ? -c : c) || comparar(ia, ib)
    })
    const inicio = opcoes.cursor
      ? todos.findIndex(([id]) => id === opcoes.cursor) + 1
      : 0
    const pagina = todos.slice(inicio, inicio + limite)
    const temMais = inicio + limite < todos.length
    return {
      itens: pagina.map(([id, dados]) => paraItem(id, dados)),
      proximoCursor: temMais ? (pagina.at(-1)?.[0] ?? null) : null,
    }
  }

  async obter(recurso: Recurso, id: string): Promise<ItemLido | null> {
    const dados = this.colecao(recurso).get(id)
    return dados ? paraItem(id, dados) : null
  }

  private gravar(
    campos: Documento,
    derivados: CamposDerivados,
    momento: "criar" | "atualizar"
  ): Documento {
    const agora = this.agora()
    const doc: Documento = { ...campos }
    for (const [campo, valor] of Object.entries(derivados)) {
      doc[campo] = valor === AGORA ? agora : valor
    }
    if (momento === "criar") doc.createdAt = agora
    doc.updatedAt = agora
    return doc
  }

  async criar(
    recurso: Recurso,
    campos: Documento,
    derivados: CamposDerivados = {}
  ): Promise<ItemLido> {
    this.sequencia += 1
    const id = `item-${this.sequencia}`
    const doc = this.gravar(campos, derivados, "criar")
    this.colecao(recurso).set(id, doc)
    return paraItem(id, doc)
  }

  async atualizar(
    recurso: Recurso,
    id: string,
    campos: Documento,
    derivados: CamposDerivados = {}
  ): Promise<ItemLido> {
    const colecao = this.colecao(recurso)
    const atual = colecao.get(id)
    if (!atual && !definicaoDe(recurso).unico) {
      throw new Error(`Documento ${id} não existe.`)
    }
    const doc = { ...atual, ...this.gravar(campos, derivados, "atualizar") }
    colecao.set(id, doc)
    return paraItem(id, doc)
  }

  async apagar(recurso: Recurso, id: string): Promise<void> {
    this.colecao(recurso).delete(id)
  }

  async slugEmUso(recurso: Recurso, slug: string, exceto?: string): Promise<boolean> {
    return [...this.colecao(recurso).entries()].some(
      ([id, dados]) => dados.slug === slug && id !== exceto
    )
  }
}
