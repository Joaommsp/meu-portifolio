import type { Metadata } from "next"

/*
  Só existe pelo metadata: a página é client component ("use client") e não
  pode exportá-lo. Sem este arquivo a aba e o Google recebiam o título
  genérico da home.
*/
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Textos de João Marcos sobre frontend, design e o que aparece no meio.",
  alternates: { canonical: "/blog" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
