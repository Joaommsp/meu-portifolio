import { usesFormSchema, type UsesFormValues } from "@/lib/validations"
import { normalizarItens, type UsesCategoryInput } from "@/types/uses"

import { booleano, numero, texto } from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const uses: DefinicaoRecurso<UsesFormValues, UsesCategoryInput> = {
  recurso: "uses",
  rotulo: "Uses",
  colecao: "uses",
  idDoDocumentoUnico: null,
  ordem: { campo: "order", direcao: "asc" },
  temSlug: false,
  unico: false,
  schema: usesFormSchema,
  descricao:
    "Categorias da página /uses, cada uma com seus itens (name, description, url, starred). Atualizar items troca a lista inteira.",

  deDocumento(dados) {
    const d = dados ?? {}
    return {
      title: texto(d.title),
      description: texto(d.description),
      items: normalizarItens(d.items),
      order: numero(d.order),
      visible: booleano(d.visible),
    }
  },

  paraEntrada(valores) {
    return {
      title: valores.title,
      description: valores.description,
      items: valores.items,
      order: valores.order,
      visible: valores.visible,
    }
  },
}
