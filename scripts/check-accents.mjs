/**
 * Verifica que a escala de accent em `src/lib/accent-colors.ts` continua
 * igual aos blocos `[data-accent]` do `src/app/globals.css`.
 *
 * Os dois precisam existir: o CSS pinta o site, e o TS alimenta o seletor de
 * tema e o calendário do GitHub (que não podem ler as CSS vars porque
 * `--brand*` é animado via @property e getComputedStyle devolve o valor do
 * meio da transição). Sem esta checagem, recalibrar cor num lado e esquecer o
 * outro passa em silêncio.
 *
 * Também confere o contraste: cada `--brand` precisa de 4.5:1 contra o creme
 * do fundo (uso como texto/ícone) e contra o branco de `--brand-foreground`
 * (uso como fundo de botão).
 *
 * Uso: npm run check:accents
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..")
const CSS = join(RAIZ, "src/app/globals.css")
const TS = join(RAIZ, "src/lib/accent-colors.ts")

/** Campo do TS -> var CSS correspondente. `meio` só existe no TS. */
const EQUIVALENTES = {
  claro: "--brand-tint",
  base: "--brand",
  forte: "--brand-hover",
}

const CONTRASTE_MINIMO = 4.5

function lerBlocosCss(css) {
  const blocos = {}
  const re = /\[data-accent="(\w+)"\]\s*\{([^}]*)\}/g
  let m
  while ((m = re.exec(css)) !== null) {
    const [, accent, corpo] = m
    const vars = {}
    for (const linha of corpo.split("\n")) {
      const decl = linha.match(/(--[\w-]+):\s*([^;]+);/)
      if (decl) vars[decl[1]] = decl[2].trim()
    }
    blocos[accent] = vars
  }
  return blocos
}

function lerEscalasTs(ts) {
  const escalas = {}
  const re = /(\w+):\s*\{([^}]*)\}/g
  const corpoRecord = ts.slice(ts.indexOf("ACCENT_ESCALAS"))
  let m
  while ((m = re.exec(corpoRecord)) !== null) {
    const [, accent, corpo] = m
    const campos = {}
    for (const campo of corpo.matchAll(/(\w+):\s*"([^"]+)"/g)) {
      campos[campo[1]] = campo[2]
    }
    escalas[accent] = campos
  }
  return escalas
}

/** oklch(L C H) -> canais sRGB lineares. */
function oklchParaLinear(texto) {
  const m = texto.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/
  )
  if (!m) return null
  const L = Number(m[1])
  const C = Number(m[2])
  const h = (Number(m[3]) * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
}

function contraste(corA, corB) {
  const luminancia = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
  const a = luminancia(corA)
  const b = luminancia(corB)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function valorDeRoot(css, nome) {
  const m = css.match(new RegExp(`\\${nome}:\\s*([^;]+);`))
  return m ? m[1].trim() : null
}

const css = readFileSync(CSS, "utf8")
const ts = readFileSync(TS, "utf8")

const blocos = lerBlocosCss(css)
const escalas = lerEscalasTs(ts)
const problemas = []

const creme = oklchParaLinear(valorDeRoot(css, "--background"))
const brandForeground = oklchParaLinear(valorDeRoot(css, "--brand-foreground"))

const accentsCss = Object.keys(blocos).sort()
const accentsTs = Object.keys(escalas).sort()
if (accentsCss.join() !== accentsTs.join()) {
  problemas.push(
    `conjunto de accents diferente — CSS: [${accentsCss}] / TS: [${accentsTs}]`
  )
}

for (const accent of accentsCss) {
  const escala = escalas[accent]
  if (!escala) continue

  for (const [campo, cssVar] of Object.entries(EQUIVALENTES)) {
    const noCss = blocos[accent][cssVar]
    const noTs = escala[campo]
    if (noCss !== noTs) {
      problemas.push(
        `${accent}.${campo}: TS tem "${noTs}", globals.css tem "${noCss}" (${cssVar})`
      )
    }
  }

  const base = oklchParaLinear(blocos[accent]["--brand"])
  if (!base) continue
  const contraFundo = contraste(base, creme)
  const contraTinta = contraste(base, brandForeground)
  if (contraFundo < CONTRASTE_MINIMO) {
    problemas.push(
      `${accent}: --brand tem ${contraFundo.toFixed(2)}:1 contra o creme (mínimo ${CONTRASTE_MINIMO})`
    )
  }
  if (contraTinta < CONTRASTE_MINIMO) {
    problemas.push(
      `${accent}: --brand tem ${contraTinta.toFixed(2)}:1 contra --brand-foreground (mínimo ${CONTRASTE_MINIMO})`
    )
  }
}

/* Os outros espelhos do creme fora do CSS. Mesmo motivo da escala de accent:
   quem lê não é o browser aplicando a var, e ninguém avisa se dessincronizar. */
function paraHex(linear) {
  const canal = (x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${linear.map(canal).join("")}`
}

const nivelVazio = ts.match(/NIVEL_VAZIO\s*=\s*"([^"]+)"/)?.[1]
const backgroundTertiary = valorDeRoot(css, "--background-tertiary")
if (nivelVazio !== backgroundTertiary) {
  problemas.push(
    `NIVEL_VAZIO: accent-colors.ts tem "${nivelVazio}", globals.css tem "${backgroundTertiary}" (--background-tertiary)`
  )
}

const tintaPadrao = ts.match(/TINTA_PADRAO\s*=\s*"([^"]+)"/)?.[1]
const foreground = valorDeRoot(css, "--foreground")
if (tintaPadrao !== foreground) {
  problemas.push(
    `TINTA_PADRAO: accent-colors.ts tem "${tintaPadrao}", globals.css tem "${foreground}" (--foreground)`
  )
}

const painelTexto = ts.match(/PAINEL_TEXTO\s*=\s*"([^"]+)"/)?.[1]
const painelTextoCss = valorDeRoot(css, "--painel-texto")
if (painelTexto !== painelTextoCss) {
  problemas.push(
    `PAINEL_TEXTO: accent-colors.ts tem "${painelTexto}", globals.css tem "${painelTextoCss}" (--painel-texto)`
  )
}

const cremeHex = paraHex(creme)
const layout = readFileSync(join(RAIZ, "src/app/layout.tsx"), "utf8")
const manifest = readFileSync(join(RAIZ, "public/site.webmanifest"), "utf8")

for (const [onde, valor] of [
  ["layout.tsx (CREME_FUNDO)", layout.match(/CREME_FUNDO\s*=\s*"([^"]+)"/)?.[1]],
  ["site.webmanifest (theme_color)", JSON.parse(manifest).theme_color],
  ["site.webmanifest (background_color)", JSON.parse(manifest).background_color],
]) {
  if (valor?.toLowerCase() !== cremeHex) {
    problemas.push(
      `${onde}: tem "${valor}", mas --background do globals.css é ${cremeHex}`
    )
  }
}

if (problemas.length > 0) {
  console.error("Tokens de tema fora de sincronia ou sem contraste:\n")
  for (const p of problemas) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(
  `${accentsCss.length} accents conferidos (CSS e TS batem, contraste >= ${CONTRASTE_MINIMO}:1) + espelhos do creme (${cremeHex}) em layout.tsx e site.webmanifest.`
)
