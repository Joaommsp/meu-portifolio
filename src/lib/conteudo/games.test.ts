import { describe, expect, it } from "vitest"

import { games } from "./games"

/** Documento como o Firestore devolve um jogo. */
const documento = {
  slug: "hollow-knight",
  title: "Hollow Knight",
  shortDescription: "Metroidvania num reino de insetos",
  history: "Um cavaleiro sem nome desce ao reino caído de Hallownest.",
  whyILikeIt: "Exploração sem mão na cabeça e chefes que ensinam a jogar.",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  gallery: ["https://res.cloudinary.com/x/1.png"],
  platforms: ["PC", "Nintendo Switch"],
  genres: ["metroidvania"],
  status: "concluido",
  yearPlayed: 2022,
  hoursPlayed: 60,
  rating: null,
  featured: true,
  published: true,
}

describe("definição de games", () => {
  it("ida e volta documento → valores → entrada preserva os campos", () => {
    const valores = games.deDocumento({ ...documento, id: "abc", createdAt: new Date() })

    expect(games.schema.safeParse(valores).success).toBe(true)
    expect(games.paraEntrada(valores)).toEqual(documento)
  })

  it("recusa platforms vazio com a mensagem do schema", () => {
    const valores = { ...games.deDocumento(documento), platforms: [] }

    const resultado = games.schema.safeParse(valores)

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ["platforms"],
        message: "Adicione pelo menos uma plataforma",
      })
    )
  })
})
