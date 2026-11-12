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

const encerrar = (id: string) =>
  POST(requisicaoDoAdmin(`/api/admin/mcp/acessos/${id}/encerrar`, { method: "POST" }), {
    params: Promise.resolve({ id }),
  })

const novoUnico = () =>
  falsas.deps.acessos.criarUnico({ recurso: "jogando", acoes: ["criar"], tarefa: "Atualizar o jogando" })

describe("POST /api/admin/mcp/acessos/[id]/encerrar (UNICO-06)", () => {
  it("200 grava encerradoEm no único ativo", async () => {
    const { acesso } = await novoUnico()

    const resposta = await encerrar(acesso.id)

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toMatchObject({
      id: acesso.id,
      situacao: "encerrado",
      encerradoEm: "2026-11-03T14:00:00.000Z",
    })
  })

  it("404 quando o acesso não existe", async () => {
    const resposta = await encerrar("nao-existe")

    expect(resposta.status).toBe(404)
    expect((await resposta.json()).codigo).toBe("NAO_ENCONTRADO")
  })

  it("409 ACESSO_INATIVO quando já foi encerrado", async () => {
    const { acesso } = await novoUnico()
    await encerrar(acesso.id)

    const resposta = await encerrar(acesso.id)

    expect(resposta.status).toBe(409)
    expect((await resposta.json()).codigo).toBe("ACESSO_INATIVO")
  })

  it("409 ACAO_INVALIDA na chave pessoal", async () => {
    const { acesso } = await falsas.deps.acessos.criarChave({ nome: "Notebook" })

    const resposta = await encerrar(acesso.id)

    expect(resposta.status).toBe(409)
    expect((await resposta.json()).codigo).toBe("ACAO_INVALIDA")
  })
})
