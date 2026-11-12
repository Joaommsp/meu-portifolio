import { beforeEach, describe, expect, it, vi } from "vitest"

import { dependenciasFalsas, requisicaoDoAdmin, UID_DO_DONO } from "@/server/mcp/dependencias.fake"

const estado = vi.hoisted(() => ({ deps: null as unknown }))

vi.mock("@/server/mcp/dependencias", () => ({ obterDependencias: () => estado.deps }))

let falsas: ReturnType<typeof dependenciasFalsas>

beforeEach(() => {
  vi.stubEnv("ADMIN_UID", UID_DO_DONO)
  falsas = dependenciasFalsas()
  estado.deps = falsas.deps
})

const { GET } = await import("./route")

const atividade = () => GET(requisicaoDoAdmin("/api/admin/mcp/atividade"))

describe("GET /api/admin/mcp/atividade (AUDIT-02)", () => {
  it("25 registros devolvem os 20 mais recentes, do mais novo para o mais velho", async () => {
    for (let i = 0; i < 25; i++) {
      falsas.relogio.agora = new Date(Date.UTC(2026, 10, 3, 14, 0, i))
      await falsas.deps.acessos.criarUnico({ recurso: "livros", acoes: ["ler"], tarefa: `Tarefa ${i}` })
    }

    const resposta = await atividade()

    expect(resposta.status).toBe(200)
    const registros = (await resposta.json()) as { em: string; acao: string }[]
    expect(registros).toHaveLength(20)
    expect(registros[0]!.em).toBe("2026-11-03T14:00:24.000Z")
    expect(registros[19]!.em).toBe("2026-11-03T14:00:05.000Z")
    expect(registros.map((r) => r.em)).toEqual([...registros.map((r) => r.em)].sort().reverse())
  })

  it("sem registros devolve []", async () => {
    const resposta = await atividade()

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual([])
  })
})
