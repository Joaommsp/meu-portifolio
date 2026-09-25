import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServiceHero } from "@/components/services/ServiceHero"
import { ServiceProof } from "@/components/services/ServiceProof"
import {
  CtaFinal,
  Entregaveis,
  Escopo,
  Faq,
  Processo,
  Relacionados,
} from "@/components/services/service-sections"
import { getAllProjects } from "@/lib/data/projects"
import { SERVICOS, acharServico, rotaServico } from "@/lib/servicos-content"
import { SITE_URL } from "@/lib/site"

/** Quantos projetos a prova mostra antes de mandar pro catálogo. */
const LIMITE_PROVA = 3

/*
  Dinâmica, como as outras rotas de detalhe. O conteúdo em si é estático — mora
  em `lib/servicos-content` e é conhecido no build —, mas a seção de prova lê o
  catálogo de projetos, e `restListProjects` busca com `cache: "no-store"`.
  Fetch sem cache dentro de uma rota marcada como estática faz o Next abortar a
  pré-renderização; declarar aqui evita a surpresa e deixa o modo explícito.

  `generateStaticParams` fica como registro dos slugs — volta a pré-renderizar
  se um dia a leitura do catálogo ganhar revalidação.
*/
export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return SERVICOS.map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const servico = acharServico(slug)
  if (!servico) return { title: "Serviço não encontrado" }

  const url = `${SITE_URL}${rotaServico(servico.slug)}`
  const titulo = `${servico.categoria} — João Marcos`

  return {
    title: servico.categoria,
    description: servico.resumo,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: servico.resumo,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: servico.resumo,
    },
  }
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params
  const servico = acharServico(slug)
  if (!servico) notFound()

  const todos = await getAllProjects()
  /* Quando o conteúdo nomeia os projetos, vale a lista: a categoria "web"
     pega desde site institucional até painel de gestão, e nem todo projeto
     dela serve de prova pra frente que a página está vendendo. */
  const { categorias, projetos } = servico.provas
  const provas = projetos
    ? projetos.flatMap((slug) => todos.find((p) => p.slug === slug) ?? [])
    : todos.filter((p) => categorias.includes(p.category)).slice(0, LIMITE_PROVA)

  /* A numeração sai da ordem REAL das seções: sem projeto na categoria a prova
     não entra, e uma sequência com buraco (01, 02, 04…) numa página de venda
     parece erro. */
  const ordem = [
    "entregaveis",
    "processo",
    ...(provas.length > 0 ? (["prova"] as const) : []),
    "escopo",
    "faq",
    "relacionados",
  ]
  const n = (chave: string) =>
    String(ordem.indexOf(chave) + 1).padStart(2, "0")

  return (
    <>
      <ServiceHero servico={servico} />
      <Entregaveis servico={servico} numero={n("entregaveis")} />
      <Processo servico={servico} numero={n("processo")} />
      {provas.length > 0 && (
        <ServiceProof projetos={provas} numero={n("prova")} />
      )}
      <Escopo servico={servico} numero={n("escopo")} />
      <Faq servico={servico} numero={n("faq")} />
      <Relacionados servico={servico} numero={n("relacionados")} />
      <CtaFinal />
    </>
  )
}
