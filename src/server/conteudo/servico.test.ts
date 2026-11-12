import { describe, expect, it, vi } from "vitest"

import type { EscopoDoUnico } from "@/lib/mcp/tipos"

import { RepositorioConteudoEmMemoria } from "./memoria"
import { criarServicoConteudo, type AcaoConteudo } from "./servico"

const AGORA = new Date("2026-11-03T12:00:00.000Z")

const livro = {
  slug: "dom-casmurro",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  shortDescription: "Capitu traiu ou não traiu?",
  synopsis: "Bentinho conta a própria história e a de Capitu, do namoro ao ciúme.",
  whyILikeIt: "O narrador não confiável mais bem feito da literatura brasileira.",
  coverImage: "https://res.cloudinary.com/x/capa.png",
  genres: ["romance"],
  status: "lido",
  yearRead: 2023,
  pages: 256,
  rating: 9.5,
  featured: false,
  published: true,
}

function montar() {
  const repo = new RepositorioConteudoEmMemoria(() => AGORA)
  return { repo, servico: criarServicoConteudo(repo) }
}

async function comLivro() {
  const m = montar()
  m.repo.semear("livros", "l1", { ...livro, createdAt: new Date("2026-01-01T00:00:00.000Z") })
  return m
}

describe("serviço de conteúdo: gravação (MCP-06, MCP-07)", () => {
  it("criar com dados válidos grava com createdAt/updatedAt do servidor e devolve o item", async () => {
    const { repo, servico } = montar()

    const item = await servico.executar("criar", "livros", { dados: livro }, null)

    expect(item).toMatchObject({
      ...livro,
      createdAt: AGORA.toISOString(),
      updatedAt: AGORA.toISOString(),
    })
    const id = (item as { id: string }).id
    expect(await repo.obter("livros", id)).toEqual(item)
  })

  it("atualizar com parcial válido mescla no atual, valida o todo e carimba updatedAt", async () => {
    const { repo, servico } = await comLivro()

    const item = await servico.executar("atualizar", "livros", { id: "l1", dados: { rating: 10 } }, null)

    expect(item).toMatchObject({
      ...livro,
      rating: 10,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: AGORA.toISOString(),
    })
    expect((await repo.obter("livros", "l1"))?.rating).toBe(10)
  })

  it("criar com dados inválidos devolve VALIDACAO com a mensagem de cada campo, sem gravar", async () => {
    const { repo, servico } = montar()

    await expect(
      servico.executar("criar", "livros", { dados: { ...livro, title: "", author: "" } }, null)
    ).rejects.toMatchObject({
      codigo: "VALIDACAO",
      campos: { title: "Título obrigatório", author: "Autor(a) obrigatório" },
    })
    expect((await repo.listar("livros")).itens).toEqual([])
  })

  it("atualizar com dados inválidos devolve VALIDACAO sem gravar", async () => {
    const { repo, servico } = await comLivro()

    await expect(
      servico.executar("atualizar", "livros", { id: "l1", dados: { status: "emprestado" } }, null)
    ).rejects.toMatchObject({ codigo: "VALIDACAO", campos: { status: "Status inválido" } })
    expect((await repo.obter("livros", "l1"))?.status).toBe("lido")
  })
})

describe("serviço de conteúdo: NAO_ENCONTRADO (MCP-08)", () => {
  it.each<AcaoConteudo>(["obter", "atualizar", "apagar"])(
    "%s com id inexistente devolve NAO_ENCONTRADO",
    async (acao) => {
      const { servico } = montar()

      await expect(
        servico.executar(acao, "livros", { id: "nao-existe", dados: { rating: 1 } }, null)
      ).rejects.toMatchObject({ codigo: "NAO_ENCONTRADO" })
    }
  )
})

