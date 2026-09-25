/**
 * Endereço público do site — fonte única.
 *
 * Estava repetido em sete arquivos (layout, robots, sitemap e as páginas de
 * detalhe), cada um com o próprio fallback. O fallback apontava para um
 * domínio que não é do dono do site, e como `NEXT_PUBLIC_SITE_URL` não estava
 * definida, era ELE que valia: a URL canônica, o Open Graph, o JSON-LD, o
 * robots e todas as entradas do sitemap saíam com o domínio errado.
 *
 * Definir `NEXT_PUBLIC_SITE_URL` no ambiente continua sendo o certo quando
 * houver domínio próprio; o fallback existe para o build não quebrar sem ela.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://softwaredeveloper-jmmsp.vercel.app"

/** Só o host, para exibir nos cards de Open Graph. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")

/**
 * Disponibilidade para trabalho — fonte única.
 *
 * Estava escrito à mão na página de contato e, depois, nas quatro páginas de
 * serviço, já com a redação divergindo ("aceitando freelas" × "aceitando
 * projetos") para o mesmo fato. O dia em que a resposta for "não estou
 * aceitando", o lugar de mudar é aqui — não cinco.
 */
export const DISPONIBILIDADE = {
  status: "Aceitando projetos",
  resposta: "Resposta em até 24h",
  base: "Remoto",
} as const
