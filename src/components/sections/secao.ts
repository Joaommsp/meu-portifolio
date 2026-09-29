/**
 * Casca das seções da home: largura, gutter e respiro vertical, no mesmo
 * papel do `SECAO` das páginas de serviço.
 *
 * `py-16` no celular: com `py-32`, o fim de uma seção e o começo da próxima
 * somavam 256px de vazio, e a home passava de 13 mil px de altura.
 */
export const SECAO_HOME = "container mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-32"

/**
 * Casca dos heros: ocupa a tela inteira e centra o conteúdo na vertical. É a
 * mesma na home (Hero) e nas internas (PageHero), pra que as duas abram com a
 * janela na mesma altura. O padding fica de fora: cada hero põe o seu.
 *
 * Uma tela = `--altura-palco`, a mesma do palco do HeroSobreposto.
 *
 * A base existe sem `isolate` porque o ServiceHero não pode isolar: o blend
 * do vídeo dele compõe contra o fundo de fora.
 */
export const CASCA_HERO_BASE =
  "relative flex min-h-(--altura-palco) items-center overflow-hidden"

export const CASCA_HERO = `${CASCA_HERO_BASE} isolate`
