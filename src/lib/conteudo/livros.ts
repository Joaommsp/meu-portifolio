import { bookFormSchema, type BookFormValues } from "@/lib/validations"
import type { BookInput, BookStatus } from "@/types/book"

import { booleano, listaDeTextos, numero, numeroOuNulo, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const livros: DefinicaoRecurso<BookFormValues, BookInput> = {
  recurso: "livros",
  rotulo: "Livros",
  colecao: "books",
  idDoDocumentoUnico: null,
  ordem: { campo: "yearRead", direcao: "desc" },
  temSlug: true,
  unico: false,
  schema: bookFormSchema,
  descricao:
    "Livros da estante (/livros). synopsis e whyILikeIt em markdown; rating de 0 a 10.",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      slug: texto(d.slug),
      title: texto(d.title),
      author: texto(d.author),
      shortDescription: texto(d.shortDescription),
      synopsis: texto(d.synopsis),
      whyILikeIt: texto(d.whyILikeIt),
      coverImage: texto(d.coverImage),
      genres: listaDeTextos(d.genres),
      status: texto(d.status) as BookStatus,
      yearRead: numero(d.yearRead),
      pages: numeroOuNulo(d.pages),
      rating: numeroOuNulo(d.rating),
      featured: booleano(d.featured),
      published: booleano(d.published),
    }
  },

  paraEntrada(valores) {
    return {
      slug: valores.slug,
      title: valores.title,
      author: valores.author,
      shortDescription: valores.shortDescription,
      synopsis: valores.synopsis,
      whyILikeIt: valores.whyILikeIt,
      coverImage: valores.coverImage,
      genres: valores.genres,
      status: valores.status,
      yearRead: valores.yearRead,
      pages: valores.pages,
      rating: valores.rating,
      featured: valores.featured,
      published: valores.published,
    }
  },
}
