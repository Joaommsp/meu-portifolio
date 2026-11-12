import { figmaFormSchema, type FigmaFormValues } from "@/lib/validations"
import type { FigmaFileInput } from "@/types/figma"

import { booleano, numero, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const figma: DefinicaoRecurso<FigmaFormValues, FigmaFileInput> = {
  recurso: "figma",
  rotulo: "Figma",
  colecao: "figma",
  idDoDocumentoUnico: null,
  ordem: { campo: "order", direcao: "asc" },
  temSlug: false,
  unico: false,
  schema: figmaFormSchema,
  descricao:
    "Arquivos da Figma Community mostrados em /figma. order ordena os cards (menor primeiro).",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      title: texto(d.title),
      coverImage: texto(d.coverImage),
      url: texto(d.url),
      likes: numero(d.likes),
      users: numero(d.users),
      order: numero(d.order),
      visible: booleano(d.visible),
    }
  },

  paraEntrada(valores) {
    return {
      title: valores.title,
      coverImage: valores.coverImage,
      url: valores.url,
      likes: valores.likes,
      users: valores.users,
      order: valores.order,
      visible: valores.visible,
    }
  },
}
