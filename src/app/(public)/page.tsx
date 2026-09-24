import { Hero } from "@/components/sections/Hero"
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

export default function Home() {
  return (
    <>
      <Hero />
      <ProfileIntro />
      <About />
      <Services />
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
