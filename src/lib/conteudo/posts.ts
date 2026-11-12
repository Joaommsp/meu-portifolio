import { postFormSchema, type PostFormValues } from "@/lib/validations"
import type { PostCategory, PostInput } from "@/types/post"

import { booleano, listaDeTextos, texto } from "./leitura"
import { AGORA, type CamposDerivados, type DefinicaoRecurso } from "./tipos"

/**
 * Estima tempo de leitura: ~200 palavras/min é a média de leitura adulta.
 * Conta palavras no markdown depois de stripear código/links.
 */
export function estimateReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → texto
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // imagens
  const words = stripped.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const posts: DefinicaoRecurso<PostFormValues, PostInput> = {
  recurso: "posts",
  rotulo: "Posts",
  colecao: "posts",
  idDoDocumentoUnico: null,
  ordem: { campo: "createdAt", direcao: "desc" },
  temSlug: true,
  unico: false,
  schema: postFormSchema,
  descricao:
    "Posts do blog (/blog), em markdown. readingTime e publishedAt são calculados ao gravar.",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      slug: texto(d.slug),
      title: texto(d.title),
      excerpt: texto(d.excerpt),
      content: texto(d.content),
      coverImage: texto(d.coverImage),
      category: texto(d.category) as PostCategory,
      tags: listaDeTextos(d.tags),
      published: booleano(d.published),
      featured: booleano(d.featured),
    }
  },

  paraEntrada(valores) {
    return {
      slug: valores.slug,
      title: valores.title,
      excerpt: valores.excerpt,
      content: valores.content,
      coverImage: valores.coverImage,
      category: valores.category,
      tags: valores.tags,
      published: valores.published,
      featured: valores.featured,
    }
  },

  /**
   * `publishedAt` marca a primeira publicação e não muda nas edições
   * seguintes; despublicar zera. Ao criar, `views` nasce em 0.
   */
  derivados(entrada, atual) {
    const campos: CamposDerivados = {}
    if (entrada.content !== undefined) {
      campos.readingTime = estimateReadingTime(entrada.content)
    }
    if (atual === null) {
      campos.views = 0
      campos.publishedAt = entrada.published ? AGORA : null
    } else if (entrada.published === true) {
      if (atual.publishedAt == null) campos.publishedAt = AGORA
    } else if (entrada.published === false) {
      campos.publishedAt = null
    }
    return campos
  },
}
