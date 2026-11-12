import { describe, expect, it } from "vitest"

import { livros } from "./livros"

/** Documento como o Firestore devolve um livro. */
const documento = {
  slug: "dom-casmurro",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  shortDescription: "Capitu traiu ou não traiu?",
  synopsis: "Bentinho conta a própria história e a de Capitu, do namoro ao ciúme.",
  whyILikeIt: "O narrador não confiável mais bem feito da literatura brasileira.",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  genres: ["romance", "clássico"],
  status: "lido",
  yearRead: 2023,
  pages: 256,
  rating: 9.5,
  featured: false,
  published: true,
}

describe("definição de livros", () => {
  it("ida e volta documento → valores → entrada preserva os campos", () => {
    const valores = livros.deDocumento({ ...documento, id: "abc", createdAt: new Date() })

    expect(livros.schema.safeParse(valores).success).toBe(true)
    expect(livros.paraEntrada(valores)).toEqual(documento)
  })

  it.each([11, -1])("recusa rating %s, fora de 0..10", (rating) => {
    const valores = { ...livros.deDocumento(documento), rating }

    const resultado = livros.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((i) => i.path)).toContainEqual(["rating"])
  })
})
