import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Skills } from "@/components/sections/Skills"
import { GithubSection } from "@/components/sections/GithubSection"
import { WakatimeStats } from "@/components/sections/WakatimeStats"
import { FeaturedProjects } from "@/components/sections/FeaturedProjects"
import { LatestPosts } from "@/components/sections/LatestPosts"
import { FeaturedGames } from "@/components/sections/FeaturedGames"
import { ContactCTA } from "@/components/sections/ContactCTA"

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <GithubSection />
      <WakatimeStats />
      <FeaturedProjects />
      <LatestPosts />
      <FeaturedGames />
      <ContactCTA />
    </>
  )
}
