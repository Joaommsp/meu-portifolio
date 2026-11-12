import { describe, expect, it, vi } from "vitest"

import { livros } from "@/lib/conteudo/livros"
import { RepositorioConteudoEmMemoria } from "@/server/conteudo/memoria"
import { criarServicoConteudo } from "@/server/conteudo/servico"
import type { EntradaImagem } from "@/server/imagem"

import { RepositorioAcessosEmMemoria } from "./acessos/memoria"
import { hashDoSegredo } from "./acessos/segredo"
import { criarServicoAcessos } from "./acessos/servico"
import type { Acesso } from "./acessos/tipos"
import { atenderMcp, ferramentasDoAcesso } from "./servidor"

const AGORA = new Date("2026-11-03T14:00:00.000Z")

const LIVRO = livros.deDocumento({
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
})

function montar() {
  const repoAcessos = new RepositorioAcessosEmMemoria()
  const repoConteudo = new RepositorioConteudoEmMemoria(() => AGORA)
  const acessos = criarServicoAcessos(repoAcessos, () => AGORA)
  const imagensSubidas: EntradaImagem[] = []
  const deps = {
    acessos,
    conteudo: criarServicoConteudo(repoConteudo),
    subirImagem: async (entrada: EntradaImagem) => {
      imagensSubidas.push(entrada)
      return { url: "https://res.cloudinary.com/x/nova.png", largura: 600, altura: 900, bytes: 1234 }
    },
  }

  async function acessoDe(segredo: string): Promise<Acesso> {
    const acesso = await repoAcessos.obter(hashDoSegredo(segredo))
    if (!acesso) throw new Error("acesso não gravado")
    return acesso
  }

  async function chamar(acesso: Acesso, method: string, params?: unknown) {
    const resposta = await atenderMcp(
      new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      }),
      acesso,
      deps
    )
    expect(resposta.status).toBe(200)
    return (await resposta.json()) as { result: Record<string, unknown> }
  }

  async function ferramentas(acesso: Acesso): Promise<string[]> {
    const { result } = await chamar(acesso, "tools/list")
    return (result.tools as { name: string }[]).map((t) => t.name).sort()
  }

  async function chamarFerramenta(acesso: Acesso, name: string, args: Record<string, unknown>) {
    const { result } = await chamar(acesso, "tools/call", { name, arguments: args })
    return result as { content: { type: string; text: string }[]; isError?: boolean }
  }

  return { repoAcessos, repoConteudo, acessos, deps, imagensSubidas, acessoDe, chamar, ferramentas, chamarFerramenta }
}

async function chavePessoal(m: ReturnType<typeof montar>) {
  const { segredo } = await m.acessos.criarChave({ nome: "Notebook" })
  return m.acessoDe(segredo)
}

async function unico(m: ReturnType<typeof montar>, acoes: ("ler" | "criar" | "editar")[]) {
  const { segredo } = await m.acessos.criarUnico({ recurso: "livros", acoes, tarefa: "Cadastrar Dom Casmurro" })
  return m.acessoDe(segredo)
}

describe("initialize (MCP-04, MCP-15)", () => {
  it("responde sem sessão e traz instructions com recursos, descrever_recurso e subir_imagem", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)

    const { result } = await m.chamar(acesso, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "teste", version: "1" },
    })

    const instrucoes = result.instructions as string
    expect(result.serverInfo).toMatchObject({ name: "portfolio" })
    expect(instrucoes).toContain("projetos, posts, livros, games, figma, uses, atualmente, jogando")
    expect(instrucoes).toContain("chame descrever_recurso")
    expect(instrucoes).toContain("chame subir_imagem")
    expect(instrucoes).toContain("YYYY-MM-DD")
    expect(instrucoes).not.toContain("concluir_tarefa")
  })

  it("no uso único as instructions mandam chamar concluir_tarefa ao terminar", async () => {
    const m = montar()
    const acesso = await unico(m, ["criar"])

    const { result } = await m.chamar(acesso, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "teste", version: "1" },
    })

    expect(result.instructions).toContain("Tarefa: Cadastrar Dom Casmurro")
    expect(result.instructions).toContain("chame concluir_tarefa")
  })
})

describe("tools/list por escopo (MCP-05, UNICO-03)", () => {
  it("chave pessoal lista as 7 ferramentas, sem concluir_tarefa", async () => {
    const m = montar()

    expect(await m.ferramentas(await chavePessoal(m))).toEqual(
      ["apagar", "atualizar", "criar", "descrever_recurso", "listar", "obter", "subir_imagem"]
    )
  })

  it("único só com ler: listar, obter, descrever_recurso e concluir_tarefa", async () => {
    const m = montar()

    expect(await m.ferramentas(await unico(m, ["ler"]))).toEqual(
      ["concluir_tarefa", "descrever_recurso", "listar", "obter"]
    )
  })

  it("único com criar: criar, descrever_recurso, subir_imagem e concluir_tarefa", async () => {
    const m = montar()

    expect(await m.ferramentas(await unico(m, ["criar"]))).toEqual(
      ["concluir_tarefa", "criar", "descrever_recurso", "subir_imagem"]
    )
  })

  it("único sem escopo só recebe concluir_tarefa, nunca as da chave pessoal", async () => {
    const m = montar()
    const acesso = await unico(m, ["ler"])

    expect(ferramentasDoAcesso({ ...acesso, escopo: null })).toEqual(["concluir_tarefa"])
  })

  it("único com ler e editar: sem criar e sem apagar", async () => {
    const m = montar()

    expect(await m.ferramentas(await unico(m, ["ler", "editar"]))).toEqual(
      ["atualizar", "concluir_tarefa", "descrever_recurso", "listar", "obter", "subir_imagem"]
    )
  })
})

