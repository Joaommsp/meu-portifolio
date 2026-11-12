import { Timestamp } from "firebase-admin/firestore"
import { describe, expect, it } from "vitest"

import { MAX_CHAMADAS_POR_MINUTO } from "@/lib/mcp/limites"

import { RepositorioAcessosEmMemoria } from "./memoria"
import {
  acessoDeDoc,
  acessoParaDoc,
  expiraEmDoLimite,
  idDoLimite,
  registroDeDoc,
  registroParaDoc,
  type RepositorioAcessos,
} from "./repositorio"
import type { Acesso } from "./tipos"

const acesso: Acesso = {
  id: "a".repeat(64),
  tipo: "unico",
  prefixo: "pf_uu_V3kP",
  nome: null,
  tarefa: "Cadastrar Hades II",
  escopo: { recurso: "games", itemId: null, acoes: ["ler", "criar"] },
  criadoEm: new Date("2026-11-03T14:10:00.000Z"),
  expiraEm: new Date("2026-11-03T16:10:00.000Z"),
  revogadoEm: null,
  encerradoEm: new Date("2026-11-03T14:30:00.000Z"),
  ultimoUsoEm: null,
}

describe("repositório de acessos: conversões", () => {
  it("acesso vai ao Firestore com Timestamp e volta igual", () => {
    const doc = acessoParaDoc(acesso)

    expect(doc.criadoEm).toBeInstanceOf(Timestamp)
    expect(doc.revogadoEm).toBeNull()
    expect(doc).not.toHaveProperty("id")
    expect(acessoDeDoc(acesso.id, doc)).toEqual(acesso)
  })

  it("registro de auditoria guarda só data, acesso, prefixo, ação, recurso e item (AUDIT-01, AUDIT-03)", () => {
    const registro = {
      em: new Date("2026-11-03T14:12:00.000Z"),
      acessoId: acesso.id,
      prefixo: acesso.prefixo,
      acao: "criar" as const,
      recurso: "games" as const,
      itemId: "hades-ii",
    }
    const doc = registroParaDoc(registro)

    expect(Object.keys(doc).sort()).toEqual(
      ["acao", "acessoId", "em", "itemId", "prefixo", "recurso"]
    )
    expect(registroDeDoc("r1", doc)).toEqual({ ...registro, id: "r1" })
  })

  it("contador do limite é por acesso e minuto, e expira no fim do minuto (MCP-14)", () => {
    const agora = new Date("2026-11-03T14:10:30.500Z")
    const minuto = Math.floor(agora.getTime() / 60_000)

    expect(idDoLimite("abc", agora)).toBe(`abc_${minuto}`)
    expect(expiraEmDoLimite(agora).toISOString()).toBe("2026-11-03T14:11:00.000Z")
  })
})

describe("repositório de acessos: fake em memória cumpre a interface", () => {
  const novo = (): RepositorioAcessos => new RepositorioAcessosEmMemoria()

  it("consumirLimite aceita 120 no minuto, recusa a 121ª e libera no minuto seguinte (MCP-14)", async () => {
    const repo = novo()
    const agora = new Date("2026-11-03T14:10:00.000Z")
    const resultados: boolean[] = []
    for (let i = 0; i < MAX_CHAMADAS_POR_MINUTO + 1; i++) {
      resultados.push(await repo.consumirLimite("abc", agora))
    }

    expect(resultados.filter(Boolean)).toHaveLength(120)
    expect(resultados.at(-1)).toBe(false)
    expect(await repo.consumirLimite("abc", new Date("2026-11-03T14:11:00.000Z"))).toBe(true)
  })

  it("contarPessoaisAtivas ignora revogadas, vencidas e acessos únicos", async () => {
    const repo = novo()
    const agora = new Date("2026-11-03T15:00:00.000Z")
    const pessoal = { ...acesso, tipo: "pessoal" as const, encerradoEm: null, expiraEm: new Date("2027-01-01") }
    await repo.criar({ ...pessoal, id: "p1" })
    await repo.criar({ ...pessoal, id: "p2", revogadoEm: agora })
    await repo.criar({ ...pessoal, id: "p3", expiraEm: agora })
    await repo.criar({ ...acesso, id: "u1", encerradoEm: null, expiraEm: new Date("2027-01-01") })

    expect(await repo.contarPessoaisAtivas(agora)).toBe(1)
  })
})
