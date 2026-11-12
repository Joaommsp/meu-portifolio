import { describe, expect, it } from "vitest"

import { posts } from "./posts"
import { AGORA } from "./tipos"

const entrada = {
  slug: "meu-post",
  title: "Meu post",
  excerpt: "Resumo do post com mais de dez caracteres",
  content: "palavra ".repeat(60),
  coverImage: "https://res.cloudinary.com/x/capa.png",
  category: "tutorial" as const,
  tags: ["next"],
  published: true,
  featured: false,
}

const derivados = posts.derivados!

describe("definição de posts: campos derivados", () => {
  it("publicar pela primeira vez ao criar marca publishedAt como agora", () => {
    expect(derivados(entrada, null).publishedAt).toBe(AGORA)
  })

  it("publicar pela primeira vez um rascunho existente marca publishedAt como agora", () => {
    const atual = { ...entrada, published: false, publishedAt: null }

    expect(derivados({ published: true }, atual).publishedAt).toBe(AGORA)
  })

  it("post já publicado mantém o publishedAt (o campo não é regravado)", () => {
    const atual = { ...entrada, publishedAt: new Date(2025, 0, 10) }

    expect(derivados({ ...entrada, published: true }, atual)).not.toHaveProperty(
      "publishedAt"
    )
  })

  it("despublicar zera o publishedAt", () => {
    const atual = { ...entrada, publishedAt: new Date(2025, 0, 10) }

    expect(derivados({ published: false }, atual).publishedAt).toBeNull()
  })

  it("recalcula readingTime quando o content muda (~200 palavras por minuto)", () => {
    const atual = { ...entrada, readingTime: 1, publishedAt: new Date() }
    const conteudoNovo = "palavra ".repeat(401)

    expect(derivados({ content: conteudoNovo }, atual).readingTime).toBe(3)
  })
})
