import type { Accent } from "@/contexts/ThemeColorContext"

/**
 * Escala de cada accent em JS.
 *
 * Existe porque duas coisas precisam das cores fora do CSS:
 *   - o seletor de tema, que pinta a bolinha de cada opção;
 *   - o calendário do GitHub, que recebe as cores como prop.
 *
 * O calendário não pode ler as CSS vars: `--brand*` são registradas via
 * @property com transição de 300ms, então getComputedStyle devolve o valor
 * interpolado no meio da animação — o gráfico ficava sempre uma cor atrás.
 *
 * Os blocos `[data-accent]` do globals.css são o espelho deste arquivo.
 * `npm run check:accents` compara os dois e falha se saírem de sincronia.
 */
export type EscalaAccent = {
  /** Nome exibido no seletor de tema. */
  label: string
  /** Tom mais claro — fundo de chip, nível baixo de escala. (--brand-tint) */
  claro: string
  /** Passo intermediário entre `claro` e `base`. Só a escala do calendário usa. */
  meio: string
  /** Cor principal do accent. (--brand) */
  base: string
  /** Passo mais escuro — hover e topo de escala. (--brand-hover) */
  forte: string
}

/**
 * Calibrado pro fundo creme: cada `base` passa de 4.5:1 nas duas direções —
 * contra o creme (uso como texto/ícone) e contra o branco de
 * `--brand-foreground` (uso como fundo de botão). Os valores do tema escuro
 * (L 0.70–0.94) reprovavam nas duas.
 */
export const ACCENT_ESCALAS: Record<Accent, EscalaAccent> = {
  green: {
    label: "Verde",
    claro: "oklch(0.940 0.045 152)",
    meio: "oklch(0.74 0.10 152)",
    base: "oklch(0.53 0.14 152)",
    forte: "oklch(0.46 0.14 152)",
  },
  blue: {
    label: "Azul",
    claro: "oklch(0.940 0.040 255)",
    meio: "oklch(0.75 0.11 255)",
    base: "oklch(0.55 0.16 255)",
    forte: "oklch(0.48 0.16 255)",
  },
  purple: {
    label: "Roxo",
    claro: "oklch(0.945 0.040 300)",
    meio: "oklch(0.75 0.12 300)",
    base: "oklch(0.55 0.19 300)",
    forte: "oklch(0.48 0.19 300)",
  },
  red: {
    label: "Vermelho",
    claro: "oklch(0.950 0.040 25)",
    meio: "oklch(0.76 0.12 25)",
    base: "oklch(0.56 0.19 25)",
    forte: "oklch(0.49 0.19 25)",
  },
  orange: {
    label: "Laranja",
    claro: "oklch(0.950 0.050 60)",
    meio: "oklch(0.76 0.11 58)",
    base: "oklch(0.56 0.16 55)",
    forte: "oklch(0.49 0.16 55)",
  },
  cyan: {
    label: "Ciano",
    claro: "oklch(0.940 0.040 200)",
    meio: "oklch(0.74 0.08 202)",
    base: "oklch(0.525 0.12 205)",
    forte: "oklch(0.455 0.12 205)",
  },
  pink: {
    label: "Rosa",
    claro: "oklch(0.950 0.040 350)",
    meio: "oklch(0.76 0.13 350)",
    base: "oklch(0.57 0.20 350)",
    forte: "oklch(0.50 0.20 350)",
  },
  yellow: {
    label: "Amarelo",
    claro: "oklch(0.950 0.060 90)",
    meio: "oklch(0.75 0.10 89)",
    base: "oklch(0.545 0.14 88)",
    forte: "oklch(0.475 0.14 88)",
  },
}

/** Célula sem contribuição no calendário. Espelha --background-tertiary. */
export const NIVEL_VAZIO = "oklch(0.928 0.018 68)"

/** Fallback da tinta quando a CSS var não pode ser lida. Espelha --foreground
 *  (e, por tabela, --pattern-line). */
export const TINTA_PADRAO = "oklch(0.245 0.022 330)"

/** Cor do texto sobre o painel escuro do hero. Espelha --painel-texto.
 *  Está aqui, e não lida do CSS, porque quem consome é canvas: precisa do
 *  valor numérico pra interpolar, não de uma string que o CSS resolve. */
export const PAINEL_TEXTO = "oklch(0.972 0.014 78)"
