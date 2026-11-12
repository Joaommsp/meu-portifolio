import { z } from "zod"

import { atualmente } from "./atualmente"
import { figma } from "./figma"
import { games } from "./games"
import { jogando } from "./jogando"
import { livros } from "./livros"
import { posts } from "./posts"
import { projetos } from "./projetos"
import { NOMES_DE_RECURSO, type DefinicaoRecurso, type Recurso } from "./tipos"
import { uses } from "./uses"

/** As 8 definições, pelo nome do recurso na face do MCP. */
export const RECURSOS = {
  projetos,
  posts,
  livros,
  games,
  figma,
  uses,
  atualmente,
  jogando,
} satisfies Record<Recurso, DefinicaoRecurso<unknown, unknown>>

export function definicaoDe(recurso: Recurso): DefinicaoRecurso<unknown, unknown> {
  return RECURSOS[recurso]
}

/** Recursos que são um documento só (hoje, `atualmente`). */
export const RECURSOS_DE_DOCUMENTO_UNICO: readonly Recurso[] = NOMES_DE_RECURSO.filter(
  (r) => RECURSOS[r].unico
)

export type DescricaoRecurso = {
  recurso: Recurso
  descricao: string
  /** Documento único: obter e atualizar sem id; sem listar, criar e apagar. */
  documentoUnico: boolean
  temSlug: boolean
  /** JSON Schema de cada campo: tipo, limites, formato e enum. */
  campos: Record<string, Record<string, unknown>>
  obrigatorios: string[]
}

/**
 * O que a LLM precisa saber antes de gravar, lido do próprio schema do
 * formulário: nada aqui é lista mantida à mão. Regra que cruza campos (ex.:
 * término depois do início) não cabe no JSON Schema e vai na `descricao`.
 */
export function descreverRecurso(recurso: Recurso): DescricaoRecurso {
  const definicao = definicaoDe(recurso)
  const json = z.toJSONSchema(definicao.schema, {
    io: "input",
    unrepresentable: "any",
  })
  return {
    recurso,
    descricao: definicao.descricao,
    documentoUnico: definicao.unico,
    temSlug: definicao.temSlug,
    campos: (json.properties ?? {}) as DescricaoRecurso["campos"],
    obrigatorios: json.required ?? [],
  }
}

export { NOMES_DE_RECURSO, ErroDominio, AGORA } from "./tipos"
export type { Recurso, DefinicaoRecurso, CodigoErro } from "./tipos"
