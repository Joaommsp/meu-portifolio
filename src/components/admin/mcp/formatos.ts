import { differenceInHours, format, formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"

import { TOM_SELO } from "@/components/selo/tons"
import { RECURSOS } from "@/lib/conteudo"
import { NOMES_DE_RECURSO, type Recurso } from "@/lib/conteudo/tipos"
import type { AcaoAuditada, AcaoDoUnico, SituacaoAcesso } from "@/lib/mcp/tipos"

/**
 * Rótulos e formatos da tela `/admin/mcp`. Os valores (recursos, ações,
 * situações) vêm dos tipos compartilhados; aqui só o texto de cada um.
 */

/** Mesmo nome da navegação do admin, lido da definição de cada recurso. */
export const ROTULO_DO_RECURSO = Object.fromEntries(
  NOMES_DE_RECURSO.map((r) => [r, RECURSOS[r].rotulo])
) as Record<Recurso, string>

export const ROTULO_DA_ACAO_DO_UNICO: Record<AcaoDoUnico, string> = {
  ler: "Ler",
  criar: "Criar",
  editar: "Editar",
}

/** Ações do escopo em texto: "Ler, Criar". */
export function rotuloDasAcoes(acoes: readonly AcaoDoUnico[]): string {
  return acoes.map((a) => ROTULO_DA_ACAO_DO_UNICO[a]).join(", ")
}

export const ROTULO_DA_ACAO_AUDITADA: Record<AcaoAuditada, string> = {
  chave_criada: "criou chave",
  unico_criado: "criou acesso único",
  revogado: "revogou",
  encerrado: "encerrou",
  apagado: "apagou acesso",
  criar: "criou",
  atualizar: "editou",
  apagar: "apagou",
  subir_imagem: "subiu imagem",
}

export const ROTULO_DA_SITUACAO: Record<SituacaoAcesso, string> = {
  ativo: "Ativo",
  revogado: "Revogado",
  encerrado: "Encerrado",
  vencido: "Vencido",
}

export const TOM_DA_SITUACAO: Record<SituacaoAcesso, string> = {
  ativo: TOM_SELO.success,
  revogado: TOM_SELO.perigo,
  encerrado: TOM_SELO.apagado,
  vencido: TOM_SELO.warning,
}

/** Abaixo disso a data vira "há 4 min". */
const HORAS_DO_RELATIVO = 24

export function formatarData(iso: string | Date): string {
  return format(new Date(iso), "dd/MM/yyyy")
}

export function formatarDataHora(iso: string | Date): string {
  return format(new Date(iso), "dd/MM/yyyy HH:mm")
}

export function formatarHora(iso: string | Date): string {
  return format(new Date(iso), "HH:mm")
}

/** Recente em relativo ("há 4 minutos"); mais antigo em data e hora. */
export function formatarQuando(iso: string): string {
  const data = new Date(iso)
  if (differenceInHours(new Date(), data) < HORAS_DO_RELATIVO) {
    return formatDistanceToNowStrict(data, { locale: ptBR, addSuffix: true })
  }
  return formatarDataHora(data)
}
