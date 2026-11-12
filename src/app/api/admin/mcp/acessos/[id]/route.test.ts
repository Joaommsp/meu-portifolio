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

const { DELETE } = await import("./route")

const apagar = (id: string) =>
  DELETE(requisicaoDoAdmin(`/api/admin/mcp/acessos/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  })

describe("DELETE /api/admin/mcp/acessos/[id]", () => {
  it("204 apaga o acesso inativo e mantém a auditoria dele (ACESSOS-04)", async () => {
    const { acesso } = await falsas.deps.acessos.criarChave({ nome: "Velha" })
    await falsas.deps.acessos.revogar(acesso.id)

    const resposta = await apagar(acesso.id)

    expect(resposta.status).toBe(204)
    expect(falsas.repoAcessos.acessos.has(acesso.id)).toBe(false)
    expect(
      falsas.repoAcessos.auditoria.filter((r) => r.acessoId === acesso.id).map((r) => r.acao)
    ).toEqual(["chave_criada", "revogado", "apagado"])
  })

  it("404 quando o acesso não existe", async () => {
    const resposta = await apagar("nao-existe")

    expect(resposta.status).toBe(404)
    expect((await resposta.json()).codigo).toBe("NAO_ENCONTRADO")
  })

  it("409 ACESSO_ATIVO sem apagar (ACESSOS-03)", async () => {
    const { acesso } = await falsas.deps.acessos.criarChave({ nome: "Ativa" })

    const resposta = await apagar(acesso.id)

    expect(resposta.status).toBe(409)
    expect((await resposta.json()).codigo).toBe("ACESSO_ATIVO")
    expect(falsas.repoAcessos.acessos.has(acesso.id)).toBe(true)
  })
})
