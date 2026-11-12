import "server-only"

import type { SituacaoAcesso } from "@/lib/mcp/tipos"

import type { Acesso } from "./tipos"

/**
 * Situação derivada das datas, nunca gravada. Precedência: revogado,
 * encerrado, vencido, ativo. Vence no instante exato de `expiraEm`.
 */
export function situacao(
  acesso: Pick<Acesso, "revogadoEm" | "encerradoEm" | "expiraEm">,
  agora: Date
): SituacaoAcesso {
  if (acesso.revogadoEm) return "revogado"
  if (acesso.encerradoEm) return "encerrado"
  if (agora.getTime() >= acesso.expiraEm.getTime()) return "vencido"
  return "ativo"
}
