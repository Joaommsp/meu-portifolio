import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CAMINHO_DO_MCP } from "@/lib/mcp/conexao"
import { MAX_CHAVES_PESSOAIS_ATIVAS } from "@/lib/mcp/limites"
import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"
import {
  dependenciasFalsas,
  INICIO,
  requisicaoDoAdmin,
  UID_DO_DONO,
} from "@/server/mcp/dependencias.fake"

const estado = vi.hoisted(() => ({ deps: null as unknown, falha: null as Error | null }))

vi.mock("@/server/mcp/dependencias", () => ({
  obterDependencias: () => {
    if (estado.falha) throw estado.falha
    return estado.deps
  },
}))

const { GET, POST } = await import("./route")

const CAMINHO = "/api/admin/mcp/acessos"
let falsas: ReturnType<typeof dependenciasFalsas>

beforeEach(() => {
  vi.stubEnv("ADMIN_UID", UID_DO_DONO)
  vi.stubEnv("MCP_PUBLIC_URL", "https://portfolio.exemplo/api/mcp")
  falsas = dependenciasFalsas()
  estado.deps = falsas.deps
  estado.falha = null
})

afterEach(() => {
  vi.unstubAllEnvs()
})

const criar = (body: unknown, token?: string | null) =>
  POST(requisicaoDoAdmin(CAMINHO, { method: "POST", body, token }))

describe("GET /api/admin/mcp/acessos (ACESSOS-01)", () => {
  it("200 com pessoais e únicos separados", async () => {
    await criar({ tipo: "pessoal", nome: "Notebook" })
    await criar({ tipo: "unico", recurso: "games", acoes: ["criar"], tarefa: "Cadastrar Hades II" })

    const resposta = await GET(requisicaoDoAdmin(CAMINHO))

    expect(resposta.status).toBe(200)
    const corpo = await resposta.json()
    expect(corpo.pessoais.map((a: { nome: string }) => a.nome)).toEqual(["Notebook"])
    expect(corpo.unicos.map((a: { tarefa: string }) => a.tarefa)).toEqual(["Cadastrar Hades II"])
    expect(corpo.pessoais[0]).toMatchObject({ prefixo: expect.stringMatching(/^pf_pk_/), situacao: "ativo" })
    expect(corpo.enderecoMcp).toBe("https://portfolio.exemplo/api/mcp")
  })

  it("sem MCP_PUBLIC_URL, o endereço do MCP vem da origem da requisição", async () => {
    vi.stubEnv("MCP_PUBLIC_URL", "")

    const corpo = await (await GET(requisicaoDoAdmin(CAMINHO))).json()

    expect(corpo.enderecoMcp).toBe(`http://localhost${CAMINHO_DO_MCP}`)
  })
})

