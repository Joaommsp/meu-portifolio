import "server-only"

import { ErroDominio, type Recurso } from "@/lib/conteudo/tipos"
import { validarOuFalhar } from "@/lib/conteudo/validacao"
import { tokenBearer } from "@/lib/mcp/conexao"
import { novaChaveSchema, novoUnicoSchema, type NovaChave, type NovoUnico } from "@/lib/mcp/esquemas"
import {
  DURACAO_DO_UNICO_HORAS,
  INTERVALO_DO_ULTIMO_USO_MS,
  MAX_CHAVES_PESSOAIS_ATIVAS,
  mensagemLimiteDeChaves,
  MS_POR_DIA,
  MS_POR_HORA,
  REGISTROS_DA_ATIVIDADE,
} from "@/lib/mcp/limites"
import type {
  AcaoAuditada,
  AcessoCriado,
  AcessoVisto,
  ListaDeAcessos,
  RegistroVisto,
} from "@/lib/mcp/tipos"

import type { RepositorioAcessos } from "./repositorio"
import { gerarSegredo, hashDoSegredo } from "./segredo"
import { situacao } from "./situacao"
import type { Acesso, RegistroAuditoria } from "./tipos"

/**
 * Ciclo de vida das chaves pessoais e dos acessos de uso único, e a
 * autenticação do `/api/mcp`. Toda ação grava auditoria sem o segredo.
 */

export type { AcessoCriado }

export type ResultadoAutenticacao =
  | { resultado: "ok"; acesso: Acesso }
  /** 401: ausente, inexistente, revogado, encerrado ou vencido, sem distinção. */
  | { resultado: "invalido" }
  /** 429: passou do limite de chamadas no minuto. */
  | { resultado: "limite" }

export type Relogio = () => Date

const DADOS_INVALIDOS = "Dados inválidos."

const iso = (d: Date | null) => (d ? d.toISOString() : null)

export function paraVisto(acesso: Acesso, agora: Date): AcessoVisto {
  return {
    ...acesso,
    criadoEm: acesso.criadoEm.toISOString(),
    expiraEm: acesso.expiraEm.toISOString(),
    revogadoEm: iso(acesso.revogadoEm),
    encerradoEm: iso(acesso.encerradoEm),
    ultimoUsoEm: iso(acesso.ultimoUsoEm),
    situacao: situacao(acesso, agora),
  }
}

function registroVisto(r: RegistroAuditoria): RegistroVisto {
  return { ...r, em: r.em.toISOString() }
}

