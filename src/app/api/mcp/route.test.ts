import { beforeEach, describe, expect, it, vi } from "vitest"

import { MAX_BYTES_DO_CORPO, MAX_CHAMADAS_POR_MINUTO } from "@/lib/mcp/limites"
import { RepositorioConteudoEmMemoria } from "@/server/conteudo/memoria"
import { criarServicoConteudo } from "@/server/conteudo/servico"
import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"
import { RepositorioAcessosEmMemoria } from "@/server/mcp/acessos/memoria"
import { criarServicoAcessos } from "@/server/mcp/acessos/servico"
import type { DependenciasMcp } from "@/server/mcp/dependencias"

const estado = vi.hoisted(() => ({
  deps: null as unknown,
  falha: null as Error | null,
}))

vi.mock("@/server/mcp/dependencias", () => ({
  obterDependencias: () => {
    if (estado.falha) throw estado.falha
    return estado.deps
  },
}))

const { DELETE, GET, POST } = await import("./route")

const INICIO = new Date("2026-11-03T14:00:00.000Z")
const relogio = { agora: INICIO }
let acessos: DependenciasMcp["acessos"]

beforeEach(() => {
  relogio.agora = INICIO
  estado.falha = null
  acessos = criarServicoAcessos(new RepositorioAcessosEmMemoria(), () => relogio.agora)
  estado.deps = {
    acessos,
    conteudo: criarServicoConteudo(new RepositorioConteudoEmMemoria(() => relogio.agora)),
    subirImagem: async () => ({ url: "", largura: 0, altura: 0, bytes: 0 }),
    verificarIdToken: async () => "",
  } satisfies DependenciasMcp
})

const LISTAR_FERRAMENTAS = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })

function post(authorization: string | null, corpo: string = LISTAR_FERRAMENTAS, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    ...extra,
  }
  if (authorization) headers.authorization = authorization
  return POST(new Request("http://localhost/api/mcp", { method: "POST", headers, body: corpo }))
}

const ACESSO_INVALIDO = { codigo: "NAO_AUTENTICADO", mensagem: "Acesso inválido ou expirado." }

describe("POST /api/mcp", () => {
  it("200: chave ativa recebe a resposta do protocolo (MCP-04)", async () => {
    const { segredo } = await acessos.criarChave({ nome: "Notebook" })

    const resposta = await post(`Bearer ${segredo}`)

    expect(resposta.status).toBe(200)
    const { result } = (await resposta.json()) as { result: { tools: { name: string }[] } }
    expect(result.tools).toHaveLength(7)
  })

  it("401 com a mesma mensagem: sem header, inexistente, revogada, vencida e encerrada (MCP-11)", async () => {
    const revogada = await acessos.criarChave({ nome: "Revogada" })
    await acessos.revogar(revogada.acesso.id)
    const encerrado = await acessos.criarUnico({ recurso: "livros", acoes: ["ler"], tarefa: "Ler" })
    await acessos.encerrar(encerrado.acesso.id)
    const vencida = await acessos.criarChave({ nome: "Vencida", validadeDias: 1 })
    relogio.agora = new Date(INICIO.getTime() + 25 * 60 * 60 * 1000)

    const respostas = [
      await post(null),
      await post("Bearer pf_pk_naoexiste"),
      await post(`Bearer ${revogada.segredo}`),
      await post(`Bearer ${vencida.segredo}`),
      await post(`Bearer ${encerrado.segredo}`),
    ]

    for (const resposta of respostas) {
      expect(resposta.status).toBe(401)
      expect(await resposta.json()).toEqual(ACESSO_INVALIDO)
    }
  })

  it("413: Content-Length acima de 4 MB, antes de autenticar", async () => {
    const resposta = await post(null, LISTAR_FERRAMENTAS, {
      "content-length": String(MAX_BYTES_DO_CORPO + 1),
    })

    expect(resposta.status).toBe(413)
    expect(await resposta.json()).toMatchObject({ codigo: "CORPO_GRANDE" })
  })

  // O SDK também devolve 413 acima de 4 MiB, mas em JSON-RPC: `codigo` prova que é o nosso.
  it.each<[string, Record<string, string>]>([
    ["sem Content-Length", {}],
    ["com Content-Length menor que o real", { "content-length": "10" }],
  ])("413 CORPO_GRANDE: corpo lido acima de 4 MB %s", async (_caso, extra) => {
    const { segredo } = await acessos.criarChave({ nome: "Notebook" })

    const resposta = await post(`Bearer ${segredo}`, "x".repeat(MAX_BYTES_DO_CORPO + 1), extra)

    expect(resposta.status).toBe(413)
    expect(await resposta.json()).toMatchObject({ codigo: "CORPO_GRANDE" })
  })

  it("429 na chamada 121 do minuto e volta no minuto seguinte (MCP-14)", async () => {
    const { segredo } = await acessos.criarChave({ nome: "Notebook" })
    for (let i = 0; i < MAX_CHAMADAS_POR_MINUTO; i++) {
      expect((await post(`Bearer ${segredo}`)).status).toBe(200)
    }

    const excedente = await post(`Bearer ${segredo}`)
    relogio.agora = new Date(INICIO.getTime() + 60_000)
    const seguinte = await post(`Bearer ${segredo}`)

    expect(excedente.status).toBe(429)
    expect(await excedente.json()).toMatchObject({ codigo: "LIMITE_DE_CHAMADAS" })
    expect(seguinte.status).toBe(200)
  })

  it("503 sem service account, com a mensagem e sem stack", async () => {
    estado.falha = new ServicoNaoConfiguradoError()

    const resposta = await post("Bearer pf_pk_qualquer")

    expect(resposta.status).toBe(503)
    expect(await resposta.json()).toEqual({
      codigo: "NAO_CONFIGURADO",
      mensagem: "Servidor MCP não configurado.",
    })
  })
})

describe("GET e DELETE /api/mcp (MCP-12)", () => {
  it.each([
    ["GET", GET],
    ["DELETE", DELETE],
  ])("%s responde 405", async (_metodo, handler) => {
    const resposta = handler()

    expect(resposta.status).toBe(405)
    expect(resposta.headers.get("Allow")).toBe("POST")
  })
})
