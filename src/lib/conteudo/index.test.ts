import { describe, expect, it } from "vitest"

import { BOOK_STATUSES } from "@/types/book"

import { descreverRecurso, RECURSOS } from "./index"
import { NOMES_DE_RECURSO } from "./tipos"

describe("registro dos recursos", () => {
  it("registra os 8 recursos, cada um com a própria definição", () => {
    expect(Object.keys(RECURSOS).sort()).toEqual([...NOMES_DE_RECURSO].sort())
    for (const nome of NOMES_DE_RECURSO) {
      expect(RECURSOS[nome].recurso).toBe(nome)
    }
  })

  it("descreverRecurso(\"livros\") lista status com os valores de BOOK_STATUSES", () => {
    const descricao = descreverRecurso("livros")

    expect(descricao.campos.status).toMatchObject({
      type: "string",
      enum: [...BOOK_STATUSES],
    })
  })
})
