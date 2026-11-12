import "server-only"

import { obterAuth } from "@/server/firebase-admin"
import { repositorioConteudoFirestore } from "@/server/conteudo/repositorio"
import { criarServicoConteudo, type ServicoConteudo } from "@/server/conteudo/servico"
import { subirImagem } from "@/server/imagem"

import { repositorioAcessosFirestore } from "./acessos/repositorio"
import { criarServicoAcessos, type ServicoAcessos } from "./acessos/servico"

/**
 * O que as rotas do MCP e da gestão usam, montado sobre o Firestore. As
 * rotas pedem tudo por aqui; os testes trocam este módulo (`vi.mock`) pelos
 * repositórios em memória. Sem service account, lança
 * `ServicoNaoConfiguradoError` (503).
 */
export type DependenciasMcp = {
  acessos: ServicoAcessos
  conteudo: ServicoConteudo
  subirImagem: typeof subirImagem
  /** Confere o ID token do Firebase e devolve o uid; lança se inválido. */
  verificarIdToken: (token: string) => Promise<string>
}

export function obterDependencias(): DependenciasMcp {
  return {
    acessos: criarServicoAcessos(repositorioAcessosFirestore()),
    conteudo: criarServicoConteudo(repositorioConteudoFirestore()),
    subirImagem,
    verificarIdToken: async (token) => (await obterAuth().verifyIdToken(token)).uid,
  }
}