describe("POST /api/admin/mcp/acessos", () => {
  it("201 pessoal com o segredo uma vez e 90 dias por padrão (CHAVE-01, CHAVE-02)", async () => {
    const resposta = await criar({ tipo: "pessoal", nome: "Notebook" })

    expect(resposta.status).toBe(201)
    const corpo = await resposta.json()
    expect(corpo.segredo).toMatch(/^pf_pk_[A-Za-z0-9_-]{43}$/)
    expect(corpo.acesso).toMatchObject({
      tipo: "pessoal",
      nome: "Notebook",
      expiraEm: new Date(INICIO.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
    expect(corpo).not.toHaveProperty("prompt")
    expect(corpo.enderecoMcp).toBe("https://portfolio.exemplo/api/mcp")
  })

  it("201 único com segredo, prompt com URL, Bearer e tarefa, e 2 h de validade (UNICO-01)", async () => {
    const resposta = await criar({
      tipo: "unico",
      recurso: "games",
      acoes: ["ler", "criar"],
      tarefa: "Cadastrar Hades II",
    })

    expect(resposta.status).toBe(201)
    const corpo = await resposta.json()
    expect(corpo.segredo).toMatch(/^pf_uu_[A-Za-z0-9_-]{43}$/)
    expect(corpo.acesso).toMatchObject({
      tipo: "unico",
      escopo: { recurso: "games", itemId: null, acoes: ["ler", "criar"] },
      expiraEm: "2026-11-03T16:00:00.000Z",
    })
    expect(corpo.prompt).toContain("Servidor: https://portfolio.exemplo/api/mcp")
    expect(corpo.prompt).toContain(`Authorization: Bearer ${corpo.segredo}`)
    expect(corpo.prompt).toContain("Tarefa: Cadastrar Hades II")
    expect(corpo.enderecoMcp).toBe("https://portfolio.exemplo/api/mcp")
  })

  it("400 com erro por campo na chave: nome vazio e validade fora de 1, 30, 90", async () => {
    const resposta = await criar({ tipo: "pessoal", nome: "", validadeDias: 7 })

    expect(resposta.status).toBe(400)
    const corpo = await resposta.json()
    expect(corpo.codigo).toBe("VALIDACAO")
    expect(corpo.campos).toEqual({
      nome: "Informe o nome da chave",
      validadeDias: "Validade deve ser 1, 30, 90 dias",
    })
  })

  it("400 com erro por campo no único: sem ação e tarefa vazia", async () => {
    const resposta = await criar({ tipo: "unico", recurso: "games", acoes: [], tarefa: "" })

    expect(resposta.status).toBe(400)
    expect((await resposta.json()).campos).toEqual({
      acoes: "Marque ao menos uma ação",
      tarefa: "Descreva a tarefa",
    })
  })

  it("400 quando o tipo não é pessoal nem unico", async () => {
    const resposta = await criar({ tipo: "outro" })

    expect(resposta.status).toBe(400)
    expect((await resposta.json()).campos).toHaveProperty("tipo")
  })

  it("409 LIMITE_DE_CHAVES na 11ª chave ativa (ACESSOS-06)", async () => {
    for (let i = 0; i < MAX_CHAVES_PESSOAIS_ATIVAS; i++) {
      expect((await criar({ tipo: "pessoal", nome: `Chave ${i}` })).status).toBe(201)
    }

    const resposta = await criar({ tipo: "pessoal", nome: "Uma a mais" })

    expect(resposta.status).toBe(409)
    expect((await resposta.json()).codigo).toBe("LIMITE_DE_CHAVES")
  })
})

describe("guarda e dependência (ACESSOS-05, Edge Cases)", () => {
  it.each([
    ["sem token", null],
    ["token inválido", "invalido"],
  ])("401 %s", async (_caso, token) => {
    const resposta = await GET(requisicaoDoAdmin(CAMINHO, { token }))

    expect(resposta.status).toBe(401)
    expect((await resposta.json()).codigo).toBe("NAO_AUTENTICADO")
  })

  it("403 com token de outro uid, sem criar nada", async () => {
    const resposta = await criar({ tipo: "pessoal", nome: "Intrusa" }, "outro-uid")

    expect(resposta.status).toBe(403)
    expect((await resposta.json()).codigo).toBe("SEM_PERMISSAO")
    expect(falsas.repoAcessos.acessos.size).toBe(0)
  })

  it("503 sem service account", async () => {
    estado.falha = new ServicoNaoConfiguradoError()

    const resposta = await GET(requisicaoDoAdmin(CAMINHO))

    expect(resposta.status).toBe(503)
    expect(await resposta.json()).toEqual({
      codigo: "NAO_CONFIGURADO",
      mensagem: "Servidor MCP não configurado.",
    })
  })

  it("503 FALHA_EXTERNA quando o serviço lança erro inesperado, sem stack nem mensagem interna", async () => {
    vi.spyOn(falsas.deps.acessos, "listar").mockRejectedValue(new Error("DEADLINE_EXCEEDED stack interna"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    const resposta = await GET(requisicaoDoAdmin(CAMINHO))

    expect(resposta.status).toBe(503)
    expect(await resposta.json()).toEqual({
      codigo: "FALHA_EXTERNA",
      mensagem: "Falha ao acessar o banco de dados. Tente de novo.",
    })
  })
})
