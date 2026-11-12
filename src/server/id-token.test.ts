import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose"
import { beforeAll, describe, expect, it } from "vitest"

import { ServicoNaoConfiguradoError } from "@/server/firebase-admin"

import { verificarIdTokenFirebase } from "./id-token"

const PROJETO = "meu-projeto"
const ENV = { FIREBASE_PROJECT_ID: PROJETO }

let chavePrivada: CryptoKey
let chaves: ReturnType<typeof createLocalJWKSet>

beforeAll(async () => {
  const par = await generateKeyPair("RS256")
  chavePrivada = par.privateKey
  const publica = { ...(await exportJWK(par.publicKey)), kid: "k1", alg: "RS256" }
  chaves = createLocalJWKSet({ keys: [publica] })
})

function token(campos: { iss?: string; aud?: string; sub?: string; exp?: string } = {}) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(campos.iss ?? `https://securetoken.google.com/${PROJETO}`)
    .setAudience(campos.aud ?? PROJETO)
    .setSubject(campos.sub ?? "uid-do-dono")
    .setIssuedAt()
    .setExpirationTime(campos.exp ?? "1h")
    .sign(chavePrivada)
}

describe("verificarIdTokenFirebase (ACESSOS-05)", () => {
  it("token válido do projeto devolve o uid", async () => {
    expect(await verificarIdTokenFirebase(await token(), ENV, chaves)).toBe("uid-do-dono")
  })

  it.each([
    ["emissor de outro projeto", { iss: "https://securetoken.google.com/outro" }],
    ["audiência de outro projeto", { aud: "outro" }],
    ["token vencido", { exp: "-1m" }],
  ])("%s é recusado", async (_caso, campos) => {
    await expect(verificarIdTokenFirebase(await token(campos), ENV, chaves)).rejects.toThrow()
  })

  it("assinatura com outra chave é recusada", async () => {
    const outro = await generateKeyPair("RS256")
    const falso = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer(`https://securetoken.google.com/${PROJETO}`)
      .setAudience(PROJETO)
      .setSubject("uid-do-dono")
      .setExpirationTime("1h")
      .sign(outro.privateKey)
    await expect(verificarIdTokenFirebase(falso, ENV, chaves)).rejects.toThrow()
  })

  it("sem projeto configurado lança ServicoNaoConfiguradoError (503)", async () => {
    await expect(verificarIdTokenFirebase(await token(), {}, chaves)).rejects.toBeInstanceOf(
      ServicoNaoConfiguradoError
    )
  })
})
