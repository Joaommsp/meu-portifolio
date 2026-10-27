import { WireframesDeDados } from "@/components/charts/WireframesDeDados"
import { SECAO_SOBRE, TITULO_SOBRE } from "@/components/sobre/secao"
import { cn } from "@/lib/utils"

/** A especialidade do /sobre: o carrossel de wireframes de interfaces de dados. */
export function Especialidade() {
  return (
    <section className={SECAO_SOBRE}>
      <h2 className={cn(TITULO_SOBRE, "mb-8")}>
        Frontend &amp; Data Storytelling
      </h2>
      <WireframesDeDados />
    </section>
  )
}
