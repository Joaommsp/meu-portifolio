"use client"

import * as React from "react"
import { GitHubCalendar } from "react-github-calendar"

import { useThemeColor } from "@/contexts/ThemeColorContext"
import {
  ACCENT_ESCALAS,
  NIVEL_VAZIO,
  type EscalaAccent,
} from "@/lib/accent-colors"

/**
 * Contribution graph do GitHub colorido com o accent atual do site.
 *
 * As cores vêm de `lib/accent-colors` (mesma fonte do seletor de tema), e
 * não de getComputedStyle: `--brand*` tem transição de 300ms via @property,
 * então o valor computado vinha interpolado e o gráfico ficava uma cor atrás.
 *
 * Ramp (nível 0 → 4) — no tema creme a escala vai do CLARO pro ESCURO:
 *   0: neutro (sem contribuições)        — creme acinzentado
 *   1: brand-tint (poucas)               — tom claro do brand
 *   2: intermediário (algumas)           — meio-termo
 *   3: brand (muitas)                    — saturado
 *   4: brand-hover (muito ativo)         — o passo mais escuro
 */

type Ramp = [string, string, string, string, string]

function montarRamp({ claro, meio, base, forte }: EscalaAccent): Ramp {
  return [NIVEL_VAZIO, claro, meio, base, forte]
}

/* Medidas do calendário usadas pra dimensionar os blocos. */
const COLUNAS = 53 // semanas do ano
const MARGEM = 3 // espaço entre blocos
const LARGURA_ROTULOS = 34 // coluna dos dias da semana
const BLOCO_MIN = 11 // padrão da lib — piso, pra não encolher no mobile
const BLOCO_MAX = 20 // acima disso o gráfico vira mancha, não dado
/* Altura do que não são os blocos: rótulos de mês (18) + gap (8) + legenda (17). */
const ALTURA_FIXA = 43

/* Detecta hidratação sem setState em efeito (que causaria render em cascata):
   o snapshot do servidor é false, o do cliente é true. */
const SEM_INSCRICAO = () => () => {}
const NO_CLIENTE = () => true
const NO_SERVIDOR = () => false

export function GithubContributions({
  username = "Joaommsp",
}: {
  username?: string
}) {
  const { accent } = useThemeColor()
  // useMemo pra `theme` não ser um array novo a cada render — a prop chega
  // no GitHubCalendar e mudança de identidade o faria remontar à toa.
  const theme = React.useMemo(() => montarRamp(ACCENT_ESCALAS[accent]), [accent])

  // O tamanho do bloco vem da largura real disponível: assim o calendário
  // preenche o card em vez de sobrar espaço à direita. No mobile o cálculo
  // cai no piso e o container continua rolando na horizontal.
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [blockSize, setBlockSize] = React.useState(BLOCO_MIN)

  // A lib busca as contribuições no cliente: no servidor não existe
  // <article> nenhum, e o React acusava hydration mismatch. Só montamos o
  // calendário depois do primeiro render, quando os dois lados já concordam.
  const montado = React.useSyncExternalStore(SEM_INSCRICAO, NO_CLIENTE, NO_SERVIDOR)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const medir = () => {
      const util = el.clientWidth - LARGURA_ROTULOS - COLUNAS * MARGEM
      const ideal = Math.floor(util / COLUNAS)
      setBlockSize(Math.max(BLOCO_MIN, Math.min(ideal, BLOCO_MAX)))
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Sentinela de medição: envolver o calendário faria ele se comprimir
          contra o wrapper (a lib usa max-width: 100%) em vez de rolar
          dentro do card no mobile. */}
      <div ref={containerRef} aria-hidden className="h-0 w-full" />
      {!montado ? (
        // Reserva a altura medida do calendário (rótulos de mês + 7 linhas +
        // legenda) pra troca não empurrar a página.
        <div aria-hidden style={{ height: ALTURA_FIXA + 7 * (blockSize + MARGEM) }} />
      ) : (
      <GitHubCalendar
      username={username}
      colorScheme="light"
      theme={{ light: theme }}
      blockSize={blockSize}
      blockMargin={MARGEM}
      blockRadius={2}
      fontSize={blockSize >= 15 ? 12 : 11}
      labels={{
        totalCount: "{{count}} contribuições em {{year}}",
        legend: {
          less: "Menos",
          more: "Mais",
        },
        months: [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez",
        ],
        weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        }}
      />
      )}
    </>
  )
}
