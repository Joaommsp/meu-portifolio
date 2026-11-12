import { describe, expect, it } from "vitest"

import { uses } from "./uses"

const item = {
  name: "VS Code",
  description: "Editor do dia a dia.",
  url: "https://code.visualstudio.com",
  starred: true,
}

const documento = {
  title: "Software",
  description: "O que fica aberto o dia inteiro",
  items: [item],
  order: 0,
  visible: true,
}

describe("definição de uses", () => {
  it("recusa item sem nome", () => {
    const valores = {
      ...uses.deDocumento(documento),
      items: [{ ...item, name: "  " }],
    }

    const resultado = uses.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({ path: ["items", 0, "name"], message: "Item sem nome" })
    )
  })

  it("documento antigo sem items lê como lista vazia", () => {
    const antigo = { title: "Software", description: "", order: 0, visible: true }

    expect(uses.deDocumento(antigo).items).toEqual([])
  })

  it("ida e volta documento → valores → entrada preserva os campos", () => {
    const valores = uses.deDocumento({ ...documento, createdAt: new Date() })

    expect(uses.schema.safeParse(valores).success).toBe(true)
    expect(uses.paraEntrada(valores)).toEqual(documento)
  })
})
