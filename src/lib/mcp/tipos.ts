import type { Recurso } from "@/lib/conteudo/tipos"

/**
 * Tipos do MCP do admin que o servidor e a tela compartilham. Puro.
 */

export const TIPOS_DE_ACESSO = ["pessoal", "unico"] as const
export type TipoAcesso = (typeof TIPOS_DE_ACESSO)[number]

/** Começo do segredo de cada tipo (`pf_pk_...`, `pf_uu_...`). */
export const PREFIXO_DO_SEGREDO: Record<TipoAcesso, string> = {
  pessoal: "pf_pk_",
  unico: "pf_uu_",
}

/** Ações que o uso único pode receber; apagar fica só na chave pessoal. */
export const ACOES_DO_UNICO = ["ler", "criar", "editar"] as const
export type AcaoDoUnico = (typeof ACOES_DO_UNICO)[number]

export type EscopoDoUnico = {
  recurso: Recurso
  itemId: string | null
  acoes: AcaoDoUnico[]
}

export const SITUACOES_DE_ACESSO = [
  "ativo",
  "revogado",
  "encerrado",
  "vencido",
] as const
export type SituacaoAcesso = (typeof SITUACOES_DE_ACESSO)[number]

export const ACOES_AUDITADAS = [
  "chave_criada",
  "unico_criado",
  "revogado",
  "encerrado",
  "apagado",
  "criar",
  "atualizar",
  "apagar",
  "subir_imagem",
] as const
export type AcaoAuditada = (typeof ACOES_AUDITADAS)[number]

/** Acesso como sai para a tela: datas em ISO e situação já derivada. */
export type AcessoVisto = {
  id: string
  tipo: TipoAcesso
  prefixo: string
  nome: string | null
  tarefa: string | null
  escopo: EscopoDoUnico | null
  criadoEm: string
  expiraEm: string
  revogadoEm: string | null
  encerradoEm: string | null
  ultimoUsoEm: string | null
  situacao: SituacaoAcesso
}

/** Acesso recém-criado: o segredo sai só aqui, uma vez. */
export type AcessoCriado = { acesso: AcessoVisto; segredo: string }

export type ListaDeAcessos = { pessoais: AcessoVisto[]; unicos: AcessoVisto[] }

/**
 * Contrato de `/api/admin/mcp/acessos`. `enderecoMcp` é o endereço público
 * do `/api/mcp` resolvido pelo servidor; a tela só mostra.
 */
export type RespostaDaLista = ListaDeAcessos & { enderecoMcp: string }

/** 201 da criação; `prompt` vem só no uso único. */
export type RespostaDaCriacao = AcessoCriado & { enderecoMcp: string; prompt?: string }

/** Linha da atividade recente: sem segredo nem dados do item. */
export type RegistroVisto = {
  id: string
  em: string
  acessoId: string
  prefixo: string
  acao: AcaoAuditada
  recurso: Recurso | null
  itemId: string | null
}
