import type { Metadata } from "next"

/*
  Só existe pelo metadata: a página é client component ("use client") e não
  pode exportá-lo. Sem este arquivo a aba e o Google recebiam o título
  genérico da home.
*/
export const metadata: Metadata = {
  title: "Guestbook",
  description:
    "Deixe uma mensagem pra João Marcos: um oi, um comentário sobre um projeto ou uma recomendação.",
  alternates: { canonical: "/guestbook" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
