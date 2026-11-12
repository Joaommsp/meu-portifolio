import type { Recurso } from "@/lib/conteudo/tipos"
import { slugify } from "@/lib/utils"

import { DURACAO_DO_UNICO_HORAS } from "./limites"
import type { AcaoDoUnico } from "./tipos"

/**
 * Textos de conexão mostrados uma vez, no dialog do segredo. Puro: a tela e
 * a rota de criação montam o mesmo texto.
 */

export const CLIENTES_MCP = [
  { id: "claude-code", nome: "Claude Code", onde: "comando no terminal" },
  { id: "claude-desktop", nome: "Claude Desktop", onde: "claude_desktop_config.json" },
  { id: "cursor", nome: "Cursor", onde: ".cursor/mcp.json" },
  { id: "vscode", nome: "VS Code", onde: ".vscode/mcp.json" },
  { id: "codex", nome: "Codex", onde: "~/.codex/config.toml" },
  { id: "windsurf", nome: "Windsurf", onde: "mcp_config.json" },
] as const
export type ClienteMcp = (typeof CLIENTES_MCP)[number]["id"]

/** Nome do servidor MCP: o que ele declara no `initialize` e o padrão no cliente. */
export const NOME_DO_SERVIDOR_MCP = "portfolio"
const NOME_DO_SERVIDOR_DA_TAREFA = `${NOME_DO_SERVIDOR_MCP}-tarefa`

/** Caminho da rota do MCP; o servidor monta o endereço completo. */
export const CAMINHO_DO_MCP = "/api/mcp"

/**
 * Nome da chave vira o nome do servidor no cliente: minúsculo, sem acento nem
 * espaço. O `slugify` descarta pontuação ("." e "_") em vez de trocá-la por
 * hífen; os dois resultados são nomes válidos em todos os clientes, então não
 * há regra própria aqui.
 */
export function nomeDoServidor(nome: string): string {
  return slugify(nome) || NOME_DO_SERVIDOR_MCP
}

const BEARER = /^Bearer\s+(\S+)\s*$/i

/** Token do header `Authorization: Bearer <token>`; `undefined` se não houver. */
export function tokenBearer(header: string | null | undefined): string | undefined {
  return header ? BEARER.exec(header)?.[1] : undefined
}

const json = (valor: unknown) => JSON.stringify(valor, null, 2)

export function configuracaoDoCliente(
  cliente: ClienteMcp,
  nome: string,
  url: string,
  segredo: string
): string {
  const servidor = nomeDoServidor(nome)
  const bearer = `Bearer ${segredo}`
  switch (cliente) {
    case "claude-code":
      return `claude mcp add --transport http ${servidor} ${url} \\\n  --header "Authorization: ${bearer}"`
    case "claude-desktop":
      // O mcp-remote orienta o header por variável de ambiente: espaço dentro
      // de `args` é escapado errado no Windows.
      return json({
        mcpServers: {
          [servidor]: {
            command: "npx",
            args: ["mcp-remote", url, "--header", "Authorization:${AUTH_HEADER}"],
            env: { AUTH_HEADER: bearer },
          },
        },
      })
    case "cursor":
      return json({ mcpServers: { [servidor]: { url, headers: { Authorization: bearer } } } })
    case "vscode":
      return json({
        servers: { [servidor]: { type: "http", url, headers: { Authorization: bearer } } },
      })
    case "codex":
      return `[mcp_servers.${servidor}]\nurl = "${url}"\nhttp_headers = { Authorization = "${bearer}" }`
    case "windsurf":
      return json({
        mcpServers: { [servidor]: { serverUrl: url, headers: { Authorization: bearer } } },
      })
  }
}

export type DadosDoPrompt = {
  url: string
  segredo: string
  recurso: Recurso
  /** Item fixo do escopo, quando houver. */
  itemId?: string | null
  acoes: readonly AcaoDoUnico[]
  tarefa: string
}

/** Prompt pronto do acesso de uso único: conexão, escopo e tarefa num texto só. */
export function promptDeUsoUnico(dados: DadosDoPrompt): string {
  const { url, segredo, recurso, itemId, acoes, tarefa } = dados
  const bearer = `Bearer ${segredo}`
  const chamada = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "descrever_recurso", arguments: { recurso } },
  })
  const escopo = itemId ? `${recurso} (item ${itemId})` : recurso
  return `Você tem acesso temporário (${DURACAO_DO_UNICO_HORAS} h) ao conteúdo do meu portfólio por MCP.

Servidor: ${url}
Authorization: ${bearer}

Se você é o Claude Code, conecte com:
claude mcp add --transport http ${NOME_DO_SERVIDOR_DA_TAREFA} ${url} --header "Authorization: ${bearer}"

Sem suporte a MCP, chame por HTTP:
curl -X POST ${url} -H "Authorization: ${bearer}" -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '${chamada}'

Escopo: ${escopo}, ações ${acoes.join(", ")}.
Tarefa: ${tarefa}

Antes de gravar, chame descrever_recurso. Para imagem, use subir_imagem com a URL. Ao terminar, chame concluir_tarefa.`
}
