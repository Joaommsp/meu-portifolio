"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NAV_GROUPS, type NavEntry, type NavLink } from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * Um destino é o atual quando a rota bate. A home só conta em match exato —
 * `startsWith("/")` casaria com o site inteiro.
 */
function estaAtivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function entradaAtiva(pathname: string, entrada: NavEntry) {
  return entrada.kind === "link"
    ? estaAtivo(pathname, entrada.href)
    : entrada.items.some((item) => estaAtivo(pathname, item.href))
}

/** Realce compartilhado entre link direto e gatilho de grupo. */
const GATILHO = [
  "group relative inline-flex items-center gap-1 rounded-md px-3 py-1.5",
  "text-sm font-medium text-muted-foreground transition-colors",
  "hover:text-foreground data-[active=true]:text-foreground",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
] as const

function Realce() {
  return (
    <motion.span
      layoutId="nav-active-indicator"
      className="absolute inset-0 -z-10 rounded-md bg-brand/10"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  )
}

function ItemDoGrupo({
  item,
  ativo,
  onNavegar,
}: {
  item: NavLink
  ativo: boolean
  onNavegar: () => void
}) {
  const Icone = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavegar}
      data-active={ativo}
      className={cn(
        "flex items-start gap-3 rounded-md p-2 transition-colors",
        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        "data-[active=true]:bg-brand/10"
      )}
    >
      <span
        className={cn(
          "mt-px flex size-8 shrink-0 items-center justify-center rounded-md",
          "bg-muted text-brand",
          ativo && "bg-brand/15"
        )}
      >
        <Icone className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-snug text-foreground">
          {item.label}
        </span>
        <span className="block text-xs leading-snug text-muted-foreground">
          {item.description}
        </span>
      </span>
    </Link>
  )
}

function Grupo({
  entrada,
  ativo,
  pathname,
}: {
  entrada: Extract<NavEntry, { kind: "group" }>
  ativo: boolean
  pathname: string
}) {
  const [aberto, setAberto] = React.useState(false)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        render={<button type="button" data-active={ativo} />}
        className={cn(GATILHO)}
      >
        {entrada.label}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3 opacity-60 transition-transform duration-200",
            aberto && "rotate-180"
          )}
        />
        <AnimatePresence>{ativo && <Realce />}</AnimatePresence>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-[19rem] gap-0.5 p-1.5"
      >
        {entrada.items.map((item) => (
          <ItemDoGrupo
            key={item.href}
            item={item}
            ativo={estaAtivo(pathname, item.href)}
            onNavegar={() => setAberto(false)}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}

/**
 * Navegação principal do desktop: links diretos e grupos em popover.
 * A estrutura vem inteira de `NAV_GROUPS` — nada de destino escrito aqui.
 */
export function NavMenu() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
      {NAV_GROUPS.map((entrada, idx) => {
        const ativo = entradaAtiva(pathname, entrada)
        return (
          <motion.div
            key={entrada.kind === "link" ? entrada.href : entrada.label}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 * idx }}
          >
            {entrada.kind === "link" ? (
              <Link
                href={entrada.href}
                data-active={ativo}
                className={cn(GATILHO)}
              >
                {entrada.label}
                <AnimatePresence>{ativo && <Realce />}</AnimatePresence>
              </Link>
            ) : (
              <Grupo
                // Remonta a cada rota: o popover nasce fechado sem precisar
                // de setState em efeito.
                key={pathname}
                entrada={entrada}
                ativo={ativo}
                pathname={pathname}
              />
            )}
          </motion.div>
        )
      })}
    </nav>
  )
}
