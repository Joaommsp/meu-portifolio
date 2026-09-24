import type { Metadata } from "next";
import { Mail, Clock, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/sections/ContactForm";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
} from "@/components/icons/brand-icons";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/nav";
import { DISPONIBILIDADE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Mande uma mensagem para João Marcos — frontend dev e UI/UX designer em Paulo Afonso, BA.",
};

const QUICK_LINKS = [
  {
    label: "Email",
    handle: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: Mail,
    description: "Resposta em até 24h em dias úteis",
  },
  {
    label: "LinkedIn",
    handle: "joaomarcos10oficial",
    href: SOCIAL_LINKS.find((s) => s.label === "LinkedIn")?.href ?? "#",
    Icon: LinkedinIcon,
    description: "Pra conversas profissionais e networking",
  },
  {
    label: "GitHub",
    handle: "@Joaommsp",
    href: SOCIAL_LINKS.find((s) => s.label === "GitHub")?.href ?? "#",
    Icon: GithubIcon,
    description: "Open-source, código de exemplo, contribuições",
  },
  {
    label: "Instagram",
    handle: "@joao.mmsp",
    href: SOCIAL_LINKS.find((s) => s.label === "Instagram")?.href ?? "#",
    Icon: InstagramIcon,
    description: "Pessoal",
  },
] as const;

export default function ContatoPage() {
  return (
    <>
      {/* Hero da página */}
      <PageHero
        rotulo="Contato"
        janela="contato"
        titulo={
          <>
            Vamos <span className="text-gradient-brand-claro">conversar?</span>
          </>
        }
        descricao="Tô sempre aberto a novos projetos, parcerias ou só uma boa conversa sobre design e código. Use o formulário ou me chame direto pelos canais ao lado — respondo o mais rápido possível."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <span className="inline-block size-1.5 rounded-full bg-success" />
            {DISPONIBILIDADE.status}
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <Clock className="size-3" />
            {DISPONIBILIDADE.resposta}
          </Badge>
        </div>
      </PageHero>

      {/* Form + canais diretos */}
      <section className="container mx-auto max-w-6xl px-5 sm:px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <ScrollReveal direction="left">
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold tracking-tight">
                Mande uma mensagem
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Abre seu cliente de email com tudo preenchido.
              </p>
              <ContactForm />
            </div>
          </ScrollReveal>

          {/* Quick links */}
          <ScrollReveal direction="right">
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold tracking-tight">
                Ou pelos canais diretos
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Escolha o que combina melhor com o assunto.
              </p>
              <ul className="space-y-3">
                {QUICK_LINKS.map(
                  ({ label, handle, href, Icon, description }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={
                          href.startsWith("mailto") ? undefined : "_blank"
                        }
                        rel={
                          href.startsWith("mailto")
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/50 hover:bg-card/80"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-display text-sm font-semibold">
                              {label}
                            </p>
                            <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="truncate font-mono text-xs text-brand">
                            {handle}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
