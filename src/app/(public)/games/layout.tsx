import type { Metadata } from "next"

/*
  Só existe pelo metadata: a página é client component ("use client") e não
  pode exportá-lo. Sem este arquivo a aba e o Google recebiam o título
  genérico da home.
*/
export const metadata: Metadata = {
  title: "Games",
  description:
    "Os jogos que marcaram João Marcos, com nota e o porquê.",
  alternates: { canonical: "/games" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
