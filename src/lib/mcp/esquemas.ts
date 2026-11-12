import { z } from "zod"

import { NOMES_DE_RECURSO } from "@/lib/conteudo/tipos"

import {
  TAMANHO_MAX_DA_TAREFA,
  TAMANHO_MAX_DO_NOME,
  VALIDADE_PADRAO_DIAS,
  VALIDADES_DA_CHAVE_DIAS,
} from "./limites"
import { ACOES_DO_UNICO } from "./tipos"

/**
 * Entrada de criação dos acessos. O servidor valida com estes schemas e o
 * formulário do admin pode usar os mesmos.
 */

export const novaChaveSchema = z.object({
  nome: z
    .string({ message: "Informe o nome da chave" })
    .trim()
    .min(1, "Informe o nome da chave")
    .max(TAMANHO_MAX_DO_NOME, `Nome muito longo (máximo ${TAMANHO_MAX_DO_NOME})`),
  validadeDias: z
    .literal(VALIDADES_DA_CHAVE_DIAS, {
      message: `Validade deve ser ${VALIDADES_DA_CHAVE_DIAS.join(", ")} dias`,
    })
    .default(VALIDADE_PADRAO_DIAS),
})
export type NovaChave = z.input<typeof novaChaveSchema>
/** Chave já validada: o que a tela manda completo. */
export type NovaChaveValida = z.output<typeof novaChaveSchema>

export const novoUnicoSchema = z.object({
  recurso: z.enum(NOMES_DE_RECURSO, { message: "Recurso inválido" }),
  itemId: z.string().trim().min(1).nullish().transform((v) => v ?? null),
  acoes: z
    .array(z.enum(ACOES_DO_UNICO, { message: "Ação inválida" }), {
      message: "Marque ao menos uma ação",
    })
    .min(1, "Marque ao menos uma ação")
    .transform((acoes) => [...new Set(acoes)]),
  tarefa: z
    .string({ message: "Descreva a tarefa" })
    .trim()
    .min(1, "Descreva a tarefa")
    .max(TAMANHO_MAX_DA_TAREFA, `Tarefa muito longa (máximo ${TAMANHO_MAX_DA_TAREFA})`),
})
export type NovoUnico = z.input<typeof novoUnicoSchema>
export type NovoUnicoValido = z.output<typeof novoUnicoSchema>
