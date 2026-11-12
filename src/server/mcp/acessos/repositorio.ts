import "server-only"

import { Timestamp, type DocumentData, type Firestore } from "firebase-admin/firestore"

import { MAX_CHAMADAS_POR_MINUTO, MS_POR_MINUTO } from "@/lib/mcp/limites"
import { obterFirestore } from "@/server/firebase-admin"

import { situacao } from "./situacao"
import type { Acesso, RegistroAuditoria } from "./tipos"

/**
 * Acessos (`mcpAcessos/{hash}`), auditoria (`mcpAuditoria`) e contador do
 * limite por minuto (`mcpLimite/{id}_{minuto}`). As três coleções estão
 * fechadas ao SDK cliente nas regras; só o servidor lê e grava.
 */

export const COLECAO_ACESSOS = "mcpAcessos"
export const COLECAO_AUDITORIA = "mcpAuditoria"
export const COLECAO_LIMITE = "mcpLimite"

export type CamposMutaveis = Partial<
  Pick<Acesso, "revogadoEm" | "encerradoEm" | "ultimoUsoEm">
>

export interface RepositorioAcessos {
  obter(id: string): Promise<Acesso | null>
  criar(acesso: Acesso): Promise<void>
  atualizar(id: string, campos: CamposMutaveis): Promise<void>
  apagar(id: string): Promise<void>
  /** Mais recentes primeiro. */
  listar(): Promise<Acesso[]>
  contarPessoaisAtivas(agora: Date): Promise<number>
  registrarAuditoria(registro: Omit<RegistroAuditoria, "id">): Promise<void>
  /** Mais recentes primeiro. */
  atividade(limite: number): Promise<RegistroAuditoria[]>
  /** Conta a chamada; `false` quando o minuto já tem o máximo. */
  consumirLimite(id: string, agora: Date): Promise<boolean>
}

/* Conversões puras */

function paraTimestamp(d: Date | null): Timestamp | null {
  return d ? Timestamp.fromDate(d) : null
}

function paraData(v: unknown): Date | null {
  return v instanceof Timestamp ? v.toDate() : null
}

export function acessoParaDoc(acesso: Acesso): DocumentData {
  return {
    tipo: acesso.tipo,
    prefixo: acesso.prefixo,
    nome: acesso.nome,
    tarefa: acesso.tarefa,
    escopo: acesso.escopo,
    criadoEm: Timestamp.fromDate(acesso.criadoEm),
    expiraEm: Timestamp.fromDate(acesso.expiraEm),
    revogadoEm: paraTimestamp(acesso.revogadoEm),
    encerradoEm: paraTimestamp(acesso.encerradoEm),
    ultimoUsoEm: paraTimestamp(acesso.ultimoUsoEm),
  }
}

export function acessoDeDoc(id: string, d: DocumentData): Acesso {
  return {
    id,
    tipo: d.tipo,
    prefixo: d.prefixo,
    nome: d.nome ?? null,
    tarefa: d.tarefa ?? null,
    escopo: d.escopo ?? null,
    criadoEm: paraData(d.criadoEm) ?? new Date(0),
    expiraEm: paraData(d.expiraEm) ?? new Date(0),
    revogadoEm: paraData(d.revogadoEm),
    encerradoEm: paraData(d.encerradoEm),
    ultimoUsoEm: paraData(d.ultimoUsoEm),
  }
}

export function camposParaDoc(campos: CamposMutaveis): DocumentData {
  return Object.fromEntries(
    Object.entries(campos).map(([k, v]) => [k, paraTimestamp(v ?? null)])
  )
}

export function registroParaDoc(r: Omit<RegistroAuditoria, "id">): DocumentData {
  return { ...r, em: Timestamp.fromDate(r.em) }
}

export function registroDeDoc(id: string, d: DocumentData): RegistroAuditoria {
  return {
    id,
    em: paraData(d.em) ?? new Date(0),
    acessoId: d.acessoId,
    prefixo: d.prefixo,
    acao: d.acao,
    recurso: d.recurso ?? null,
    itemId: d.itemId ?? null,
  }
}

/** Minuto cheio da chamada: o contador zera quando ele vira. */
export function minutoDe(agora: Date): number {
  return Math.floor(agora.getTime() / MS_POR_MINUTO)
}

export function idDoLimite(id: string, agora: Date): string {
  return `${id}_${minutoDe(agora)}`
}

/** Fim do minuto do contador; a política de TTL do Firestore apaga depois. */
export function expiraEmDoLimite(agora: Date): Date {
  return new Date((minutoDe(agora) + 1) * MS_POR_MINUTO)
}

/* Implementação Firestore */

export class RepositorioAcessosFirestore implements RepositorioAcessos {
  /** `prefixo` isola o teste de contrato em coleções próprias; em produção é vazio. */
  constructor(
    private readonly db: Firestore,
    private readonly prefixo = ""
  ) {}

  private get acessos() {
    return this.db.collection(`${this.prefixo}${COLECAO_ACESSOS}`)
  }

  private get auditoria() {
    return this.db.collection(`${this.prefixo}${COLECAO_AUDITORIA}`)
  }

  async obter(id: string): Promise<Acesso | null> {
    const snap = await this.acessos.doc(id).get()
    return snap.exists ? acessoDeDoc(snap.id, snap.data() ?? {}) : null
  }

  async criar(acesso: Acesso): Promise<void> {
    await this.acessos.doc(acesso.id).create(acessoParaDoc(acesso))
  }

  async atualizar(id: string, campos: CamposMutaveis): Promise<void> {
    await this.acessos.doc(id).update(camposParaDoc(campos))
  }

  async apagar(id: string): Promise<void> {
    await this.acessos.doc(id).delete()
  }

  async listar(): Promise<Acesso[]> {
    const snap = await this.acessos.orderBy("criadoEm", "desc").get()
    return snap.docs.map((d) => acessoDeDoc(d.id, d.data()))
  }

  /** Filtra a situação em memória: evita índice composto para poucas chaves. */
  async contarPessoaisAtivas(agora: Date): Promise<number> {
    const snap = await this.acessos
      .where("tipo", "==", "pessoal")
      .where("revogadoEm", "==", null)
      .get()
    return snap.docs
      .map((d) => acessoDeDoc(d.id, d.data()))
      .filter((a) => situacao(a, agora) === "ativo").length
  }

  async registrarAuditoria(registro: Omit<RegistroAuditoria, "id">): Promise<void> {
    await this.auditoria.add(registroParaDoc(registro))
  }

  async atividade(limite: number): Promise<RegistroAuditoria[]> {
    const snap = await this.auditoria
      .orderBy("em", "desc")
      .limit(limite)
      .get()
    return snap.docs.map((d) => registroDeDoc(d.id, d.data()))
  }

  /** Transação: instâncias da Vercel não dividem memória, o contador mora no banco. */
  async consumirLimite(id: string, agora: Date): Promise<boolean> {
    const ref = this.db.collection(`${this.prefixo}${COLECAO_LIMITE}`).doc(idDoLimite(id, agora))
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      const contagem = snap.exists ? Number(snap.data()?.contagem ?? 0) : 0
      if (contagem >= MAX_CHAMADAS_POR_MINUTO) return false
      tx.set(ref, {
        contagem: contagem + 1,
        expiraEm: Timestamp.fromDate(expiraEmDoLimite(agora)),
      })
      return true
    })
  }
}

export function repositorioAcessosFirestore(
  db: Firestore = obterFirestore()
): RepositorioAcessos {
  return new RepositorioAcessosFirestore(db)
}
