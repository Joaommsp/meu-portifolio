import { describe, expect, it } from "vitest"

import { MAX_CHAMADAS_POR_MINUTO } from "@/lib/mcp/limites"

import { RepositorioAcessosEmMemoria } from "./memoria"
import { hashDoSegredo } from "./segredo"
import { criarServicoAcessos } from "./servico"

const INICIO = new Date("2026-11-03T14:00:00.000Z")
const DIA = 24 * 60 * 60 * 1000

function montar() {
  const relogio = { agora: INICIO }
  const repo = new RepositorioAcessosEmMemoria()
  const servico = criarServicoAcessos(repo, () => relogio.agora)
  const avancar = (ms: number) => {
    relogio.agora = new Date(relogio.agora.getTime() + ms)
  }
  return { repo, servico, avancar }
}

const unico = { recurso: "games" as const, acoes: ["criar" as const], tarefa: "Cadastrar Hades II" }

describe("chave pessoal (CHAVE-01, CHAVE-02, CHAVE-03)", () => {
  it("cria com nome e validade, devolve o segredo pf_pk_ + 43 base64url e vence na validade", async () => {
    const { servico } = montar()

    const { acesso, segredo } = await servico.criarChave({ nome: "Notebook casa", validadeDias: 30 })

    expect(segredo).toMatch(/^pf_pk_[A-Za-z0-9_-]{43}$/)
    expect(acesso).toMatchObject({
      tipo: "pessoal",
      nome: "Notebook casa",
      situacao: "ativo",
      expiraEm: new Date(INICIO.getTime() + 30 * DIA).toISOString(),
    })
  })

  it("sem validade usa 90 dias", async () => {
    const { servico } = montar()

    const { acesso } = await servico.criarChave({ nome: "Sem validade" })

    expect(acesso.expiraEm).toBe(new Date(INICIO.getTime() + 90 * DIA).toISOString())
  })

  it.each([
    ["nome vazio", { nome: " ", validadeDias: 30 }, { nome: "Informe o nome da chave" }],
    ["nome com 61 caracteres", { nome: "x".repeat(61), validadeDias: 30 }, { nome: "Nome muito longo (máximo 60)" }],
    ["validade fora de 1, 30, 90", { nome: "Ok", validadeDias: 7 }, { validadeDias: "Validade deve ser 1, 30, 90 dias" }],
  ] as const)("%s devolve VALIDACAO por campo", async (_caso, entrada, campos) => {
    const { repo, servico } = montar()

    await expect(
      servico.criarChave(entrada as unknown as { nome: string })
    ).rejects.toMatchObject({ codigo: "VALIDACAO", campos })
    expect(repo.acessos.size).toBe(0)
  })

  it("guarda só o sha256 como id e o prefixo; o segredo não aparece no banco nem na listagem", async () => {
    const { repo, servico } = montar()

    const { segredo } = await servico.criarChave({ nome: "Notebook casa" })

    const [guardado] = [...repo.acessos.values()]
    expect(guardado?.id).toBe(hashDoSegredo(segredo))
    expect(guardado?.prefixo).toBe(segredo.slice(0, 10))
    expect(JSON.stringify([...repo.acessos.entries()])).not.toContain(segredo)
    expect(JSON.stringify(await servico.listar())).not.toContain(segredo)
  })
})

describe("acesso único (UNICO-01, UNICO-02)", () => {
  it("cria com escopo e tarefa, devolve pf_uu_ + 43 base64url e vence 2 h depois", async () => {
    const { servico } = montar()

    const { acesso, segredo } = await servico.criarUnico({ ...unico, itemId: null })

    expect(segredo).toMatch(/^pf_uu_[A-Za-z0-9_-]{43}$/)
    expect(acesso).toMatchObject({
      tipo: "unico",
      tarefa: "Cadastrar Hades II",
      escopo: { recurso: "games", itemId: null, acoes: ["criar"] },
      expiraEm: "2026-11-03T16:00:00.000Z",
    })
  })

  it.each([
    ["sem ação", { ...unico, acoes: [] }, { acoes: "Marque ao menos uma ação" }],
    ["com apagar", { ...unico, acoes: ["apagar"] }, { "acoes.0": "Ação inválida" }],
    ["tarefa vazia", { ...unico, tarefa: "" }, { tarefa: "Descreva a tarefa" }],
    ["tarefa com 501 caracteres", { ...unico, tarefa: "x".repeat(501) }, { tarefa: "Tarefa muito longa (máximo 500)" }],
  ])("%s devolve VALIDACAO por campo", async (_caso, entrada, campos) => {
    const { repo, servico } = montar()

    await expect(
      servico.criarUnico(entrada as unknown as typeof unico)
    ).rejects.toMatchObject({ codigo: "VALIDACAO", campos })
    expect(repo.acessos.size).toBe(0)
  })
})

