import { projectFormSchema, type ProjectFormValues } from "@/lib/validations"
import type {
  ProjectCategory,
  ProjectInput,
  ProjectStatus,
} from "@/types/project"

import {
  booleano,
  data,
  deDataIso,
  listaDeTextos,
  paraDataIso,
  texto,
} from "./leitura"
import type { DefinicaoRecurso } from "./tipos"

export const projetos: DefinicaoRecurso<ProjectFormValues, ProjectInput> = {
  recurso: "projetos",
  rotulo: "Projetos",
  colecao: "projects",
  idDoDocumentoUnico: null,
  ordem: { campo: "startDate", direcao: "desc" },
  temSlug: true,
  unico: false,
  schema: projectFormSchema,
  descricao:
    "Projetos do portfólio (/projetos). Datas em YYYY-MM-DD; projeto concluído precisa de endDate.",

  deDocumento(dados) {
    const d = dados ?? {}
    const inicio = data(d.startDate)
    const fim = data(d.endDate)
    return {
      slug: texto(d.slug),
      title: texto(d.title),
      shortDescription: texto(d.shortDescription),
      fullDescription: texto(d.fullDescription),
      coverImage: texto(d.coverImage),
      gallery: listaDeTextos(d.gallery),
      technologies: listaDeTextos(d.technologies),
      category: texto(d.category) as ProjectCategory,
      liveUrl: texto(d.liveUrl),
      githubUrl: texto(d.githubUrl),
      featured: booleano(d.featured),
      status: texto(d.status) as ProjectStatus,
      startDate: inicio ? paraDataIso(inicio) : "",
      endDate: fim ? paraDataIso(fim) : "",
    }
  },

  /** Strings do formulário para o que se grava: `Date` e URL vazia como `null`. */
  paraEntrada(valores) {
    return {
      slug: valores.slug,
      title: valores.title,
      shortDescription: valores.shortDescription,
      fullDescription: valores.fullDescription,
      coverImage: valores.coverImage,
      gallery: valores.gallery,
      technologies: valores.technologies,
      category: valores.category,
      liveUrl: valores.liveUrl.trim() || null,
      githubUrl: valores.githubUrl.trim() || null,
      featured: valores.featured,
      status: valores.status,
      startDate: deDataIso(valores.startDate),
      endDate: valores.endDate ? deDataIso(valores.endDate) : null,
    }
  },
}
