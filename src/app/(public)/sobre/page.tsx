import type { Metadata } from "next"
import { Suspense } from "react"

import { HeroSobreposto } from "@/components/layout/HeroSobreposto"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { Education } from "@/components/sections/Education"
import { PageHero } from "@/components/sections/PageHero"
import { AcoesSobre } from "@/components/sobre/AcoesSobre"
import { BentoAgora } from "@/components/sobre/BentoAgora"
import { Especialidade } from "@/components/sobre/Especialidade"
import { FaixaPassando } from "@/components/sobre/FaixaPassando"
import { StackEmLinhas } from "@/components/sobre/StackEmLinhas"

export const metadata: Metadata = {
  title: "Sobre",
  description: "João Marcos, frontend e UI/UX em Paulo Afonso, BA.",
}

/*
  O hero padrão das internas, com foto, CV e conversar à direita. Depois: o
  que faço (faixa), o que estou fazendo agora (bento), a especialidade
  (wireframes de dados), com o que construo (stack), a formação e o contato.

  O bento lê o Firestore e o WakaTime sem cache; em Suspense, o resto da
  página não espera por eles. O fallback reserva a altura do grid.
*/
export default function SobrePage() {
  return (
    <HeroSobreposto
      hero={
        <PageHero
          titulo="Sobre mim"
          descricao="Frontend e UI/UX na GFI, em Paulo Afonso, BA."
          lateral={<AcoesSobre />}
        />
      }
    >
      <div className="pt-8 md:pt-12">
        <FaixaPassando />
      </div>
      <Suspense fallback={<div aria-hidden className="h-[560px] md:h-[520px]" />}>
        <BentoAgora />
      </Suspense>
      <Especialidade />
      <StackEmLinhas />
      <div className="pt-10 md:pt-4">
        <Education />
      </div>
      <div className="pt-10 pb-6 md:pt-16">
        <ContactCTA />
      </div>
    </HeroSobreposto>
  )
}
