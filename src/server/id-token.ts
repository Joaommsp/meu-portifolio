import "server-only"

import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose"

import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"

/**
 * Confere o ID token do Firebase Auth sem o `firebase-admin/auth`, que na
 * Vercel não carrega (o `jwks-rsa` dele faz `require` do `jose`, que é só
 * ESM, e derruba a rota inteira). Mesma verificação que a doc do Firebase
 * descreve para bibliotecas de JWT: assinatura pelas chaves públicas do
 * Google, emissor e audiência do projeto, `sub` não vazio.
 */

const CHAVES_DO_FIREBASE_AUTH =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"

/** Criado uma vez: o `jose` guarda as chaves em cache entre requisições. */
let chavesRemotas: JWTVerifyGetKey | null = null

type Ambiente = Record<string, string | undefined>

/** Devolve o uid do token; lança se a assinatura, o emissor, a audiência ou a validade falharem. */
export async function verificarIdTokenFirebase(
  token: string,
  env: Ambiente = process.env,
  chaves: JWTVerifyGetKey = (chavesRemotas ??= createRemoteJWKSet(new URL(CHAVES_DO_FIREBASE_AUTH)))
): Promise<string> {
  const projeto = env.FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projeto) throw new ServicoNaoConfiguradoError()

  const { payload } = await jwtVerify(token, chaves, {
    issuer: `https://securetoken.google.com/${projeto}`,
    audience: projeto,
    algorithms: ["RS256"],
  })
  if (typeof payload.sub !== "string" || payload.sub === "") {
    throw new Error("ID token sem uid.")
  }
  return payload.sub
}
