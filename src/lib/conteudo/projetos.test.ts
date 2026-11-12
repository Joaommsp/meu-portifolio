import { describe, expect, it } from "vitest"

import { projetos } from "./projetos"

/** Documento como o Firestore devolve um projeto concluído. */
const documento = {
  slug: "meu-projeto",
  title: "Meu projeto",
  shortDescription: "Descrição curta do projeto",
  fullDescription: "Descrição completa do projeto com mais de trinta caracteres.",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  gallery: ["https://res.cloudinary.com/x/1.png"],
  technologies: ["Next.js", "Firebase"],
  category: "web",
  liveUrl: null,
  githubUrl: "https://github.com/joao/meu-projeto",
  featured: true,
  status: "concluido",
  // Como o admin grava: meia-noite de Brasília.
  startDate: new Date("2024-03-05T03:00:00.000Z"),
  endDate: new Date("2024-06-30T03:00:00.000Z"),
}

describe("definição de projetos", () => {
  it("ida e volta documento → valores → entrada preserva os campos, com datas YYYY-MM-DD no meio", () => {
    const valores = projetos.deDocumento(documento)

    expect(valores.startDate).toBe("2024-03-05")
    expect(valores.endDate).toBe("2024-06-30")
    expect(valores.liveUrl).toBe("")
    expect(projetos.schema.safeParse(valores).success).toBe(true)

    const entrada = projetos.paraEntrada(valores)
    expect(entrada).toEqual(documento)
  })

  it("recusa projeto concluído sem data de término com a mensagem do schema", () => {
    const valores = { ...projetos.deDocumento(documento), endDate: "" }

    const resultado = projetos.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ["endDate"],
        message: "Projetos concluídos precisam de data de término",
      })
    )
  })

  it("recusa data fora do formato YYYY-MM-DD", () => {
    const valores = { ...projetos.deDocumento(documento), startDate: "05/03/2024" }

    const resultado = projetos.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ["startDate"],
        message: "Data inválida (use AAAA-MM-DD)",
      })
    )
  })
})
