import { requireAuth } from "@/lib/firebase/config"
import type { NovaChaveValida, NovoUnicoValido } from "@/lib/mcp/esquemas"
import type {
  AcessoVisto,
  RegistroVisto,
  RespostaDaCriacao,
  RespostaDaLista,
} from "@/lib/mcp/tipos"

/**
 * Cliente das rotas de gestão do MCP (`/api/admin/mcp/...`). Único lugar da
 * tela que conhece esses caminhos. Toda chamada leva o ID token do Firebase
 * e todo erro HTTP vira `ErroApi` com a mensagem do servidor.
 */

const BASE = "/api/admin/mcp"

/** Erro de uma rota de gestão, fiel ao corpo `{ codigo, mensagem, campos? }`. */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly campos: Record<string, string> = {}
  ) {
    super(mensagem)
    this.name = "ErroApi"
  }
}

/** O que a tela manda já completo: a saída dos mesmos schemas do servidor. */
export type NovaChaveEntrada = NovaChaveValida
export type NovoUnicoEntrada = NovoUnicoValido

/** Lista com o endereço do MCP resolvido pelo servidor. */
export type ListaDeAcessos = RespostaDaLista

/** 201 da criação: segredo, endereço do MCP e, no uso único, o prompt pronto. */
export type AcessoCriado = RespostaDaCriacao

const SEM_SESSAO = "Sessão expirada. Entre de novo."
const SEM_CONEXAO = "Sem conexão com o servidor."

async function lerErro(resposta: Response): Promise<ErroApi> {
  const corpo = (await resposta.json().catch(() => null)) as {
    codigo?: unknown
    mensagem?: unknown
    campos?: unknown
  } | null
  const mensagem =
    typeof corpo?.mensagem === "string" ? corpo.mensagem : `Erro ${resposta.status}.`
  const codigo = typeof corpo?.codigo === "string" ? corpo.codigo : "ERRO_HTTP"
  const campos =
    corpo?.campos && typeof corpo.campos === "object"
      ? (corpo.campos as Record<string, string>)
      : {}
  return new ErroApi(resposta.status, codigo, mensagem, campos)
}

async function chamar<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const usuario = requireAuth().currentUser
  if (!usuario) throw new ErroApi(401, "NAO_AUTENTICADO", SEM_SESSAO)
  const token = await usuario.getIdToken()

  let resposta: Response
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ErroApi(0, "SEM_CONEXAO", SEM_CONEXAO)
  }

  if (!resposta.ok) throw await lerErro(resposta)
  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}

export function listarAcessos(): Promise<ListaDeAcessos> {
  return chamar("/acessos")
}

export function criarChave(entrada: NovaChaveEntrada): Promise<AcessoCriado> {
  return chamar("/acessos", {
    method: "POST",
    body: JSON.stringify({ tipo: "pessoal", ...entrada }),
  })
}

export function criarUnico(entrada: NovoUnicoEntrada): Promise<AcessoCriado> {
  return chamar("/acessos", {
    method: "POST",
    body: JSON.stringify({ tipo: "unico", ...entrada }),
  })
}

export function revogarAcesso(id: string): Promise<AcessoVisto> {
  return chamar(`/acessos/${encodeURIComponent(id)}/revogar`, { method: "POST" })
}

export function encerrarAcesso(id: string): Promise<AcessoVisto> {
  return chamar(`/acessos/${encodeURIComponent(id)}/encerrar`, { method: "POST" })
}

export function apagarAcesso(id: string): Promise<void> {
  return chamar(`/acessos/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export function listarAtividade(): Promise<RegistroVisto[]> {
  return chamar("/atividade")
}
