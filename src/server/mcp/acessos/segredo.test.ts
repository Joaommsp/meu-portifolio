import { createHash } from "node:crypto"

import { describe, expect, it } from "vitest"

import { gerarSegredo, hashDoSegredo } from "./segredo"

describe("segredo do acesso", () => {
  it.each([
    ["pessoal", /^pf_pk_[A-Za-z0-9_-]{43}$/],
    ["unico", /^pf_uu_[A-Za-z0-9_-]{43}$/],
  ] as const)("%s: prefixo do tipo + 43 caracteres base64url (CHAVE-01, UNICO-01)", (tipo, formato) => {
    const { segredo } = gerarSegredo(tipo)

    expect(segredo).toMatch(formato)
  })

  it("hash é o sha256 hex de 64 caracteres e o prefixo é o tipo + 4 caracteres (CHAVE-03)", () => {
    const { segredo, hash, prefixo } = gerarSegredo("pessoal")

    expect(hash).toBe(createHash("sha256").update(segredo).digest("hex"))
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hashDoSegredo(segredo)).toBe(hash)
    expect(prefixo).toBe(segredo.slice(0, 10))
    expect(prefixo).toMatch(/^pf_pk_.{4}$/)
  })

  it("dois segredos gerados são diferentes", () => {
    expect(gerarSegredo("unico").segredo).not.toBe(gerarSegredo("unico").segredo)
  })
})