describe("serviço de conteúdo: SLUG_EM_USO (MCP-09)", () => {
  it("criar com slug de outro item devolve SLUG_EM_USO, sem gravar", async () => {
    const { repo, servico } = await comLivro()

    await expect(
      servico.executar("criar", "livros", { dados: livro }, null)
    ).rejects.toMatchObject({ codigo: "SLUG_EM_USO" })
    expect((await repo.listar("livros")).itens).toHaveLength(1)
  })

  it("atualizar para o slug de outro item devolve SLUG_EM_USO, sem gravar", async () => {
    const { repo, servico } = await comLivro()
    repo.semear("livros", "l2", { ...livro, slug: "memorias-postumas" })

    await expect(
      servico.executar("atualizar", "livros", { id: "l2", dados: { slug: "dom-casmurro" } }, null)
    ).rejects.toMatchObject({ codigo: "SLUG_EM_USO" })
    expect((await repo.obter("livros", "l2"))?.slug).toBe("memorias-postumas")
  })
})

describe("serviço de conteúdo: documento único atualmente (MCP-10)", () => {
  const slot = { title: "Duna", subtitle: "Frank Herbert", link: "", visible: true }

  it("obter e atualizar funcionam sem id", async () => {
    const { servico } = montar()

    const gravado = await servico.executar("atualizar", "atualmente", { dados: { lendo: slot } }, null)
    const lido = await servico.executar("obter", "atualmente", {}, null)

    expect(gravado).toMatchObject({ id: "currently", lendo: slot })
    expect(lido).toEqual(gravado)
  })

  it.each<AcaoConteudo>(["listar", "criar", "apagar"])(
    "%s devolve ACAO_INVALIDA",
    async (acao) => {
      const { servico } = montar()

      await expect(servico.executar(acao, "atualmente", {}, null)).rejects.toMatchObject({
        codigo: "ACAO_INVALIDA",
      })
    }
  )
})

describe("serviço de conteúdo: escopo do uso único (UNICO-04)", () => {
  const escopo: EscopoDoUnico = { recurso: "livros", itemId: "l1", acoes: ["ler", "editar"] }

  it.each<[string, AcaoConteudo, "livros" | "games", string | undefined]>([
    ["outro recurso", "obter", "games", "l1"],
    ["outro item", "atualizar", "livros", "l2"],
    ["obter de outro item", "obter", "livros", "l2"],
    ["listar com item fixo", "listar", "livros", undefined],
    ["ação não concedida", "criar", "livros", undefined],
    ["apagar", "apagar", "livros", "l1"],
  ])("%s devolve FORA_DO_ESCOPO sem ler nem gravar", async (_caso, acao, recurso, id) => {
    const { repo, servico } = await comLivro()
    const espioes = (["listar", "obter", "criar", "atualizar", "apagar", "slugEmUso"] as const).map(
      (m) => vi.spyOn(repo, m)
    )

    await expect(
      servico.executar(acao, recurso, { id, dados: { rating: 1 } }, escopo)
    ).rejects.toMatchObject({ codigo: "FORA_DO_ESCOPO" })
    for (const espiao of espioes) expect(espiao).not.toHaveBeenCalled()
    expect((await repo.obter("livros", "l1"))?.rating).toBe(9.5)
  })

  it("dentro do escopo lê e edita o item concedido", async () => {
    const { servico } = await comLivro()

    await expect(servico.executar("obter", "livros", { id: "l1" }, escopo)).resolves.toMatchObject({ id: "l1" })
    await expect(
      servico.executar("atualizar", "livros", { id: "l1", dados: { rating: 8 } }, escopo)
    ).resolves.toMatchObject({ rating: 8 })
  })
})

describe("serviço de conteúdo: falha do banco (Edge Case FALHA_EXTERNA)", () => {
  it("erro do repositório vira FALHA_EXTERNA, sem a mensagem interna", async () => {
    const { repo, servico } = montar()
    vi.spyOn(repo, "listar").mockRejectedValue(new Error("DEADLINE_EXCEEDED stack interna"))

    const erro = await servico.executar("listar", "livros", {}, null).catch((e: unknown) => e)

    expect(erro).toMatchObject({
      codigo: "FALHA_EXTERNA",
      message: "Falha ao acessar o banco de dados. Tente de novo.",
    })
  })
})
