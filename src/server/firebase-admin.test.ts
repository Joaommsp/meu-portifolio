import { afterEach, describe, expect, it, vi } from "vitest"

import {
  lerCredencial,
  obterFirestore,
  ServicoNaoConfiguradoError,
} from "./firebase-admin"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("firebase-admin", () => {
  it("sem as variáveis da service account lança ServicoNaoConfiguradoError", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "")
    vi.stubEnv("FIREBASE_CLIENT_EMAIL", "")
    vi.stubEnv("FIREBASE_PRIVATE_KEY", "")

    expect(() => obterFirestore()).toThrow(ServicoNaoConfiguradoError)
    expect(() => obterFirestore()).toThrow("Servidor MCP não configurado.")
  })

  it("restaura as quebras de linha da chave que vem com \n escapado", () => {
    const credencial = lerCredencial({
      FIREBASE_PROJECT_ID: "projeto",
      FIREBASE_CLIENT_EMAIL: "conta@projeto.iam.gserviceaccount.com",
      // Como a Vercel entrega: barra invertida + n, não quebra de linha.
      FIREBASE_PRIVATE_KEY:
        "-----BEGIN PRIVATE KEY-----\\nABC\\nDEF\\n-----END PRIVATE KEY-----\\n",
    })

    expect(credencial.privateKey).toBe(
      "-----BEGIN PRIVATE KEY-----\nABC\nDEF\n-----END PRIVATE KEY-----\n"
    )
  })
})
