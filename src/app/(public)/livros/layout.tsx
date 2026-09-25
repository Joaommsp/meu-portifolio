import type { Metadata } from "next"

/*
  Só existe pelo metadata: a página é client component ("use client") e não
  pode exportá-lo. Sem este arquivo a aba e o Google recebiam o título
  genérico da home.
*/
export const metadata: Metadata = {
  title: "Livros",
  description:
    "A estante de João Marcos: leituras de design, dados e desenvolvimento, com nota e comentário.",
  alternates: { canonical: "/livros" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
