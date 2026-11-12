import type { ZodType } from "zod"

/**
 * Contrato da definição de recurso: tudo o que é regra de um tipo de
 * conteúdo do admin, sem SDK. O formulário do admin (navegador) e o servidor
 * do MCP (firebase-admin) leem a mesma definição, então a regra mora num
 * lugar só.
 */

/** Nome do recurso na face do MCP. A coleção do Firestore fica na definição. */
export const NOMES_DE_RECURSO = [
  "projetos",
  "posts",
  "livros",
  "games",
  "figma",
  "uses",
  "atualmente",
  "jogando",
] as const
export type Recurso = (typeof NOMES_DE_RECURSO)[number]

/** Ordenação da listagem, a mesma que o admin usa hoje. */
export type Ordem = {
  campo: string
  direcao: "asc" | "desc"
}

/**
 * Documento como foi lido do banco, já sem o `id`. Datas podem chegar como
 * `Date`, string ISO (saída JSON do servidor) ou `Timestamp` (algo com
 * `toDate()`); a definição normaliza.
 */
export type DocumentoLido = Record<string, unknown>

/** Marca para o repositório trocar pelo carimbo de data do servidor. */
export const AGORA = "agora" as const

/** Campos que o servidor calcula na gravação (hoje só os de posts). */
export type CamposDerivados = Record<string, unknown>

export interface DefinicaoRecurso<Valores, Entrada> {
  recurso: Recurso
  /** Nome na tela do admin, o mesmo da navegação lateral. */
  rotulo: string
  /** Coleção do Firestore (`projects`, `books`...). */
  colecao: string
  /**
   * Id fixo do documento quando o recurso é um documento só (`atualmente`
   * mora em `site/currently`). `null` nos demais.
   */
  idDoDocumentoUnico: string | null
  /** `null` no documento único, que não tem listagem. */
  ordem: Ordem | null
  temSlug: boolean
  /** Documento único: sem `listar`, `criar` nem `apagar`. */
  unico: boolean
  /** O schema do formulário do admin; o MCP valida com ele também. */
  schema: ZodType<Valores>
  /** Documento lido para a forma do formulário (datas em `YYYY-MM-DD`). */
  deDocumento(dados: DocumentoLido | null): Valores
  /** Forma do formulário para o que se grava (datas como `Date`). */
  paraEntrada(valores: Valores): Entrada
  /**
   * Campos calculados a partir da entrada e do documento atual (`null` ao
   * criar). A entrada pode ser parcial (o admin grava só o que mudou): campo
   * ausente não recalcula o que depende dele. Puro: quem grava troca `AGORA`
   * pelo carimbo do servidor.
   */
  derivados?(
    entrada: Partial<Entrada>,
    atual: DocumentoLido | null
  ): CamposDerivados
  /** Texto curto para a ferramenta `descrever_recurso`. */
  descricao: string
}

/** Códigos de erro de domínio que o MCP e as rotas de gestão devolvem. */
export const CODIGOS_DE_ERRO = [
  "VALIDACAO",
  "NAO_ENCONTRADO",
  "SLUG_EM_USO",
  "ACAO_INVALIDA",
  "FORA_DO_ESCOPO",
  "FALHA_EXTERNA",
  "IMAGEM_GRANDE",
  "TIPO_NAO_SUPORTADO",
  "ACESSO_ATIVO",
  // SPEC_DEVIATION: código novo; a spec pede 409 ao revogar ou encerrar acesso já inativo sem nomear o código.
  "ACESSO_INATIVO",
  "LIMITE_DE_CHAVES",
] as const
export type CodigoErro = (typeof CODIGOS_DE_ERRO)[number]

/**
 * Erro previsto pela regra (não é bug): vira `isError: true` na ferramenta
 * do MCP ou status HTTP com significado na rota de gestão.
 */
export class ErroDominio extends Error {
  constructor(
    readonly codigo: CodigoErro,
    mensagem: string,
    /** Campo → mensagem, quando o erro é de validação. */
    readonly campos?: Record<string, string>
  ) {
    super(mensagem)
    this.name = "ErroDominio"
  }
}
