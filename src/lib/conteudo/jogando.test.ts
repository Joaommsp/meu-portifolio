import { describe, expect, it } from "vitest"

import { jogando } from "./jogando"

const documento = {
  title: "Forza Horizon 6",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  synopsis: "O Horizon Festival no Japão.",
  genres: ["Corrida", "Mundo aberto"],
  platform: "PC",
  status: "jogando",
  order: 0,
  visible: true,
}

describe("definição de jogando", () => {
  it("recusa status fora de PLAYING_STATUS", () => {
    const valores = { ...jogando.deDocumento(documento), status: "concluido" }

    const resultado = jogando.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({ path: ["status"], message: "Status inválido" })
    )
  })

  it("ida e volta documento → valores → entrada preserva os campos", () => {
    const valores = jogando.deDocumento({ ...documento, createdAt: new Date() })

    expect(jogando.schema.safeParse(valores).success).toBe(true)
    expect(jogando.paraEntrada(valores)).toEqual(documento)
  })
})
