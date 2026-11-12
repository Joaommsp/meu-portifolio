import { describe, expect, it } from "vitest"

import { EMPTY_CURRENTLY } from "@/types/currently"

import { atualmente } from "./atualmente"

const item = { title: "Duna", subtitle: "Frank Herbert", link: "", visible: true }

describe("definição de atualmente", () => {
  it("recusa slot fora de lendo, ouvindo e estudando", () => {
    const valores = { ...atualmente.deDocumento(null), assistindo: item }

    const resultado = atualmente.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({ code: "unrecognized_keys", keys: ["assistindo"] })
    )
  })

  it("documento ausente lê como EMPTY_CURRENTLY (os três slots vazios)", () => {
    expect(atualmente.deDocumento(null)).toEqual({
      lendo: EMPTY_CURRENTLY.lendo,
      ouvindo: EMPTY_CURRENTLY.ouvindo,
      estudando: EMPTY_CURRENTLY.estudando,
    })
  })
})
