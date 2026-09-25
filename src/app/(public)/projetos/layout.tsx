import type { Metadata } from "next"

/*
  Só existe pelo metadata: a página é client component ("use client") e não
  pode exportá-lo. Sem este arquivo a aba e o Google recebiam o título
  genérico da home.
*/
export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Projetos de João Marcos entre clientes, side-projects e experimentos, com filtro por categoria e tecnologia.",
  alternates: { canonical: "/projetos" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
