import "server-only"

import {
  FieldValue,
  Timestamp,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore"

import { definicaoDe } from "@/lib/conteudo"
import { ehObjetoSimples } from "@/lib/conteudo/leitura"
import {
  AGORA,
  type CamposDerivados,
  type Recurso,
} from "@/lib/conteudo/tipos"
import { ITENS_POR_PAGINA } from "@/lib/mcp/limites"
import { obterFirestore } from "@/server/firebase-admin"

/**
 * Leitura e gravação de qualquer recurso do admin com firebase-admin, a
 * partir da definição (`lib/conteudo`). Não confere escopo nem valida: isso
 * é do serviço, que chama daqui só o que já passou pela regra.
 */

/** Item como sai para o MCP: `id` + campos do documento, datas em ISO. */
export type ItemLido = { id: string } & Record<string, unknown>

export type Pagina = {
  itens: ItemLido[]
  /** Id do último item, para pedir a próxima página; `null` no fim. */
  proximoCursor: string | null
}

export type OpcoesDeListagem = { cursor?: string; limite?: number }

export interface RepositorioConteudo {
  listar(recurso: Recurso, opcoes?: OpcoesDeListagem): Promise<Pagina>
  obter(recurso: Recurso, id: string): Promise<ItemLido | null>
  /** `derivados` com `AGORA` viram o carimbo de data do servidor. */
  criar(
    recurso: Recurso,
    campos: Record<string, unknown>,
    derivados?: CamposDerivados
  ): Promise<ItemLido>
  atualizar(
    recurso: Recurso,
    id: string,
    campos: Record<string, unknown>,
    derivados?: CamposDerivados
  ): Promise<ItemLido>
  apagar(recurso: Recurso, id: string): Promise<void>
  slugEmUso(recurso: Recurso, slug: string, exceto?: string): Promise<boolean>
}

/* Conversões puras (testadas sem Firestore) */

/** `Date` vira `Timestamp`, inclusive dentro de listas e objetos. */
function paraValorDoFirestore(v: unknown): unknown {
  if (v instanceof Date) return Timestamp.fromDate(v)
  if (Array.isArray(v)) return v.map(paraValorDoFirestore)
  if (ehObjetoSimples(v)) {
    return Object.fromEntries(
      Object.entries(v).map(([k, item]) => [k, paraValorDoFirestore(item)])
    )
  }
  return v
}

/**
 * Monta o que se grava. Só os `derivados` trocam `AGORA` pelo carimbo do
 * servidor: um título que por acaso seja "agora" fica como texto.
 * `createdAt` nasce na criação; `updatedAt` muda em toda gravação.
 */
export function paraDocumento(
  campos: Record<string, unknown>,
  derivados: CamposDerivados,
  momento: "criar" | "atualizar"
): DocumentData {
  const doc = paraValorDoFirestore(campos) as DocumentData
  for (const [campo, valor] of Object.entries(derivados)) {
    doc[campo] =
      valor === AGORA ? FieldValue.serverTimestamp() : paraValorDoFirestore(valor)
  }
  if (momento === "criar") doc.createdAt = FieldValue.serverTimestamp()
  doc.updatedAt = FieldValue.serverTimestamp()
  return doc
}

/** `Timestamp` e `Date` viram texto ISO, inclusive dentro de listas e objetos. */
export function paraSaida(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  if (v instanceof Date) return v.toISOString()
  if (Array.isArray(v)) return v.map(paraSaida)
  if (ehObjetoSimples(v)) {
    return Object.fromEntries(
      Object.entries(v).map(([k, item]) => [k, paraSaida(item)])
    )
  }
  return v
}

export function paraItem(id: string, dados: Record<string, unknown>): ItemLido {
  return { ...(paraSaida(dados) as Record<string, unknown>), id }
}

/* Implementação Firestore */

export class RepositorioConteudoFirestore implements RepositorioConteudo {
  /** `prefixo` isola o teste de contrato em coleções próprias; em produção é vazio. */
  constructor(
    private readonly db: Firestore,
    private readonly prefixo = ""
  ) {}

  private colecao(recurso: Recurso) {
    return this.db.collection(`${this.prefixo}${definicaoDe(recurso).colecao}`)
  }

  async listar(recurso: Recurso, opcoes: OpcoesDeListagem = {}): Promise<Pagina> {
    const definicao = definicaoDe(recurso)
    const limite = opcoes.limite ?? ITENS_POR_PAGINA
    const colecao = this.colecao(recurso)
    let consulta = definicao.ordem
      ? colecao.orderBy(definicao.ordem.campo, definicao.ordem.direcao)
      : colecao.orderBy("__name__")
    if (opcoes.cursor) {
      const ultimo = await colecao.doc(opcoes.cursor).get()
      if (ultimo.exists) consulta = consulta.startAfter(ultimo)
    }
    // Um a mais para saber se há próxima página sem outra leitura.
    const snap = await consulta.limit(limite + 1).get()
    const docs = snap.docs.slice(0, limite)
    return {
      itens: docs.map((d) => paraItem(d.id, d.data())),
      proximoCursor:
        snap.docs.length > limite ? (docs.at(-1)?.id ?? null) : null,
    }
  }

  async obter(recurso: Recurso, id: string): Promise<ItemLido | null> {
    const snap = await this.colecao(recurso).doc(id).get()
    return snap.exists ? paraItem(snap.id, snap.data() ?? {}) : null
  }

  async criar(
    recurso: Recurso,
    campos: Record<string, unknown>,
    derivados: CamposDerivados = {}
  ): Promise<ItemLido> {
    const ref = await this.colecao(recurso).add(
      paraDocumento(campos, derivados, "criar")
    )
    return this.lerGravado(ref.id, recurso)
  }

  async atualizar(
    recurso: Recurso,
    id: string,
    campos: Record<string, unknown>,
    derivados: CamposDerivados = {}
  ): Promise<ItemLido> {
    const ref = this.colecao(recurso).doc(id)
    const doc = paraDocumento(campos, derivados, "atualizar")
    // O documento único pode ainda não existir; os demais já foram conferidos.
    if (definicaoDe(recurso).unico) await ref.set(doc, { merge: true })
    else await ref.update(doc)
    return this.lerGravado(id, recurso)
  }

  async apagar(recurso: Recurso, id: string): Promise<void> {
    await this.colecao(recurso).doc(id).delete()
  }

  async slugEmUso(recurso: Recurso, slug: string, exceto?: string): Promise<boolean> {
    const snap = await this.colecao(recurso).where("slug", "==", slug).limit(2).get()
    return snap.docs.some((d) => d.id !== exceto)
  }

  /** Relê para devolver o carimbo do servidor já resolvido. */
  private async lerGravado(id: string, recurso: Recurso): Promise<ItemLido> {
    const item = await this.obter(recurso, id)
    if (!item) throw new Error(`Item ${id} sumiu logo após a gravação.`)
    return item
  }
}

export function repositorioConteudoFirestore(
  db: Firestore = obterFirestore()
): RepositorioConteudo {
  return new RepositorioConteudoFirestore(db)
}
