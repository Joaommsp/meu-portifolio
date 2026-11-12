import { gameFormSchema, type GameFormValues } from "@/lib/validations"
import type { GameInput, GameStatus } from "@/types/game"

import { booleano, listaDeTextos, numero, numeroOuNulo, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const games: DefinicaoRecurso<GameFormValues, GameInput> = {
  recurso: "games",
  rotulo: "Games",
  colecao: "games",
  idDoDocumentoUnico: null,
  ordem: { campo: "yearPlayed", direcao: "desc" },
  temSlug: true,
  unico: false,
  schema: gameFormSchema,
  descricao:
    "Catálogo de jogos já jogados (/games). history e whyILikeIt em markdown; ao menos uma plataforma.",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      slug: texto(d.slug),
      title: texto(d.title),
      shortDescription: texto(d.shortDescription),
      history: texto(d.history),
      whyILikeIt: texto(d.whyILikeIt),
      coverImage: texto(d.coverImage),
      gallery: listaDeTextos(d.gallery),
      platforms: listaDeTextos(d.platforms),
      genres: listaDeTextos(d.genres),
      status: texto(d.status) as GameStatus,
      yearPlayed: numero(d.yearPlayed),
      hoursPlayed: numeroOuNulo(d.hoursPlayed),
      rating: numeroOuNulo(d.rating),
      featured: booleano(d.featured),
      published: booleano(d.published),
    }
  },

  paraEntrada(valores) {
    return {
      slug: valores.slug,
      title: valores.title,
      shortDescription: valores.shortDescription,
      history: valores.history,
      whyILikeIt: valores.whyILikeIt,
      coverImage: valores.coverImage,
      gallery: valores.gallery,
      platforms: valores.platforms,
      genres: valores.genres,
      status: valores.status,
      yearPlayed: valores.yearPlayed,
      hoursPlayed: valores.hoursPlayed,
      rating: valores.rating,
      featured: valores.featured,
      published: valores.published,
    }
  },
}
