/**
 * Contrato com o Firestore real (T40). Os demais testes usam repositórios em
 * memória; este prova que o firebase-admin grava e lê o que os serviços
 * esperam. Só roda com `MCP_CONTRATO=1` e a service account no `.env.local`:
 *
 *   MCP_CONTRATO=1 npx vitest run src/server/__contrato__
 *
 * Grava em coleções `mcpTeste_<n>_*`, apagadas ao fim. Os dados reais do site
 * são só lidos, para conferir que passam nos schemas.
 */
import { existsSync } from "node:fs"

import type { Firestore } from "firebase-admin/firestore"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { NOMES_DE_RECURSO, RECURSOS, type Recurso } from "@/lib/conteudo"
import { MAX_CHAMADAS_POR_MINUTO } from "@/lib/mcp/limites"
import { obterFirestore } from "@/server/firebase-admin"
import { RepositorioConteudoFirestore } from "@/server/conteudo/repositorio"
import { criarServicoConteudo } from "@/server/conteudo/servico"
import { RepositorioAcessosFirestore } from "@/server/mcp/acessos/repositorio"
import { criarServicoAcessos } from "@/server/mcp/acessos/servico"

// O Next não carrega `.env.local` com NODE_ENV=test; o Node carrega.
if (existsSync(".env.local")) process.loadEnvFile(".env.local")

const LIGADO = process.env.MCP_CONTRATO === "1"
const PREFIXO = `mcpTeste_${Date.now()}_`
const TEMPO = 120_000

const capa = "https://res.cloudinary.com/demo/image/upload/sample.jpg"

/** Um item válido por recurso, invisível para o caso de vazar. */
const EXEMPLOS: Record<Exclude<Recurso, "atualmente">, Record<string, unknown>> = {
  projetos: {
    slug: "contrato-projeto",
    title: "Projeto de contrato",
    shortDescription: "Projeto gravado pelo teste de contrato.",
    fullDescription: "Descrição completa do projeto gravado pelo teste de contrato.",
    coverImage: capa,
    gallery: [],
    technologies: ["TypeScript"],
    category: "web",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    status: "em-desenvolvimento",
    startDate: "2026-01-10",
    endDate: "",
  },
  posts: {
    slug: "contrato-post",
    title: "Post de contrato",
    excerpt: "Resumo do post do teste de contrato.",
    content: "Conteúdo do post do teste de contrato, com mais de cinquenta caracteres.",
    coverImage: capa,
    category: "tutorial",
    tags: [],
    published: false,
    featured: false,
  },
  livros: {
    slug: "contrato-livro",
    title: "Livro de contrato",
    author: "Teste",
    shortDescription: "Livro gravado pelo teste de contrato.",
    synopsis: "Sinopse do livro gravado pelo teste de contrato.",
    whyILikeIt: "Porque prova que o firebase-admin grava.",
    coverImage: capa,
    genres: [],
    status: "lido",
    yearRead: 2025,
    pages: null,
    rating: null,
    featured: false,
    published: false,
  },
  games: {
    slug: "contrato-game",
    title: "Game de contrato",
    shortDescription: "Game gravado pelo teste de contrato.",
    history: "História do game gravado pelo teste de contrato.",
    whyILikeIt: "Porque prova que o firebase-admin grava.",
    coverImage: capa,
    gallery: [],
    platforms: ["PC"],
    genres: [],
    status: "concluido",
    yearPlayed: 2025,
    hoursPlayed: null,
    rating: null,
    featured: false,
    published: false,
  },
  figma: {
    title: "Figma de contrato",
    coverImage: "",
    url: "",
    likes: 0,
    users: 0,
    order: 999,
    visible: false,
  },
  uses: {
    title: "Uses de contrato",
    description: "",
    items: [{ name: "Item", description: "", url: "", starred: false }],
    order: 999,
    visible: false,
  },
  jogando: {
    title: "Jogando de contrato",
    coverImage: "",
    synopsis: "",
    genres: [],
    platform: "PC",
    status: "jogando",
    order: 999,
    visible: false,
  },
}

