import { ArrowUpRight, Star, GitFork, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animations";
import { GithubIcon } from "@/components/icons/brand-icons";
import { GithubContributions } from "@/components/sections/GithubContributions";
import {
  fetchGithubProfile,
  fetchGithubRepos,
  getLanguageColor,
  type GithubRepo,
} from "@/lib/github";

const PROFILE_URL = "https://github.com/Joaommsp";

export async function GithubSection() {
  const [profile, repos] = await Promise.all([
    fetchGithubProfile(),
    fetchGithubRepos(6),
  ]);

  // Se a API falhar, não renderiza a seção (graceful degradation)
  if (!profile && repos.length === 0) return null;

  const yearsActive = profile
    ? Math.max(
        1,
        new Date().getFullYear() - new Date(profile.created_at).getFullYear(),
      )
    : 0;

  return (
    <section
      id="github"
      className="border-y border-border bg-card/30 scroll-mt-20"
    >
      <div className="container mx-auto max-w-6xl px-6 py-32">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <ScrollReveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
                03 · GitHub
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Open source & laboratório
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Onde experimento, aprendo e compartilho código.
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <Button
              variant="outline"
              render={
                <a
                  href={PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GithubIcon className="size-4" />
              @Joaommsp
              <ArrowUpRight className="size-3.5" data-icon="inline-end" />
            </Button>
          </ScrollReveal>
        </div>

        {/* Stats */}
        {profile && (
          <ScrollReveal>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Repos públicos" value={profile.public_repos} />
              <Stat label="Followers" value={profile.followers} />
              <Stat label="Following" value={profile.following} />
              <Stat
                label="Anos no GitHub"
                value={yearsActive}
                suffix={yearsActive === 1 ? "ano" : "anos"}
              />
            </div>
          </ScrollReveal>
        )}

        {/* Contribution graph */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 overflow-x-auto rounded-xl border border-border bg-card p-5">
            <GithubContributions username="Joaommsp" />
          </div>
        </ScrollReveal>

        {/* Repos */}
        {repos.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, idx) => (
              <ScrollReveal key={repo.id} delay={Math.min(idx, 5) * 0.05}>
                <RepoCard repo={repo} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1.5 font-display text-3xl font-bold">
        {value.toLocaleString("pt-BR")}
        {suffix && (
          <span className="text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
});

function RepoCard({ repo }: { repo: GithubRepo }) {
  const langColor = getLanguageColor(repo.language);

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <GithubIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <h3 className="truncate font-display text-base font-semibold tracking-tight transition-colors group-hover:text-brand">
            {repo.name}
          </h3>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>

      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {repo.description || (
          <span className="italic opacity-60">(sem descrição)</span>
        )}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full"
              style={{ background: langColor }}
            />
            <span>{repo.language}</span>
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star className="size-3" />
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="size-3" />
            {repo.forks_count}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 font-mono">
          <Calendar className="size-3" />
          {dateFormatter.format(new Date(repo.pushed_at))}
        </span>
      </div>
    </a>
  );
}
