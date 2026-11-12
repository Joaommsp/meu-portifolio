import "server-only"

import type { Recurso } from "@/lib/conteudo/tipos"
import type { AcaoAuditada, EscopoDoUnico, TipoAcesso } from "@/lib/mcp/tipos"

/** Acesso no servidor (`mcpAcessos/{hash}`); `id` é o sha256 do segredo. */
export type Acesso = {
  id: string
  tipo: TipoAcesso
  prefixo: string
  nome: string | null
  tarefa: string | null
  escopo: EscopoDoUnico | null
  criadoEm: Date
  expiraEm: Date
  revogadoEm: Date | null
  encerradoEm: Date | null
  ultimoUsoEm: Date | null
}

/** Registro de `mcpAuditoria`: sem segredo nem dados do item. */
export type RegistroAuditoria = {
  id: string
  em: Date
  acessoId: string
  prefixo: string
  acao: AcaoAuditada
  recurso: Recurso | null
  itemId: string | null
}
