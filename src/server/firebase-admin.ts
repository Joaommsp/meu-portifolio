import "server-only"

import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

/**
 * firebase-admin no servidor: o MCP e as rotas de gestão gravam por aqui.
 * Diferente do SDK cliente, ignora as regras do Firestore, então quem chama
 * é que confere escopo e permissão antes de ler ou gravar.
 *
 * As credenciais vêm da service account (sem `NEXT_PUBLIC_`): nunca chegam
 * ao navegador.
 */

/** Sem service account, as rotas respondem 503 com esta mensagem. */
export class ServicoNaoConfiguradoError extends Error {
  constructor() {
    super("Servidor MCP não configurado.")
    this.name = "ServicoNaoConfiguradoError"
  }
}

type Credencial = {
  projectId: string
  clientEmail: string
  privateKey: string
}

type Ambiente = Record<string, string | undefined>

/**
 * Lê a service account do ambiente. A Vercel guarda a chave numa linha só,
 * com `\n` escapado; o `cert` precisa das quebras de linha de verdade.
 */
export function lerCredencial(env: Ambiente = process.env): Credencial {
  const projectId = env.FIREBASE_PROJECT_ID
  const clientEmail = env.FIREBASE_CLIENT_EMAIL
  const privateKey = env.FIREBASE_PRIVATE_KEY
  if (!projectId || !clientEmail || !privateKey) {
    throw new ServicoNaoConfiguradoError()
  }
  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }
}

/** Init único: o hot reload e as várias rotas reaproveitam o mesmo app. */
function obterApp(): App {
  const existente = getApps()[0]
  if (existente) return existente
  return initializeApp({ credential: cert(lerCredencial()) })
}

export function obterFirestore(): Firestore {
  return getFirestore(obterApp())
}