export function criarServicoAcessos(
  repo: RepositorioAcessos,
  relogio: Relogio = () => new Date()
) {
  async function auditar(
    acesso: Pick<Acesso, "id" | "prefixo">,
    acao: AcaoAuditada,
    recurso: Recurso | null = null,
    itemId: string | null = null
  ): Promise<void> {
    await repo.registrarAuditoria({
      em: relogio(),
      acessoId: acesso.id,
      prefixo: acesso.prefixo,
      acao,
      recurso,
      itemId,
    })
  }

  async function exigir(id: string): Promise<Acesso> {
    const acesso = await repo.obter(id)
    if (!acesso) throw new ErroDominio("NAO_ENCONTRADO", "Acesso não encontrado.")
    return acesso
  }

  function exigirAtivo(acesso: Acesso, agora: Date): void {
    if (situacao(acesso, agora) !== "ativo") {
      throw new ErroDominio("ACESSO_INATIVO", "Este acesso já está inativo.")
    }
  }

  async function gravarNovo(
    tipo: Acesso["tipo"],
    campos: Pick<Acesso, "nome" | "tarefa" | "escopo">,
    duracaoMs: number,
    agora: Date
  ): Promise<{ acesso: Acesso; segredo: string }> {
    const { segredo, hash, prefixo } = gerarSegredo(tipo)
    const acesso: Acesso = {
      id: hash,
      tipo,
      prefixo,
      ...campos,
      criadoEm: agora,
      expiraEm: new Date(agora.getTime() + duracaoMs),
      revogadoEm: null,
      encerradoEm: null,
      ultimoUsoEm: null,
    }
    await repo.criar(acesso)
    return { acesso, segredo }
  }

  return {
    async criarChave(entrada: NovaChave): Promise<AcessoCriado> {
      const { nome, validadeDias } = validarOuFalhar(
        novaChaveSchema.safeParse(entrada),
        DADOS_INVALIDOS
      )
      const agora = relogio()
      if ((await repo.contarPessoaisAtivas(agora)) >= MAX_CHAVES_PESSOAIS_ATIVAS) {
        throw new ErroDominio(
          "LIMITE_DE_CHAVES",
          mensagemLimiteDeChaves()
        )
      }
      const { acesso, segredo } = await gravarNovo(
        "pessoal",
        { nome, tarefa: null, escopo: null },
        validadeDias * MS_POR_DIA,
        agora
      )
      await auditar(acesso, "chave_criada")
      return { acesso: paraVisto(acesso, agora), segredo }
    },

    async criarUnico(entrada: NovoUnico): Promise<AcessoCriado> {
      const { recurso, itemId, acoes, tarefa } = validarOuFalhar(
        novoUnicoSchema.safeParse(entrada),
        DADOS_INVALIDOS
      )
      const agora = relogio()
      const { acesso, segredo } = await gravarNovo(
        "unico",
        { nome: null, tarefa, escopo: { recurso, itemId, acoes } },
        DURACAO_DO_UNICO_HORAS * MS_POR_HORA,
        agora
      )
      await auditar(acesso, "unico_criado", recurso, itemId)
      return { acesso: paraVisto(acesso, agora), segredo }
    },

    async revogar(id: string): Promise<AcessoVisto> {
      const agora = relogio()
      const acesso = await exigir(id)
      exigirAtivo(acesso, agora)
      await repo.atualizar(id, { revogadoEm: agora })
      await auditar(acesso, "revogado")
      return paraVisto({ ...acesso, revogadoEm: agora }, agora)
    },

    /** Pelo dono (botão Encerrar) ou pelo próprio acesso (`concluir_tarefa`). */
    async encerrar(id: string): Promise<AcessoVisto> {
      const agora = relogio()
      const acesso = await exigir(id)
      if (acesso.tipo !== "unico") {
        throw new ErroDominio("ACAO_INVALIDA", "Só acesso de uso único pode ser encerrado; revogue a chave.")
      }
      exigirAtivo(acesso, agora)
      await repo.atualizar(id, { encerradoEm: agora })
      await auditar(acesso, "encerrado")
      return paraVisto({ ...acesso, encerradoEm: agora }, agora)
    },

    /** Só inativo; a auditoria do acesso continua registrada. */
    async apagar(id: string): Promise<void> {
      const agora = relogio()
      const acesso = await exigir(id)
      if (situacao(acesso, agora) === "ativo") {
        throw new ErroDominio("ACESSO_ATIVO", "Revogue ou encerre o acesso antes de apagar.")
      }
      await repo.apagar(id)
      await auditar(acesso, "apagado")
    },

    async listar(): Promise<ListaDeAcessos> {
      const agora = relogio()
      const todos = (await repo.listar()).map((a) => paraVisto(a, agora))
      return {
        pessoais: todos.filter((a) => a.tipo === "pessoal"),
        unicos: todos.filter((a) => a.tipo === "unico"),
      }
    },

    async atividade(limite: number = REGISTROS_DA_ATIVIDADE): Promise<RegistroVisto[]> {
      return (await repo.atividade(limite)).map(registroVisto)
    },

    /** Ferramenta de escrita que terminou com sucesso (AUDIT-01). */
    async auditarFerramenta(
      acesso: Acesso,
      acao: Extract<AcaoAuditada, "criar" | "atualizar" | "apagar" | "subir_imagem">,
      recurso: Recurso | null,
      itemId: string | null
    ): Promise<void> {
      await auditar(acesso, acao, recurso, itemId)
    },

    /** Recebe o header `Authorization` como veio. */
    async autenticar(authorization: string | null): Promise<ResultadoAutenticacao> {
      const segredo = tokenBearer(authorization)
      if (!segredo) return { resultado: "invalido" }
      const agora = relogio()
      const acesso = await repo.obter(hashDoSegredo(segredo))
      if (!acesso || situacao(acesso, agora) !== "ativo") return { resultado: "invalido" }
      // Único sem escopo é documento corrompido: sem escopo não há recorte, então não entra.
      if (acesso.tipo === "unico" && !acesso.escopo) return { resultado: "invalido" }
      if (!(await repo.consumirLimite(acesso.id, agora))) return { resultado: "limite" }
      const ultimo = acesso.ultimoUsoEm?.getTime()
      if (ultimo === undefined || agora.getTime() - ultimo > INTERVALO_DO_ULTIMO_USO_MS) {
        await repo.atualizar(acesso.id, { ultimoUsoEm: agora })
        acesso.ultimoUsoEm = agora
      }
      return { resultado: "ok", acesso }
    },
  }
}

export type ServicoAcessos = ReturnType<typeof criarServicoAcessos>
