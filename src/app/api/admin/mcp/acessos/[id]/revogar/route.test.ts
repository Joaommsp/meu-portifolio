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

const { POST } = await import("./route")

const revogar = (id: string) =>
  POST(requisicaoDoAdmin(`/api/admin/mcp/acessos/${id}/revogar`, { method: "POST" }), {
    params: Promise.resolve({ id }),
  })

describe("POST /api/admin/mcp/acessos/[id]/revogar (ACESSOS-02)", () => {
  it("200 grava revogadoEm e a chave recebe inválido no autenticar seguinte", async () => {
    const { acesso, segredo } = await falsas.deps.acessos.criarChave({ nome: "Notebook" })

    const resposta = await revogar(acesso.id)

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toMatchObject({
      id: acesso.id,
      situacao: "revogado",
      revogadoEm: "2026-11-03T14:00:00.000Z",
    })
    expect(await falsas.deps.acessos.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })

  it("404 quando o acesso não existe", async () => {
    const resposta = await revogar("nao-existe")

    expect(resposta.status).toBe(404)
    expect((await resposta.json()).codigo).toBe("NAO_ENCONTRADO")
  })

  it("409 ACESSO_INATIVO quando já foi revogado", async () => {
    const { acesso } = await falsas.deps.acessos.criarChave({ nome: "Notebook" })
    await revogar(acesso.id)

    const resposta = await revogar(acesso.id)

    expect(resposta.status).toBe(409)
    expect((await resposta.json()).codigo).toBe("ACESSO_INATIVO")
  })
})
