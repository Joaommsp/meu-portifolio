/**
 * Utilitários de cor OKLCH.
 *
 * O projeto guarda cor como string `oklch(L C H)` em dois lugares
 * (`globals.css` e `lib/accent-colors.ts`). Quando algo precisa CALCULAR com
 * essas cores — interpolar, jogar no canvas — precisa parseá-las antes.
 */

export type Oklch = { l: number; c: number; h: number }

/** Lê `oklch(L C H)` (com ou sem `/ alfa`). Devolve null se não casar. */
export function lerOklch(texto: string): Oklch | null {
  const m = texto.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (!m) return null
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
}

/**
 * sRGB (0–255) → OKLCH. Inverso do `oklchParaRgba`.
 *
 * Existe porque `getComputedStyle` NÃO devolve a cor na sintaxe em que ela foi
 * escrita: um token declarado como `oklch(...)` volta serializado como
 * `lab(...)`, e aí o `lerOklch` devolve null. Quem lê cor do CSS precisa deste
 * caminho de volta — ver `lerCorCss`.
 */
function srgbParaOklch(r: number, g: number, b: number): Oklch {
  const linear = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const [lr, lg, lb] = linear

  const ml = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const mm = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const ms = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  const l = 0.2104542553 * ml + 0.793617785 * mm - 0.0040720468 * ms
  const a = 1.9779984951 * ml - 2.428592205 * mm + 0.4505937099 * ms
  const bb = 0.0259040371 * ml + 0.7827717662 * mm - 0.808675766 * ms

  const h = (Math.atan2(bb, a) * 180) / Math.PI
  return { l, c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h }
}

/**
 * Lê uma cor CSS em qualquer sintaxe e devolve OKLCH.
 *
 * `normalizar` é a válvula de escape: recebe a string e devolve a forma que o
 * navegador escolher (`#rrggbb` / `rgb(...)`). Quem chama passa o próprio
 * canvas — `ctx.fillStyle = texto; ctx.fillStyle` faz o parse com o motor de
 * CSS, que entende toda sintaxe que o `getComputedStyle` possa cuspir.
 *
 * Contrato do `normalizar`: quando a string não é cor válida ele DEVE devolver
 * exatamente o que recebeu em `SENTINELA`. É assim que se distingue "não é
 * cor" de "é cor" com o canvas, que diante de valor inválido mantém em
 * silêncio o `fillStyle` anterior — sem a sonda, cor inválida virava preto e o
 * fallback de quem chama nunca disparava.
 */
export const SENTINELA = "#010203"

export function lerCorCss(
  texto: string,
  normalizar: (t: string) => string
): Oklch | null {
  const direto = lerOklch(texto)
  if (direto) return direto

  const limpo = texto.trim()
  if (!limpo) return null

  const normalizado = normalizar(limpo)
  if (normalizado.toLowerCase() === SENTINELA) return null

  const rgb = lerSrgb(normalizado)
  return rgb ? srgbParaOklch(rgb[0], rgb[1], rgb[2]) : null
}

/** `#rgb`, `#rrggbb` ou `rgb()/rgba()` → [r, g, b] em 0–255. */
function lerSrgb(texto: string): [number, number, number] | null {
  const hex = texto.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex?.[1]) {
    const v = hex[1]
    const par = (i: number) =>
      v.length === 3
        ? parseInt(v[i]! + v[i]!, 16)
        : parseInt(v.slice(i * 2, i * 2 + 2), 16)
    return [par(0), par(1), par(2)]
  }

  const fn = texto.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])]

  return null
}

/**
 * Interpola duas cores OKLCH em `t` (0–1).
 *
 * O matiz anda pelo ARCO CURTO do círculo: interpolando linearmente, ir de
 * 330 (a tinta ameixa) até 25 (o accent vermelho) atravessaria 180 e os
 * valores do meio sairiam verdes.
 */
export function misturarOklch(de: Oklch, para: Oklch, t: number): Oklch {
  let dh = para.h - de.h
  if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  return {
    l: de.l + (para.l - de.l) * t,
    c: de.c + (para.c - de.c) * t,
    h: de.h + dh * t,
  }
}

/**
 * OKLCH → `rgba(...)`.
 *
 * Canvas só aceita `oklch()` em navegador recente, e uma string que ele não
 * entende é ignorada em silêncio — o desenho inteiro sairia na cor anterior.
 * Convertendo aqui, funciona em qualquer lugar.
 */
export function oklchParaRgba({ l, c, h }: Oklch, alfa: number): string {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)
  const ml = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const ms = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * ml - 3.3077115913 * mm + 0.2309699292 * ms,
    -1.2684380046 * ml + 2.6097574011 * mm - 0.3413193965 * ms,
    -0.0041960863 * ml - 0.7034186147 * mm + 1.707614701 * ms,
  ]
  const [r, g, bl] = linear.map((v) => {
    const preso = Math.min(1, Math.max(0, v))
    const srgb = preso <= 0.0031308 ? 12.92 * preso : 1.055 * preso ** (1 / 2.4) - 0.055
    return Math.round(srgb * 255)
  })
  return `rgba(${r},${g},${bl},${alfa.toFixed(3)})`
}
