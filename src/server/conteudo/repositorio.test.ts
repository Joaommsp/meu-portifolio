import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { describe, expect, it } from "vitest"

import { AGORA } from "@/lib/conteudo/tipos"

import { RepositorioConteudoEmMemoria } from "./memoria"
import { paraDocumento, paraItem, type RepositorioConteudo } from "./repositorio"

const carimbo = FieldValue.serverTimestamp()

describe("repositório de conteúdo: conversões", () => {
  it("grava Date como Timestamp e carimba createdAt e updatedAt ao criar", () => {
    const inicio = new Date("2024-03-05T03:00:00.000Z")
    const doc = paraDocumento({ title: "X", startDate: inicio }, {}, "criar")

    expect(doc.startDate).toBeInstanceOf(Timestamp)
    expect((doc.startDate as Timestamp).toDate().toISOString()).toBe(
      "2024-03-05T03:00:00.000Z"
    )
    expect(carimbo.isEqual(doc.createdAt)).toBe(true)
    expect(carimbo.isEqual(doc.updatedAt)).toBe(true)
  })

  it("ao atualizar carimba só updatedAt", () => {
    const doc = paraDocumento({ title: "X" }, {}, "atualizar")

    expect(doc).not.toHaveProperty("createdAt")
    expect(carimbo.isEqual(doc.updatedAt)).toBe(true)
  })

  it("troca AGORA dos derivados pelo carimbo, mas não um campo de texto igual a 'agora'", () => {
    const doc = paraDocumento(
      { title: AGORA },
      { publishedAt: AGORA, readingTime: 3 },
      "criar"
    )

    expect(carimbo.isEqual(doc.publishedAt)).toBe(true)
    expect(doc.title).toBe("agora")
    expect(doc.readingTime).toBe(3)
  })

  it("devolve datas em ISO, inclusive dentro de objetos, com o id", () => {
    const ts = Timestamp.fromDate(new Date("2026-11-03T12:00:00.000Z"))
    const item = paraItem("abc", {
      title: "Livro",
      updatedAt: ts,
      lendo: { desde: ts },
      datas: [ts],
    })

    expect(item).toEqual({
      id: "abc",
      title: "Livro",
      updatedAt: "2026-11-03T12:00:00.000Z",
      lendo: { desde: "2026-11-03T12:00:00.000Z" },
      datas: ["2026-11-03T12:00:00.000Z"],
    })
  })
})

describe("repositório de conteúdo: fake em memória cumpre a interface", () => {
  const agora = new Date("2026-11-03T12:00:00.000Z")
  const novo = (): RepositorioConteudo => new RepositorioConteudoEmMemoria(() => agora)

  it("listar sem itens devolve lista vazia, sem erro", async () => {
    await expect(novo().listar("livros")).resolves.toEqual({
      itens: [],
      proximoCursor: null,
    })
  })

  it("listar com mais de 50 itens devolve 50 por página com cursor para a próxima", async () => {
    const repo = novo()
    for (let i = 0; i < 51; i++) {
      await repo.criar("figma", { title: `F${i}`, order: i })
    }

    const primeira = await repo.listar("figma")
    expect(primeira.itens).toHaveLength(50)
    expect(primeira.itens[0]?.title).toBe("F0")
    expect(primeira.proximoCursor).toBe(primeira.itens[49]?.id)

    const segunda = await repo.listar("figma", { cursor: primeira.proximoCursor! })
    expect(segunda.itens.map((i) => i.title)).toEqual(["F50"])
    expect(segunda.proximoCursor).toBeNull()
  })

  it("criar devolve o item com createdAt/updatedAt do servidor e AGORA resolvido", async () => {
    const item = await novo().criar("posts", { title: "P" }, { publishedAt: AGORA })

    expect(item).toMatchObject({
      title: "P",
      publishedAt: agora.toISOString(),
      createdAt: agora.toISOString(),
      updatedAt: agora.toISOString(),
    })
  })

  it("slugEmUso ignora o próprio item", async () => {
    const repo = novo()
    const item = await repo.criar("livros", { slug: "duna" })

    expect(await repo.slugEmUso("livros", "duna")).toBe(true)
    expect(await repo.slugEmUso("livros", "duna", item.id)).toBe(false)
  })
})
