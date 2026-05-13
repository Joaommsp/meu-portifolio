"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  User,
  FolderGit2,
  BookOpen,
  Mail,
  Wrench,
  Gamepad2,
  ArrowRight,
} from "lucide-react"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { SOCIAL_LINKS } from "@/lib/nav"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAGES = [
  { id: "home", title: "Início", href: "/", icon: Home, shortcut: "G H" },
  { id: "sobre", title: "Sobre", href: "/sobre", icon: User, shortcut: "G S" },
  {
    id: "projetos",
    title: "Projetos",
    href: "/projetos",
    icon: FolderGit2,
    shortcut: "G P",
  },
  { id: "blog", title: "Blog", href: "/blog", icon: BookOpen, shortcut: "G B" },
  {
    id: "games",
    title: "Games",
    href: "/games",
    icon: Gamepad2,
    shortcut: "G G",
  },
  {
    id: "contato",
    title: "Contato",
    href: "/contato",
    icon: Mail,
    shortcut: "G C",
  },
  { id: "uses", title: "Uses", href: "/uses", icon: Wrench, shortcut: "G U" },
] as const

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter()

  const go = React.useCallback(
    (href: string, external?: boolean) => {
      onOpenChange(false)
      if (external) {
        window.open(href, "_blank", "noopener,noreferrer")
      } else {
        router.push(href)
      }
    },
    [onOpenChange, router]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar no portfólio"
      description="Use o teclado pra navegar — pressione Esc pra fechar"
      className={[
        // Glass effect
        "border-0 bg-background/40 p-0 backdrop-blur-2xl backdrop-saturate-150",
        // Tamanho + posição
        "top-[20%] max-w-[640px]! sm:max-w-[640px]!",
        // Brand-tinted ring + glow sutil
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_var(--brand)/15,0_0_60px_-20px_var(--brand-glow)]",
        "ring-1 ring-white/[0.08]",
      ].join(" ")}
    >
      {/* Top decorative gradient — glow brand sutil no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand/[0.08] to-transparent"
      />

      <CommandInput
        placeholder="Buscar páginas…"
        className="text-base!"
      />

      <CommandList className="max-h-[420px]! px-2 pb-2">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <span className="font-mono text-xs uppercase tracking-widest">
              Vazio
            </span>
            <span className="text-sm">Nada encontrado.</span>
          </div>
        </CommandEmpty>

        <CommandGroup
          heading="Páginas"
          className="**:[[cmdk-group-heading]]:!font-mono **:[[cmdk-group-heading]]:!uppercase **:[[cmdk-group-heading]]:!tracking-[0.2em] **:[[cmdk-group-heading]]:!text-[0.65rem]"
        >
          {PAGES.map((page) => (
            <CommandItem
              key={page.id}
              value={`pagina ${page.title}`}
              onSelect={() => go(page.href)}
              className="group/item gap-3 rounded-lg! px-3 py-2.5! data-selected:bg-brand/10! data-selected:text-foreground!"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground transition-colors group-data-selected/item:bg-brand/20 group-data-selected/item:text-brand">
                <page.icon className="size-4" />
              </span>
              <span className="flex-1 font-medium">{page.title}</span>
              <CommandShortcut className="font-mono text-[0.65rem]">
                <kbd className="rounded border border-border/50 bg-muted/30 px-1.5 py-0.5">
                  {page.shortcut}
                </kbd>
              </CommandShortcut>
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-data-selected/item:translate-x-0 group-data-selected/item:opacity-100" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-2 bg-border/50" />

        <CommandGroup
          heading="Social"
          className="**:[[cmdk-group-heading]]:!font-mono **:[[cmdk-group-heading]]:!uppercase **:[[cmdk-group-heading]]:!tracking-[0.2em] **:[[cmdk-group-heading]]:!text-[0.65rem]"
        >
          {SOCIAL_LINKS.map((s) => {
            const Icon = s.icon
            return (
              <CommandItem
                key={s.label}
                value={`social ${s.label} ${s.handle}`}
                onSelect={() => go(s.href, true)}
                className="group/item gap-3 rounded-lg! px-3 py-2.5! data-selected:bg-brand/10! data-selected:text-foreground!"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground transition-colors group-data-selected/item:bg-brand/20 group-data-selected/item:text-brand">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 font-medium">{s.label}</span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {s.handle}
                </span>
                <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-data-selected/item:translate-x-0 group-data-selected/item:opacity-100" />
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>

      {/* Footer com hints de teclado */}
      <div className="flex items-center justify-between gap-4 border-t border-border/50 bg-background/40 px-4 py-2.5 text-[0.7rem] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted/30 px-1.5 py-0.5 font-mono text-[0.65rem]">
              ↵
            </kbd>
            Abrir
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted/30 px-1.5 py-0.5 font-mono text-[0.65rem]">
              ↑↓
            </kbd>
            Navegar
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted/30 px-1.5 py-0.5 font-mono text-[0.65rem]">
              Esc
            </kbd>
            Fechar
          </span>
        </div>
        <span className="hidden font-mono text-brand sm:inline">
          joão.marcos
        </span>
      </div>
    </CommandDialog>
  )
}
