/**
 * Rótulos livres que vêm do CMS (gêneros, plataformas, tags), prontos pra
 * virar filtro.
 *
 * São digitados à mão no admin, então a mesma coisa chega escrita de jeitos
 * diferentes: "StoryTelling" e "Storytelling" viravam dois chips em /livros.
 */

/** A chave de comparação: sem diferença de maiúscula nem espaço nas pontas. */
export function chaveRotulo(rotulo: string): string {
  return rotulo.trim().toLocaleLowerCase("pt-BR")
}

/** Um rótulo pronto pra virar chip: a chave compara, o rótulo aparece. */
export type RotuloFiltro = { chave: string; rotulo: string }

/**
 * Os rótulos distintos de uma lista, do mais usado pro menos usado. Variações
 * de escrita viram um só, exibido com a grafia que apareceu primeiro.
 */
export function contarRotulos<T>(
  itens: readonly T[],
  extrair: (item: T) => readonly string[]
): RotuloFiltro[] {
  const contagem = new Map<string, { rotulo: string; n: number }>()
  for (const item of itens) {
    for (const rotulo of extrair(item)) {
      const chave = chaveRotulo(rotulo)
      const atual = contagem.get(chave)
      if (atual) atual.n += 1
      else contagem.set(chave, { rotulo: rotulo.trim(), n: 1 })
    }
  }
  return Array.from(contagem.entries())
    .sort((a, b) => b[1].n - a[1].n)
    .map(([chave, { rotulo }]) => ({ chave, rotulo }))
}

/** Se o item tem algum dos rótulos ativos (comparando pela chave). */
export function temAlgumRotulo(
  rotulos: readonly string[],
  ativos: ReadonlySet<string>
): boolean {
  return rotulos.some((r) => ativos.has(chaveRotulo(r)))
}

/** Se o item tem TODOS os rótulos ativos (o filtro "e" de tecnologias). */
export function temTodosRotulos(
  rotulos: readonly string[],
  ativos: ReadonlySet<string>
): boolean {
  const chaves = new Set(rotulos.map(chaveRotulo))
  return Array.from(ativos).every((a) => chaves.has(a))
}
