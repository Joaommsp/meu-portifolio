/**
 * Os tons dos selos de status (projeto, jogo, livro), com os números uma vez
 * só. Cada `*_STATUS_COLOR` aponta pra um destes.
 *
 * Fundo: 10% do tom misturado ao card, OPACO. O selo pousa sobre a capa, e um
 * fundo translúcido deixava a capa escura apagar o texto.
 * Texto: o passo `-texto` do tom (globals.css), porque o tom puro como texto
 * de 12px sobre ele mesmo ficava abaixo de 4,5:1.
 */
export const TOM_SELO = {
  brand:
    "border-brand/40 bg-[color-mix(in_oklch,var(--brand)_10%,var(--card))] text-brand-texto",
  success:
    "border-success/40 bg-[color-mix(in_oklch,var(--success)_10%,var(--card))] text-success-texto",
  warning:
    "border-warning/40 bg-[color-mix(in_oklch,var(--warning)_10%,var(--card))] text-warning-texto",
  neutro: "border-border bg-muted text-foreground",
  apagado: "border-muted-foreground/30 bg-muted text-muted-foreground",
} as const
