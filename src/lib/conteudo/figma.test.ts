import { describe, expect, it } from "vitest"

import { figma } from "./figma"
import { primeiroErro } from "./validacao"

const documento = {
  title: "WaveFlix Movie Site Design",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  url: "https://www.figma.com/community/file/1/waveflix",
  likes: 12,
  users: 200,
  order: 0,
  visible: true,
}

describe("definição de figma", () => {
  it.each(["", "   "])(
    "recusa item sem título (%j) com a mensagem que a página já mostra",
    (title) => {
      const valores = { ...figma.deDocumento(documento), title }

      expect(primeiroErro(figma.schema, valores)).toEqual({
        campo: "title",
        mensagem: "Falta o título",
      })
    }
  )

  it("ida e volta documento → valores → entrada preserva os campos", () => {
    const valores = figma.deDocumento({ ...documento, createdAt: new Date() })

    expect(figma.schema.safeParse(valores).success).toBe(true)
    expect(figma.paraEntrada(valores)).toEqual(documento)
  })
})
