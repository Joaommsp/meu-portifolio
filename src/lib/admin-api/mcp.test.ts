import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getIdToken = vi.fn(async () => "token-do-admin")
let usuario: { getIdToken: typeof getIdToken } | null = { getIdToken }

vi.mock("@/lib/firebase/config", () => ({
  requireAuth: () => ({ currentUser: usuario }),
}))

const { ErroApi, apagarAcesso, criarChave, listarAcessos, revogarAcesso } =
  await import("./mcp")

const fetchSimulado = vi.fn<typeof fetch>()

beforeEach(() => {
  usuario = { getIdToken }
  vi.stubGlobal("fetch", fetchSimulado)
})

afterEach(() => {
  fetchSimulado.mockReset()
  vi.unstubAllGlobals()
})

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  })

describe("cliente da API de gestão do MCP", () => {
  it("envia o ID token e devolve o corpo", async () => {
    const lista = { pessoais: [], unicos: [], enderecoMcp: "https://portfolio.exemplo/api/mcp" }
    fetchSimulado.mockResolvedValueOnce(json(lista))

    await expect(listarAcessos()).resolves.toEqual(lista)

    const [url, init] = fetchSimulado.mock.calls[0]!
    expect(url).toBe("/api/admin/mcp/acessos")
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer token-do-admin"
    )
  })

  it("cria chave com tipo pessoal no corpo", async () => {
    fetchSimulado.mockResolvedValueOnce(json({ acesso: {}, segredo: "pf_pk_x" }, 201))

    await criarChave({ nome: "Notebook", validadeDias: 30 })

    const [, init] = fetchSimulado.mock.calls[0]!
    expect(init?.method).toBe("POST")
    expect(JSON.parse(String(init?.body))).toEqual({
      tipo: "pessoal",
      nome: "Notebook",
      validadeDias: 30,
    })
  })

  it("erro HTTP vira ErroApi com a mensagem, o código e os campos do servidor", async () => {
    fetchSimulado.mockResolvedValueOnce(
      json(
        { codigo: "VALIDACAO", mensagem: "Dados inválidos.", campos: { nome: "Informe o nome da chave" } },
        400
      )
    )

    const erro = await criarChave({ nome: "", validadeDias: 90 }).catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ErroApi)
    expect(erro).toMatchObject({
      status: 400,
      codigo: "VALIDACAO",
      message: "Dados inválidos.",
      campos: { nome: "Informe o nome da chave" },
    })
  })

  it("409 do servidor mantém o código estável", async () => {
    fetchSimulado.mockResolvedValueOnce(
      json({ codigo: "ACESSO_INATIVO", mensagem: "O acesso já está inativo." }, 409)
    )

    await expect(revogarAcesso("abc")).rejects.toMatchObject({
      status: 409,
      codigo: "ACESSO_INATIVO",
      message: "O acesso já está inativo.",
    })
  })

  it("corpo de erro que não é JSON vira mensagem com o status", async () => {
    fetchSimulado.mockResolvedValueOnce(new Response("<html>", { status: 502 }))

    await expect(listarAcessos()).rejects.toMatchObject({
      status: 502,
      codigo: "ERRO_HTTP",
      message: "Erro 502.",
    })
  })

  it("204 resolve sem corpo", async () => {
    fetchSimulado.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(apagarAcesso("abc")).resolves.toBeUndefined()
    expect(fetchSimulado.mock.calls[0]![0]).toBe("/api/admin/mcp/acessos/abc")
  })

  it("sem usuário logado não chama a rede", async () => {
    usuario = null

    await expect(listarAcessos()).rejects.toMatchObject({
      status: 401,
      codigo: "NAO_AUTENTICADO",
    })
    expect(fetchSimulado).not.toHaveBeenCalled()
  })

  it("falha de rede vira ErroApi legível", async () => {
    fetchSimulado.mockRejectedValueOnce(new TypeError("Failed to fetch"))

    await expect(listarAcessos()).rejects.toMatchObject({
      status: 0,
      codigo: "SEM_CONEXAO",
      message: "Sem conexão com o servidor.",
    })
  })
})
