import { Hero } from "@/components/sections/Hero"
import { AncorasDaPilha, SecaoEmpilhada } from "@/components/layout/SecaoEmpilhada"
import { ProfileIntro } from "@/components/sections/ProfileIntro"
import { About } from "@/components/sections/About"
import { Services } from "@/components/sections/Services"
import { Skills } from "@/components/sections/Skills"
import { GithubSection } from "@/components/sections/GithubSection"
import { WakatimeStats } from "@/components/sections/WakatimeStats"
import { FeaturedProjects } from "@/components/sections/FeaturedProjects"
import { LatestPosts } from "@/components/sections/LatestPosts"
import { FeaturedGames } from "@/components/sections/FeaturedGames"
import { ContactCTA } from "@/components/sections/ContactCTA"

/*
  Cada seção é uma camada que sobe e cobre a anterior (SecaoEmpilhada), no
  formato da landing do front-barber. As outras páginas usam o HeroSobreposto:
  só o hero fica preso e o conteúdo sobe inteiro.
*/
/** Na ordem da pilha: cada uma sobe e cobre a anterior. O hero fica de fora
    porque é a primeira camada e não cobre nada. Chave explícita: o `name` da
    função não serve, componente de servidor pode chegar sem nome. */
const SECOES = [
  { chave: "perfil", Secao: ProfileIntro },
  { chave: "servicos", Secao: Services },
  { chave: "sobre", Secao: About },
  { chave: "stack", Secao: Skills },
  { chave: "github", Secao: GithubSection },
  { chave: "wakatime", Secao: WakatimeStats },
  { chave: "projetos", Secao: FeaturedProjects },
  { chave: "posts", Secao: LatestPosts },
  { chave: "games", Secao: FeaturedGames },
  { chave: "contato", Secao: ContactCTA },
]

export default function Home() {
  return (
    <>
      <AncorasDaPilha />
      <SecaoEmpilhada cobre={false} comIndicador>
        <Hero />
      </SecaoEmpilhada>
      {SECOES.map(({ chave, Secao }) => (
        <SecaoEmpilhada key={chave}>
          <Secao />
        </SecaoEmpilhada>
      ))}
    </>
  )
}
