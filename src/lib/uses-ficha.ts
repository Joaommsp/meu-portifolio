/**
 * Ficha técnica dos itens do /uses, lida da descrição livre do admin.
 */

export type LinhaFicha = { rotulo: string; valor: string } | { texto: string }

/** "Rótulo:" dentro do texto: palavra com inicial maiúscula e até duas
    seguintes ("Placa de Vídeo", "Memória RAM"). Sigla solta como "GB" não
    abre rótulo, porque exige minúscula depois da primeira letra. */
const ROTULO = /([A-ZÀ-Ý][a-zà-ÿ]+(?: (?:de |da |do )?[A-Za-zÀ-ÿ]+){0,2}):\s*/g

/**
 * Lê a descrição do admin como ficha técnica. Os rótulos podem vir em linhas
 * separadas ou colados no mesmo texto ("...Geração)Placa de Vídeo: ..."); o
 * que vem antes do primeiro rótulo, ou uma descrição sem rótulo, fica texto.
 */
export function lerFicha(descricao: string): LinhaFicha[] {
  const texto = descricao.replace(/\s+/g, " ").trim()
  if (!texto) return []
  const achados = [...texto.matchAll(ROTULO)]
  if (achados.length === 0) return [{ texto }]
  const linhas: LinhaFicha[] = []
  const antes = texto.slice(0, achados[0]!.index).trim()
  if (antes) linhas.push({ texto: antes })
  achados.forEach((m, i) => {
    const inicio = m.index! + m[0].length
    const fim = i + 1 < achados.length ? achados[i + 1]!.index! : texto.length
    const valor = texto.slice(inicio, fim).trim()
    if (valor) linhas.push({ rotulo: m[1]!, valor })
  })
  return linhas
}
