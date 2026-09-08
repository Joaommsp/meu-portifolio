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
