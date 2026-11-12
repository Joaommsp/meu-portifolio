import "server-only"

import { MAX_CHAMADAS_POR_MINUTO } from "@/lib/mcp/limites"

import { idDoLimite, type CamposMutaveis, type RepositorioAcessos } from "./repositorio"
import { situacao } from "./situacao"
import type { Acesso, RegistroAuditoria } from "./tipos"

/**
 * Repositório de acessos em memória, com o mesmo contrato do Firestore
 * (inclui o limite por minuto). Os testes dos serviços e das rotas usam este.
 */
export class RepositorioAcessosEmMemoria implements RepositorioAcessos {
  readonly acessos = new Map<string, Acesso>()
  readonly auditoria: RegistroAuditoria[] = []
  readonly contadores = new Map<string, number>()

  async obter(id: string): Promise<Acesso | null> {
    const a = this.acessos.get(id)
    return a ? { ...a } : null
  }

  async criar(acesso: Acesso): Promise<void> {
    if (this.acessos.has(acesso.id)) throw new Error(`Acesso ${acesso.id} já existe.`)
    this.acessos.set(acesso.id, { ...acesso })
  }

  async atualizar(id: string, campos: CamposMutaveis): Promise<void> {
    const a = this.acessos.get(id)
    if (!a) throw new Error(`Acesso ${id} não existe.`)
    this.acessos.set(id, { ...a, ...campos })
  }

  async apagar(id: string): Promise<void> {
    this.acessos.delete(id)
  }

  async listar(): Promise<Acesso[]> {
    return [...this.acessos.values()]
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .map((a) => ({ ...a }))
  }

  async contarPessoaisAtivas(agora: Date): Promise<number> {
    return [...this.acessos.values()].filter(
      (a) => a.tipo === "pessoal" && situacao(a, agora) === "ativo"
    ).length
  }

  async registrarAuditoria(registro: Omit<RegistroAuditoria, "id">): Promise<void> {
    this.auditoria.push({ ...registro, id: `reg-${this.auditoria.length + 1}` })
  }

  async atividade(limite: number): Promise<RegistroAuditoria[]> {
    return [...this.auditoria]
      .sort((a, b) => b.em.getTime() - a.em.getTime())
      .slice(0, limite)
  }

  async consumirLimite(id: string, agora: Date): Promise<boolean> {
    const chave = idDoLimite(id, agora)
    const contagem = this.contadores.get(chave) ?? 0
    if (contagem >= MAX_CHAMADAS_POR_MINUTO) return false
    this.contadores.set(chave, contagem + 1)
    return true
  }
}
