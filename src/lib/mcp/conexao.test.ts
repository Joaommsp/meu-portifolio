import { describe, expect, it } from "vitest"

import { CLIENTES_MCP, configuracaoDoCliente, promptDeUsoUnico } from "./conexao"

const URL_MCP = "https://exemplo.vercel.app/api/mcp"
const PESSOAL = `pf_pk_${"a".repeat(43)}`
const UNICO = `pf_uu_${"b".repeat(43)}`

describe("configuração dos clientes (CHAVE-01)", () => {
  it("são 6 clientes: Claude Code, Claude Desktop, Cursor, VS Code, Codex e Windsurf", () => {
    expect(CLIENTES_MCP.map((c) => c.nome)).toEqual([
      "Claude Code",
      "Claude Desktop",
      "Cursor",
      "VS Code",
      "Codex",
      "Windsurf",
    ])
  })

  it.each(CLIENTES_MCP.map((c) => c.id))("%s contém a URL e o Bearer", (cliente) => {
    const texto = configuracaoDoCliente(cliente, "Notebook casa", URL_MCP, PESSOAL)

    expect(texto).toContain(URL_MCP)
    expect(texto).toContain(`Bearer ${PESSOAL}`)
  })

  it("Claude Code vira o comando claude mcp add com o nome da chave sem acento nem espaço", () => {
    expect(configuracaoDoCliente("claude-code", "Notebook do João", URL_MCP, PESSOAL)).toBe(
      `claude mcp add --transport http notebook-do-joao ${URL_MCP} \\\n  --header "Authorization: Bearer ${PESSOAL}"`
    )
  })
})

describe("prompt do uso único (UNICO-01)", () => {
  const prompt = promptDeUsoUnico({
    url: URL_MCP,
    segredo: UNICO,
    recurso: "games",
    acoes: ["ler", "criar"],
    tarefa: 'Cadastrar "Hades II" com capa da Steam.',
  })

  it("traz URL do MCP e Bearer", () => {
    expect(prompt).toContain(`Servidor: ${URL_MCP}`)
    expect(prompt).toContain(`Authorization: Bearer ${UNICO}`)
  })

  it("traz o comando de conexão do Claude Code", () => {
    expect(prompt).toContain(
      `claude mcp add --transport http portfolio-tarefa ${URL_MCP} --header "Authorization: Bearer ${UNICO}"`
    )
  })

  it("traz o curl de tools/call com os dois Accept", () => {
    expect(prompt).toContain(`curl -X POST ${URL_MCP}`)
    expect(prompt).toContain('-H "Accept: application/json, text/event-stream"')
    expect(prompt).toContain('"method":"tools/call"')
  })

  it("traz o escopo e a tarefa", () => {
    expect(prompt).toContain("Escopo: games, ações ler, criar.")
    expect(prompt).toContain('Tarefa: Cadastrar "Hades II" com capa da Steam.')
  })
})