describe("gestão dos acessos (ACESSOS-01..04, ACESSOS-06, UNICO-06)", () => {
  it("lista chaves e únicos separados, com a situação derivada das datas", async () => {
    const { servico, avancar } = montar()
    await servico.criarChave({ nome: "Curta", validadeDias: 1 })
    await servico.criarUnico(unico)
    avancar(3 * 60 * 60 * 1000)

    const { pessoais, unicos } = await servico.listar()

    expect(pessoais.map((a) => [a.nome, a.situacao])).toEqual([["Curta", "ativo"]])
    expect(unicos.map((a) => [a.tarefa, a.situacao])).toEqual([["Cadastrar Hades II", "vencido"]])
  })

  it("revogar grava revogadoEm e a chamada seguinte não autentica", async () => {
    const { repo, servico } = montar()
    const { acesso, segredo } = await servico.criarChave({ nome: "A" })

    const revogada = await servico.revogar(acesso.id)

    expect(revogada.revogadoEm).toBe(INICIO.toISOString())
    expect(repo.acessos.get(acesso.id)?.revogadoEm).toEqual(INICIO)
    expect(await servico.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })

  it("revogar acesso já inativo devolve ACESSO_INATIVO; inexistente, NAO_ENCONTRADO", async () => {
    const { servico } = montar()
    const { acesso } = await servico.criarChave({ nome: "A" })
    await servico.revogar(acesso.id)

    await expect(servico.revogar(acesso.id)).rejects.toMatchObject({ codigo: "ACESSO_INATIVO" })
    await expect(servico.revogar("nao-existe")).rejects.toMatchObject({ codigo: "NAO_ENCONTRADO" })
  })

  it("apagar acesso ativo devolve ACESSO_ATIVO sem apagar", async () => {
    const { repo, servico } = montar()
    const { acesso } = await servico.criarChave({ nome: "A" })

    await expect(servico.apagar(acesso.id)).rejects.toMatchObject({ codigo: "ACESSO_ATIVO" })
    expect(repo.acessos.has(acesso.id)).toBe(true)
  })

  it("apagar acesso inativo remove o documento e mantém a auditoria dele", async () => {
    const { repo, servico } = montar()
    const { acesso } = await servico.criarChave({ nome: "A" })
    await servico.revogar(acesso.id)

    await servico.apagar(acesso.id)

    expect(repo.acessos.has(acesso.id)).toBe(false)
    expect(repo.auditoria.filter((r) => r.acessoId === acesso.id).map((r) => r.acao)).toEqual([
      "chave_criada",
      "revogado",
      "apagado",
    ])
  })

  it("a 11ª chave pessoal ativa devolve LIMITE_DE_CHAVES", async () => {
    const { repo, servico } = montar()
    for (let i = 0; i < 10; i++) await servico.criarChave({ nome: `Chave ${i}` })

    await expect(servico.criarChave({ nome: "Onze" })).rejects.toMatchObject({
      codigo: "LIMITE_DE_CHAVES",
    })
    expect(repo.acessos.size).toBe(10)
  })

  it("dono encerra acesso único ativo: grava encerradoEm", async () => {
    const { repo, servico } = montar()
    const { acesso } = await servico.criarUnico(unico)

    const encerrado = await servico.encerrar(acesso.id)

    expect(encerrado.situacao).toBe("encerrado")
    expect(repo.acessos.get(acesso.id)?.encerradoEm).toEqual(INICIO)
  })

  it("encerrar chave pessoal devolve ACAO_INVALIDA", async () => {
    const { servico } = montar()
    const { acesso } = await servico.criarChave({ nome: "A" })

    await expect(servico.encerrar(acesso.id)).rejects.toMatchObject({ codigo: "ACAO_INVALIDA" })
  })
})

describe("autenticar (MCP-11, MCP-13, MCP-14, UNICO-05)", () => {
  it("chave ativa autentica", async () => {
    const { servico } = montar()
    const { acesso, segredo } = await servico.criarChave({ nome: "A" })

    const r = await servico.autenticar(`Bearer ${segredo}`)

    expect(r).toMatchObject({ resultado: "ok", acesso: { id: acesso.id } })
  })

  it.each([
    ["header ausente", null],
    ["chave inexistente", "Bearer pf_pk_naoexiste"],
    ["sem o esquema Bearer", "pf_pk_naoexiste"],
  ])("%s não autentica", async (_caso, header) => {
    const { servico } = montar()

    expect(await servico.autenticar(header)).toEqual({ resultado: "invalido" })
  })

  it("único sem escopo no documento não autentica (fecha em vez de abrir)", async () => {
    const { repo, servico } = montar()
    const { acesso, segredo } = await servico.criarUnico(unico)
    const doc = repo.acessos.get(acesso.id)!
    repo.acessos.set(acesso.id, { ...doc, escopo: null })

    expect(await servico.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })

  it("chave vencida não autentica (vence no instante de expiraEm)", async () => {
    const { servico, avancar } = montar()
    const { segredo } = await servico.criarChave({ nome: "A", validadeDias: 1 })
    avancar(DIA)

    expect(await servico.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })

  it("concluir a tarefa encerra o único e as chamadas seguintes não autenticam", async () => {
    const { repo, servico } = montar()
    const { segredo } = await servico.criarUnico(unico)
    const r = await servico.autenticar(`Bearer ${segredo}`)
    if (r.resultado !== "ok") throw new Error("deveria autenticar")

    await servico.encerrar(r.acesso.id)

    expect(repo.acessos.get(r.acesso.id)?.encerradoEm).toEqual(INICIO)
    expect(await servico.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "invalido" })
  })

  it("atualiza ultimoUsoEm no máximo 1 vez por minuto", async () => {
    const { repo, servico, avancar } = montar()
    const { acesso, segredo } = await servico.criarChave({ nome: "A" })
    const ultimoUso = () => repo.acessos.get(acesso.id)?.ultimoUsoEm?.toISOString()

    await servico.autenticar(`Bearer ${segredo}`)
    expect(ultimoUso()).toBe("2026-11-03T14:00:00.000Z")

    avancar(30_000)
    await servico.autenticar(`Bearer ${segredo}`)
    expect(ultimoUso()).toBe("2026-11-03T14:00:00.000Z")

    avancar(31_000)
    await servico.autenticar(`Bearer ${segredo}`)
    expect(ultimoUso()).toBe("2026-11-03T14:01:01.000Z")
  })

  it("a 121ª chamada no minuto devolve limite, e o minuto seguinte libera", async () => {
    const { servico, avancar } = montar()
    const { segredo } = await servico.criarChave({ nome: "A" })
    for (let i = 0; i < MAX_CHAMADAS_POR_MINUTO; i++) {
      expect((await servico.autenticar(`Bearer ${segredo}`)).resultado).toBe("ok")
    }

    expect(await servico.autenticar(`Bearer ${segredo}`)).toEqual({ resultado: "limite" })
    avancar(60_000)
    expect((await servico.autenticar(`Bearer ${segredo}`)).resultado).toBe("ok")
  })
})

describe("auditoria (AUDIT-01, AUDIT-03)", () => {
  it("registra criação, revogação, encerramento e ferramenta de escrita, sem segredo nem dados do item", async () => {
    const { repo, servico } = montar()
    const chave = await servico.criarChave({ nome: "A" })
    const tarefa = await servico.criarUnico({ ...unico, itemId: "hades-ii", acoes: ["editar"] })
    await servico.revogar(chave.acesso.id)
    const r = await servico.autenticar(`Bearer ${tarefa.segredo}`)
    if (r.resultado !== "ok") throw new Error("deveria autenticar")
    await servico.auditarFerramenta(r.acesso, "atualizar", "games", "hades-ii")
    await servico.encerrar(tarefa.acesso.id)

    expect(repo.auditoria.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== "id")))).toEqual([
      { em: INICIO, acessoId: chave.acesso.id, prefixo: chave.acesso.prefixo, acao: "chave_criada", recurso: null, itemId: null },
      { em: INICIO, acessoId: tarefa.acesso.id, prefixo: tarefa.acesso.prefixo, acao: "unico_criado", recurso: "games", itemId: "hades-ii" },
      { em: INICIO, acessoId: chave.acesso.id, prefixo: chave.acesso.prefixo, acao: "revogado", recurso: null, itemId: null },
      { em: INICIO, acessoId: tarefa.acesso.id, prefixo: tarefa.acesso.prefixo, acao: "atualizar", recurso: "games", itemId: "hades-ii" },
      { em: INICIO, acessoId: tarefa.acesso.id, prefixo: tarefa.acesso.prefixo, acao: "encerrado", recurso: null, itemId: null },
    ])
    const auditoria = JSON.stringify(repo.auditoria)
    expect(auditoria).not.toContain(chave.segredo)
    expect(auditoria).not.toContain(tarefa.segredo)
  })

  it("atividade devolve as mais recentes primeiro, até 20", async () => {
    const { servico, avancar } = montar()
    for (let i = 0; i < 25; i++) {
      await servico.criarUnico(unico)
      avancar(1000)
    }

    const atividade = await servico.atividade()

    expect(atividade).toHaveLength(20)
    expect(atividade[0]?.em).toBe("2026-11-03T14:00:24.000Z")
  })
})
