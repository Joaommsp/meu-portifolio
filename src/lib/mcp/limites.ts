/**
 * Limites e prazos do MCP do admin, num lugar só. Puro: o servidor aplica e
 * a tela do admin mostra os mesmos números (contador, validade, aviso).
 */

export const MS_POR_MINUTO = 60_000
export const MS_POR_HORA = 60 * MS_POR_MINUTO
export const MS_POR_DIA = 24 * MS_POR_HORA

export const BYTES_POR_MB = 1024 * 1024

/** Tamanho como aparece no texto: `3 MB`. */
export function emMegabytes(bytes: number): string {
  return `${bytes / BYTES_POR_MB} MB`
}

/** Validades aceitas para a chave pessoal, em dias. */
export const VALIDADES_DA_CHAVE_DIAS = [1, 30, 90] as const
export type ValidadeDaChave = (typeof VALIDADES_DA_CHAVE_DIAS)[number]
export const VALIDADE_PADRAO_DIAS: ValidadeDaChave = 90

/** O acesso de uso único vence 2 h após a criação. */
export const DURACAO_DO_UNICO_HORAS = 2

/** Chaves pessoais ativas ao mesmo tempo. */
export const MAX_CHAVES_PESSOAIS_ATIVAS = 10

/** A mesma frase no aviso da tela e no 409 do servidor. */
export function mensagemLimiteDeChaves(): string {
  return `${MAX_CHAVES_PESSOAIS_ATIVAS} chaves ativas, o limite. Revogue uma para gerar outra.`
}

/** Chamadas por minuto por acesso; a 121ª recebe 429. */
export const MAX_CHAMADAS_POR_MINUTO = 120

/** Itens por página no `listar`. */
export const ITENS_POR_PAGINA = 50

/** Imagem em base64, medida depois de decodificar. */
export const MAX_BYTES_DA_IMAGEM = 3 * BYTES_POR_MB

/** Corpo da requisição em `/api/mcp`; acima disso, 413. */
export const MAX_BYTES_DO_CORPO = 4 * BYTES_POR_MB

/** `ultimoUsoEm` é gravado no máximo uma vez neste intervalo. */
export const INTERVALO_DO_ULTIMO_USO_MS = MS_POR_MINUTO

export const TAMANHO_MAX_DO_NOME = 60
export const TAMANHO_MAX_DA_TAREFA = 500

/** Registros mostrados na atividade recente. */
export const REGISTROS_DA_ATIVIDADE = 20

/** A mesma resposta 401 para ausente, inexistente, revogado, encerrado e vencido. */
export const MENSAGEM_ACESSO_INVALIDO = "Acesso inválido ou expirado."
