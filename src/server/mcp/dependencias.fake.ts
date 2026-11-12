import "server-only"

import { RepositorioConteudoEmMemoria } from "@/server/conteudo/memoria"
import { criarServicoConteudo } from "@/server/conteudo/servico"

import { RepositorioAcessosEmMemoria } from "./acessos/memoria"
import { criarServicoAcessos } from "./acessos/servico"
import type { DependenciasMcp } from "./dependencias"

/**
 * Dependências em memória para os testes das rotas de gestão. O ID token
 * falso é o próprio uid; "invalido" lança como o firebase-admin.
 */

export const UID_DO_DONO = "uid-do-dono"
export const INICIO = new Date("2026-11-03T14:00:00.000Z")

export function dependenciasFalsas() {
  const relogio = { agora: INICIO }
  const repoAcessos = new RepositorioAcessosEmMemoria()
  const deps: DependenciasMcp = {
    acessos: criarServicoAcessos(repoAcessos, () => relogio.agora),
    conteudo: criarServicoConteudo(new RepositorioConteudoEmMemoria(() => relogio.agora)),
    subirImagem: async () => ({ url: "", largura: 0, altura: 0, bytes: 0 }),
    verificarIdToken: async (token) => {
      if (token === "invalido") throw new Error("auth/argument-error")
      return token
    },
  }
  return { deps, repoAcessos, relogio }
}

/** Requisição do dono (ou de quem `token` disser) para uma rota de gestão. */
export function requisicaoDoAdmin(
  caminho: string,
  init: { method?: string; body?: unknown; token?: string | null } = {}
): Request {
  const { method = "GET", body, token = UID_DO_DONO } = init
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (token) headers.authorization = `Bearer ${token}`
  return new Request(`http://localhost${caminho}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
