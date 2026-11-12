import { jogandoFormSchema, type JogandoFormValues } from "@/lib/validations"
import type { PlayingInput, PlayingStatus } from "@/types/playing"

import { booleano, listaDeTextos, numero, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const jogando: DefinicaoRecurso<JogandoFormValues, PlayingInput> = {
  recurso: "jogando",
  rotulo: "Jogando agora",
  colecao: "playing",
  idDoDocumentoUnico: null,
  ordem: { campo: "order", direcao: "asc" },
  temSlug: false,
  unico: false,
  schema: jogandoFormSchema,
  descricao:
    "Cards de \"jogando agora\" em /agora (o que está em andamento, diferente do catálogo de games). order ordena os cards.",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      title: texto(d.title),
      coverImage: texto(d.coverImage),
      synopsis: texto(d.synopsis),
      genres: listaDeTextos(d.genres),
      platform: texto(d.platform),
      status: texto(d.status) as PlayingStatus,
      order: numero(d.order),
      visible: booleano(d.visible),
    }
  },

  paraEntrada(valores) {
    return {
      title: valores.title,
      coverImage: valores.coverImage,
      synopsis: valores.synopsis,
      genres: valores.genres,
      platform: valores.platform,
      status: valores.status,
      order: valores.order,
      visible: valores.visible,
    }
  },
}