describe("tools/call", () => {
  it("criar grava o item, devolve o gravado e audita a escrita (MCP-06, AUDIT-01)", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)

    const resultado = await m.chamarFerramenta(acesso, "criar", { recurso: "livros", dados: LIVRO })

    expect(resultado.isError).toBeUndefined()
    const item = JSON.parse(resultado.content[0]!.text) as { id: string; title: string }
    expect(item.title).toBe("Dom Casmurro")
    expect(m.repoConteudo.colecoes.get("livros")?.get(item.id)).toMatchObject({ title: "Dom Casmurro" })
    expect(m.repoAcessos.auditoria.at(-1)).toMatchObject({
      acessoId: acesso.id,
      prefixo: acesso.prefixo,
      acao: "criar",
      recurso: "livros",
      itemId: item.id,
    })
  })

  it("dados inválidos voltam com isError, CODIGO: mensagem e o campo, sem gravar nem auditar (MCP-07)", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)
    const auditoriaAntes = m.repoAcessos.auditoria.length

    const resultado = await m.chamarFerramenta(acesso, "criar", {
      recurso: "livros",
      dados: { ...LIVRO, title: "" },
    })

    expect(resultado.isError).toBe(true)
    expect(resultado.content[0]!.text).toMatch(/^VALIDACAO: /)
    expect(resultado.content[0]!.text).toContain("\ntitle: Título obrigatório")
    expect(m.repoConteudo.colecoes.get("livros")?.size ?? 0).toBe(0)
    expect(m.repoAcessos.auditoria.length).toBe(auditoriaAntes)
  })

  it("obter id inexistente volta com isError e NAO_ENCONTRADO (MCP-08)", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)

    const resultado = await m.chamarFerramenta(acesso, "obter", { recurso: "livros", id: "nao-existe" })

    expect(resultado.isError).toBe(true)
    expect(resultado.content[0]!.text).toMatch(/^NAO_ENCONTRADO: /)
  })

  it.each([
    ["atualizar", { dados: { rating: 8 } }],
    ["apagar", {}],
  ] as const)("%s com sucesso audita ação, recurso e itemId (AUDIT-01)", async (ferramenta, extra) => {
    const m = montar()
    const acesso = await chavePessoal(m)
    const criado = JSON.parse(
      (await m.chamarFerramenta(acesso, "criar", { recurso: "livros", dados: LIVRO })).content[0]!.text
    ) as { id: string }

    const resultado = await m.chamarFerramenta(acesso, ferramenta, { recurso: "livros", id: criado.id, ...extra })

    expect(resultado.isError).toBeUndefined()
    expect(m.repoAcessos.auditoria.at(-1)).toMatchObject({
      acessoId: acesso.id,
      acao: ferramenta,
      recurso: "livros",
      itemId: criado.id,
    })
  })

  it.each([
    ["atualizar", { dados: { rating: 8 } }],
    ["apagar", {}],
  ] as const)("%s que falha com erro de domínio não audita (AUDIT-01)", async (ferramenta, extra) => {
    const m = montar()
    const acesso = await chavePessoal(m)
    const auditoriaAntes = m.repoAcessos.auditoria.length

    const resultado = await m.chamarFerramenta(acesso, ferramenta, { recurso: "livros", id: "nao-existe", ...extra })

    expect(resultado.isError).toBe(true)
    expect(resultado.content[0]!.text).toMatch(/^NAO_ENCONTRADO: /)
    expect(m.repoAcessos.auditoria.length).toBe(auditoriaAntes)
  })

  it("erro inesperado do serviço volta com isError e FALHA_EXTERNA, sem a mensagem interna (Edge Case)", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)
    vi.spyOn(m.deps.conteudo, "executar").mockRejectedValue(new Error("stack interna do Firestore"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    const resultado = await m.chamarFerramenta(acesso, "listar", { recurso: "livros" })

    expect(resultado.isError).toBe(true)
    expect(resultado.content[0]!.text).toMatch(/^FALHA_EXTERNA: /)
    expect(resultado.content[0]!.text).not.toContain("stack interna")
  })

  it("subir_imagem devolve url, largura, altura e bytes e audita (AUDIT-01)", async () => {
    const m = montar()
    const acesso = await chavePessoal(m)

    const resultado = await m.chamarFerramenta(acesso, "subir_imagem", { url: "https://exemplo.com/capa.png" })

    expect(JSON.parse(resultado.content[0]!.text)).toEqual({
      url: "https://res.cloudinary.com/x/nova.png",
      largura: 600,
      altura: 900,
      bytes: 1234,
    })
    expect(m.imagensSubidas).toEqual([{ url: "https://exemplo.com/capa.png" }])
    expect(m.repoAcessos.auditoria.at(-1)).toMatchObject({ acao: "subir_imagem", recurso: null, itemId: null })
  })

  it("concluir_tarefa grava encerradoEm e o autenticar seguinte é inválido (UNICO-05)", async () => {
    const m = montar()
    const { segredo } = await m.acessos.criarUnico({ recurso: "livros", acoes: ["criar"], tarefa: "Cadastrar" })
    const acesso = await m.acessoDe(segredo)

    const resultado = await m.chamarFerramenta(acesso, "concluir_tarefa", {})

    expect(resultado.isError).toBeUndefined()
    expect((await m.repoAcessos.obter(acesso.id))?.encerradoEm).toEqual(AGORA)
    expect(await m.acessos.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })
})
