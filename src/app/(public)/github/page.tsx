import type { Metadata } from "next"
import Image from "next/image"
import { ExternalLink, MapPin, Building2, CalendarDays, Star, GitFork } from "lucide-react"

import { FadeIn, SlideIn, ScrollReveal } from "@/components/animations"
import { DotMesh, GradientOrbs, NoiseTexture } from "@/components/backgrounds"
import { GithubIcon } from "@/components/icons/brand-icons"
import { GithubReadme } from "@/components/sections/GithubReadme"
import { GithubContributions } from "@/components/sections/GithubContributions"
import {
  fetchGithubProfile,
  fetchGithubRepos,
  fetchGithubReadme,
  contarEstrelas,
  getLanguageColor,
  type GithubRepo,
} from "@/lib/github"

export const metadata: Metadata = {
  title: "GitHub",
  description:
    "Perfil do GitHub de João Marcos: repositórios públicos, contribuições e o README do perfil.",
}

const PERFIL_URL = "https://github.com/Joaommsp"

function Numero({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div>
      <span className="block font-display text-2xl font-bold tabular-nums tracking-tight">
        {valor.toLocaleString("pt-BR")}
      </span>
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </span>
    </div>
  )
}

function CartaoRepo({ repo }: { repo: GithubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      // h-full + o wrapper esticado: sem isso cada card fica da altura da
      // própria descrição e a grade vira um serrilhado.
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="truncate font-mono text-sm font-medium text-brand">
          {repo.name}
        </span>
        <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>

      {/* Descrições variam de uma linha a um parágrafo; o corte em 3 linhas
          é o que mantém a grade com ritmo. */}
      <span className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {repo.description ?? "Sem descrição."}
      </span>

      <span className="mt-auto flex flex-wrap items-center gap-4 pt-1 font-mono text-xs tabular-nums text-muted-foreground">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ background: getLanguageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="size-3" aria-hidden />
          {repo.stargazers_count}
          <span className="sr-only">estrelas</span>
        </span>
        {repo.forks_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3" aria-hidden />
            {repo.forks_count}
            <span className="sr-only">forks</span>
          </span>
        )}
      </span>
    </a>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </p>
  )
}

export default async function GithubPage() {
  const [perfil, repos, readme] = await Promise.all([
    fetchGithubProfile(),
    fetchGithubRepos(50, "estrelas"),
    fetchGithubReadme(),
  ])

  const desde = perfil
    ? new Date(perfil.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <section className="relative isolate">
      {/* A malha fica FORA do wrapper abaixo: ela escuta pointermove no
          próprio pai, e um pai `pointer-events-none` nunca recebe evento —
          a malha ficaria inerte. Pendurada na seção, que é ancestral do
          conteúdo, o hover chega; a altura repete a do wrapper. */}
      <DotMesh className="h-[80vh]" />

      {/* Os fundos ficam presos ao topo: soltos na seção inteira, os orbs se
          espalhariam por toda a página, que aqui é bem alta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[80vh] overflow-hidden"
      >
        <GradientOrbs
          orbs={[
            {
              size: 380,
              x: "8%",
              y: "18%",
              color: "var(--orb-1)",
              duration: 18,
              delay: 0,
              opacity: 0.22,
            },
            {
              size: 320,
              x: "78%",
              y: "55%",
              color: "var(--orb-2)",
              duration: 22,
              delay: 2,
              opacity: 0.18,
            },
          ]}
        />
        <NoiseTexture opacity={0.04} />
      </div>

      <div className="container relative mx-auto max-w-6xl px-5 py-24 sm:px-6 md:py-28">
        <FadeIn>
          <p className="mb-10 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand">
            <GithubIcon className="size-3.5" />
            GitHub
          </p>
        </FadeIn>

        {/* Duas colunas a partir de lg, como o próprio GitHub: identidade fixa
            à esquerda, conteúdo rolando à direita. */}
        <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SlideIn direction="up" delay={0.1}>
              <Image
                src={`${PERFIL_URL}.png`}
                alt=""
                width={160}
                height={160}
                className="size-28 rounded-full border border-border object-cover sm:size-36"
                priority
              />

              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
                {perfil?.name ?? "João Marcos"}
              </h1>
              <p className="mt-1 font-mono text-muted-foreground">
                @{perfil?.login ?? "Joaommsp"}
              </p>

              {perfil?.bio && (
                <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {perfil.bio.trim()}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
                {perfil?.company && (
                  <span className="flex items-start gap-2">
                    <Building2 className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
                    {perfil.company.trim()}
                  </span>
                )}
                {perfil?.location && (
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
                    {perfil.location.trim()}
                  </span>
                )}
                {desde && (
                  <span className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
                    No GitHub desde {desde}
                  </span>
                )}
              </div>

              {perfil && (
                <div className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-5">
                  <Numero valor={perfil.public_repos} rotulo="Repositórios" />
                  <Numero valor={contarEstrelas(repos)} rotulo="Estrelas" />
                  <Numero valor={perfil.followers} rotulo="Seguidores" />
                  <Numero valor={perfil.following} rotulo="Seguindo" />
                </div>
              )}

              <a
                href={PERFIL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                <GithubIcon className="size-4" />
                Ver perfil no GitHub
              </a>
            </SlideIn>
          </aside>

          <div className="mt-16 space-y-16 lg:mt-0">
            {/* README — o cabeçalho do card já diz o que é; rótulo em cima
                seria a mesma informação duas vezes. */}
            {readme && (
              <ScrollReveal>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    <GithubIcon className="size-3.5" aria-hidden />
                    Joaommsp / README.md
                  </div>
                  <div className="px-5 py-6 sm:px-7">
                    <GithubReadme conteudo={readme} />
                  </div>
                </div>
              </ScrollReveal>
            )}

            <div>
              <ScrollReveal>
                <Rotulo>Contribuições</Rotulo>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-card p-5">
                  <GithubContributions username="Joaommsp" />
                </div>
              </ScrollReveal>
            </div>

            {repos.length > 0 && (
              <div>
                <ScrollReveal>
                  <Rotulo>Repositórios Públicos · {repos.length}</Rotulo>
                </ScrollReveal>
                <div className="grid gap-4 sm:grid-cols-2">
                  {repos.map((repo, i) => (
                    <ScrollReveal
                      key={repo.id}
                      delay={Math.min(i, 6) * 0.04}
                      className="h-full"
                    >
                      <CartaoRepo repo={repo} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