const RECURSOS_DE_COLECAO = NOMES_DE_RECURSO.filter(
  (r): r is Exclude<Recurso, "atualmente"> => r !== "atualmente"
)

describe.runIf(LIGADO)("contrato com o Firestore real", () => {
  let db: Firestore
  let conteudo: ReturnType<typeof criarServicoConteudo>
  let repoConteudo: RepositorioConteudoFirestore

  beforeAll(() => {
    db = obterFirestore()
    repoConteudo = new RepositorioConteudoFirestore(db, PREFIXO)
    conteudo = criarServicoConteudo(repoConteudo)
  })

  afterAll(async () => {
    if (!db) return
    const colecoes = await db.listCollections()
    await Promise.all(
      colecoes
        .filter((c) => c.id.startsWith(PREFIXO))
        .map((c) => db.recursiveDelete(c))
    )
    const sobras = (await db.listCollections()).filter((c) => c.id.startsWith(PREFIXO))
    expect(sobras).toEqual([])
  }, TEMPO)

  it.each(RECURSOS_DE_COLECAO)(
    "%s: criar, obter, atualizar parcial, listar e apagar (MCP-06)",
    async (recurso) => {
      const criado = (await conteudo.executar("criar", recurso, { dados: EXEMPLOS[recurso] }, null)) as {
        id: string
        createdAt: string
        updatedAt: string
      }
      // O que volta do banco, relido como formulário, é o que foi enviado.
      const definicao = RECURSOS[recurso]
      expect(definicao.deDocumento(criado)).toEqual(definicao.schema.parse(EXEMPLOS[recurso]))
      expect(Date.parse(criado.createdAt)).not.toBeNaN()

      const lido = await conteudo.executar("obter", recurso, { id: criado.id }, null)
      expect(lido).toEqual(criado)

      const atualizado = await conteudo.executar(
        "atualizar",
        recurso,
        { id: criado.id, dados: { title: "Título atualizado no contrato" } },
        null
      )
      expect(definicao.deDocumento(atualizado as Record<string, unknown>)).toEqual(
        definicao.schema.parse({ ...EXEMPLOS[recurso], title: "Título atualizado no contrato" })
      )
      if (recurso === "projetos") {
        // Meia-noite de Brasília, seja quem for que grave (admin ou Vercel em UTC).
        expect((criado as unknown as { startDate: string }).startDate).toBe("2026-01-10T03:00:00.000Z")
      }

      const pagina = (await conteudo.executar("listar", recurso, {}, null)) as {
        itens: { id: string }[]
      }
      expect(pagina.itens.map((i) => i.id)).toContain(criado.id)

      await conteudo.executar("apagar", recurso, { id: criado.id }, null)
      await expect(
        conteudo.executar("obter", recurso, { id: criado.id }, null)
      ).rejects.toMatchObject({ codigo: "NAO_ENCONTRADO" })
    },
    TEMPO
  )

  it("slug repetido no mesmo recurso é recusado com SLUG_EM_USO (MCP-09)", async () => {
    await conteudo.executar("criar", "livros", { dados: { ...EXEMPLOS.livros, slug: "contrato-slug" } }, null)
    await expect(
      conteudo.executar("criar", "livros", { dados: { ...EXEMPLOS.livros, slug: "contrato-slug" } }, null)
    ).rejects.toMatchObject({ codigo: "SLUG_EM_USO" })
  }, TEMPO)

  it("publicar post grava publishedAt com o carimbo do servidor", async () => {
    const post = (await conteudo.executar("criar", "posts", { dados: { ...EXEMPLOS.posts, slug: "contrato-publicado" } }, null)) as { id: string; publishedAt: unknown }
    expect(post.publishedAt).toBeNull()
    const publicado = (await conteudo.executar("atualizar", "posts", { id: post.id, dados: { published: true } }, null)) as unknown as { publishedAt: string }
    expect(Date.parse(publicado.publishedAt)).not.toBeNaN()
  }, TEMPO)

  it("listar pagina com cursor sem repetir item", async () => {
    for (const order of [1, 2, 3]) {
      await conteudo.executar("criar", "jogando", { dados: { ...EXEMPLOS.jogando, order } }, null)
    }
    const p1 = await repoConteudo.listar("jogando", { limite: 2 })
    expect(p1.itens).toHaveLength(2)
    expect(p1.proximoCursor).not.toBeNull()
    const p2 = await repoConteudo.listar("jogando", { limite: 2, cursor: p1.proximoCursor! })
    expect(p2.itens).toHaveLength(1)
    expect(p2.proximoCursor).toBeNull()
    const ids = [...p1.itens, ...p2.itens].map((i) => i.id)
    expect(new Set(ids).size).toBe(3)
  }, TEMPO)

  it("atualmente grava e lê o documento único sem id (MCP-10)", async () => {
    const vazio = { title: "", subtitle: "", link: "", visible: false }
    const dados = {
      lendo: { title: "Livro do contrato", subtitle: "", link: "", visible: false },
      ouvindo: vazio,
      estudando: vazio,
    }
    await conteudo.executar("atualizar", "atualmente", { dados }, null)
    expect(await conteudo.executar("obter", "atualmente", {}, null)).toMatchObject(dados)
  }, TEMPO)

  it("chave pessoal: autentica pelo hash, marca ultimoUso e para após revogar (MCP-11, MCP-13)", async () => {
    const acessos = criarServicoAcessos(new RepositorioAcessosFirestore(db, PREFIXO))
    const { acesso, segredo } = await acessos.criarChave({ nome: "Contrato" })

    const ok = await acessos.autenticar(`Bearer ${segredo}`)
    expect(ok.resultado).toBe("ok")
    const [visto] = (await acessos.listar()).pessoais
    expect(visto?.id).toBe(acesso.id)
    expect(visto?.ultimoUsoEm).not.toBeNull()

    await acessos.revogar(acesso.id)
    expect(await acessos.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })

    const atividade = await acessos.atividade()
    expect(atividade.map((r) => r.acao)).toEqual(["revogado", "chave_criada"])
  }, TEMPO)

  it("limite por minuto conta em transação e recusa a chamada 121 (MCP-14)", async () => {
    const repo = new RepositorioAcessosFirestore(db, PREFIXO)
    const agora = new Date()
    const resultados = []
    for (let i = 0; i <= MAX_CHAMADAS_POR_MINUTO; i++) {
      resultados.push(await repo.consumirLimite("contrato-limite", agora))
    }
    expect(resultados.slice(0, MAX_CHAMADAS_POR_MINUTO).every(Boolean)).toBe(true)
    expect(resultados[MAX_CHAMADAS_POR_MINUTO]).toBe(false)
  }, TEMPO)

  it.each(NOMES_DE_RECURSO)(
    "%s: documentos reais do site passam no schema (leitura)",
    async (recurso) => {
      const real = new RepositorioConteudoFirestore(db)
      const definicao = RECURSOS[recurso]
      const docs = definicao.unico
        ? [await real.obter(recurso, definicao.idDoDocumentoUnico!)].filter(Boolean)
        : await listarTudo(real, recurso)
      const recusados = docs
        .map((d) => ({ id: d!.id, r: definicao.schema.safeParse(definicao.deDocumento(d)) }))
        .filter((x) => !x.r.success)
        .map((x) => `${x.id}: ${x.r.error?.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`)
      expect(recusados).toEqual([])
    },
    TEMPO
  )
})

async function listarTudo(repo: RepositorioConteudoFirestore, recurso: Recurso) {
  const itens = []
  let cursor: string | undefined
  do {
    const pagina = await repo.listar(recurso, { cursor })
    itens.push(...pagina.itens)
    cursor = pagina.proximoCursor ?? undefined
  } while (cursor)
  return itens
}
