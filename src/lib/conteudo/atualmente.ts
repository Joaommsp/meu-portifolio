import {
  atualmenteFormSchema,
  type AtualmenteFormValues,
} from "@/lib/validations"
import {
  CURRENTLY_SLOTS,
  type CurrentlyItem,
  type CurrentlySlot,
} from "@/types/currently"

import { booleano, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export type AtualmenteInput = Record<CurrentlySlot, CurrentlyItem>

/** Slot lido do banco: campo ausente vira o vazio do formulário. */
export function normalizarItemAtual(bruto: unknown): CurrentlyItem {
  const o = (bruto ?? {}) as Record<string, unknown>
  return {
    title: texto(o.title),
    subtitle: texto(o.subtitle),
    link: texto(o.link),
    visible: booleano(o.visible),
  }
}

/**
 * Documento único `site/currently`: sem listar, criar nem apagar. Ler e
 * atualizar não levam id.
 */
export const atualmente: DefinicaoRecurso<AtualmenteFormValues, AtualmenteInput> = {
  recurso: "atualmente",
  rotulo: "Atualmente",
  colecao: "site",
  idDoDocumentoUnico: "currently",
  ordem: null,
  temSlug: false,
  unico: true,
  schema: atualmenteFormSchema,
  descricao: `Os ${CURRENTLY_SLOTS.length} cards fixos de /sobre (${CURRENTLY_SLOTS.join(", ")}), cada um com title, subtitle, link e visible. Documento único: obter e atualizar sem id.`,

  deDocumento(dados) {
    const d = dados ?? {}
    const valores = {} as AtualmenteFormValues
    for (const slot of CURRENTLY_SLOTS) {
      valores[slot] = normalizarItemAtual(d[slot])
    }
    return valores
  },

  paraEntrada(valores) {
    const entrada = {} as AtualmenteInput
    for (const slot of CURRENTLY_SLOTS) {
      entrada[slot] = normalizarItemAtual(valores[slot])
    }
    return entrada
  },
}
