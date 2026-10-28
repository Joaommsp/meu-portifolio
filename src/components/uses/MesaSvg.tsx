import * as React from "react"

import { cn } from "@/lib/utils"

/** Os objetos clicáveis da mesa. A ordem não importa: cada item do admin é
    ligado a um tipo pelo nome (`tipoDoItem`). */
export type TipoObjeto = "notebook" | "monitor" | "teclado" | "mouse" | "gabinete"

type Props = {
  /** Tipos que existem no admin; o que não está aqui não é desenhado. */
  presentes: ReadonlySet<TipoObjeto>
  ativo: TipoObjeto | null
  rotulos: Partial<Record<TipoObjeto, string>>
  aoEscolher: (tipo: TipoObjeto) => void
}

/** Uma fileira de teclas de largura igual, com a última opcional mais larga. */
function Teclas({ x, y, n, w, h, gap, ultima }: { x: number; y: number; n: number; w: number; h: number; gap: number; ultima?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * (w + gap)} y={y} width={i === n - 1 && ultima ? ultima : w} height={h} rx={2} />
      ))}
    </>
  )
}

/**
 * A mesa de trabalho vista de cima, desenhada em SVG: madeira, tapete,
 * caneca, planta e celular de enfeite, e os objetos de hardware clicáveis.
 *
 * Ao passar o mouse, focar ou clicar, o objeto sobe, a sombra se afasta e um
 * contorno no accent aparece. Tudo em transform e opacidade.
 */
export function MesaSvg({ presentes, ativo, rotulos, aoEscolher }: Props) {
  function objeto(tipo: TipoObjeto, filhos: React.ReactNode) {
    if (!presentes.has(tipo)) return null
    const on = ativo === tipo
    return (
      <g
        role="button"
        tabIndex={0}
        aria-label={rotulos[tipo]}
        aria-pressed={on}
        data-on={on || undefined}
        onMouseEnter={() => aoEscolher(tipo)}
        onFocus={() => aoEscolher(tipo)}
        onClick={() => aoEscolher(tipo)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            aoEscolher(tipo)
          }
        }}
        className={cn(
          "group/obj cursor-pointer outline-none [transform-box:fill-box]",
          "transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
          "hover:-translate-y-[5px] focus-visible:-translate-y-[5px] data-[on]:-translate-y-[5px]"
        )}
      >
        {filhos}
      </g>
    )
  }

  /** Sombra que se afasta quando o objeto sobe. */
  const sombra =
    "[transform-box:fill-box] origin-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/obj:translate-y-2 group-hover/obj:scale-[1.03] group-hover/obj:opacity-50 group-data-[on]/obj:translate-y-2 group-data-[on]/obj:scale-[1.03] group-data-[on]/obj:opacity-50"
  /** Contorno no accent: aparece no ativo e no foco do teclado. */
  const aro =
    "fill-none stroke-brand opacity-0 transition-opacity duration-300 group-focus-visible/obj:opacity-100 group-data-[on]/obj:opacity-100"

  return (
    <svg viewBox="0 0 800 560" className="block h-auto w-full" role="group" aria-label="Mesa de trabalho vista de cima">
      <defs>
        <linearGradient id="mesa-madeira" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.86 0.045 70)" />
          <stop offset="1" stopColor="oklch(0.8 0.05 62)" />
        </linearGradient>
        <pattern id="mesa-veio" width="800" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11 Q200 6 400 12 T800 10" stroke="oklch(0.72 0.05 60 / .25)" fill="none" />
        </pattern>
        <radialGradient id="mesa-luz" cx=".25" cy=".15" r=".8">
          <stop offset="0" stopColor="white" stopOpacity=".45" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="mesa-desfoque" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <linearGradient id="mesa-tela" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.32 0.04 260)" />
          <stop offset=".55" stopColor="oklch(0.2 0.03 280)" />
          <stop offset="1" stopColor="oklch(0.15 0.02 300)" />
        </linearGradient>
        <linearGradient id="mesa-aluminio" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.36 0.01 330)" />
          <stop offset="1" stopColor="oklch(0.24 0.01 330)" />
        </linearGradient>
        <linearGradient id="mesa-branco" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.99 0.004 80)" />
          <stop offset="1" stopColor="oklch(0.9 0.01 80)" />
        </linearGradient>
      </defs>

      <rect width="800" height="560" fill="url(#mesa-madeira)" />
      <rect width="800" height="560" fill="url(#mesa-veio)" />
      <rect width="800" height="560" fill="url(#mesa-luz)" />

      {/* tapete de mesa e cabos */}
      <rect x="170" y="300" width="470" height="200" rx="18" fill="oklch(0.3 0.015 330)" opacity=".9" />
      <path d="M470 150 C470 220 520 240 560 300" stroke="oklch(0.2 0.01 330)" strokeWidth="4" fill="none" opacity=".75" />
      <path d="M700 250 C690 300 640 320 610 330" stroke="oklch(0.2 0.01 330)" strokeWidth="4" fill="none" opacity=".7" />

      {/* planta */}
      <g aria-hidden>
        <circle cx="726" cy="482" r="44" fill="oklch(0.3 0.03 50)" filter="url(#mesa-desfoque)" opacity=".35" />
        <circle cx="720" cy="470" r="40" fill="oklch(0.62 0.07 45)" />
        <circle cx="720" cy="470" r="33" fill="oklch(0.38 0.04 60)" />
        <g fill="oklch(0.55 0.13 145)">
          <ellipse cx="700" cy="455" rx="22" ry="10" transform="rotate(-35 700 455)" />
          <ellipse cx="738" cy="452" rx="22" ry="10" transform="rotate(30 738 452)" />
          <ellipse cx="722" cy="490" rx="20" ry="9" transform="rotate(80 722 490)" />
          <ellipse cx="702" cy="485" rx="18" ry="8" transform="rotate(-70 702 485)" />
        </g>
        <g fill="oklch(0.65 0.14 140)">
          <ellipse cx="740" cy="482" rx="18" ry="8" transform="rotate(55 740 482)" />
          <ellipse cx="718" cy="448" rx="16" ry="7" transform="rotate(-5 718 448)" />
        </g>
      </g>

      {/* caneca */}
      <g aria-hidden>
        <circle cx="98" cy="118" r="38" fill="oklch(0.3 0.03 50)" filter="url(#mesa-desfoque)" opacity=".35" />
        <rect x="122" y="96" width="26" height="20" rx="10" fill="none" stroke="oklch(0.95 0.01 80)" strokeWidth="8" />
        <circle cx="92" cy="106" r="38" fill="oklch(0.97 0.006 80)" />
        <circle cx="92" cy="106" r="30" fill="oklch(0.36 0.06 45)" />
        <ellipse cx="84" cy="98" rx="10" ry="5" fill="oklch(0.55 0.06 55)" opacity=".6" />
      </g>

      {objeto(
        "monitor",
        <>
          <rect className={sombra} x="200" y="54" width="380" height="200" rx="14" fill="oklch(0.25 0.03 50)" filter="url(#mesa-desfoque)" opacity=".4" />
          <rect x="350" y="214" width="80" height="34" rx="6" fill="url(#mesa-aluminio)" />
          <rect x="320" y="240" width="140" height="22" rx="11" fill="oklch(0.3 0.01 330)" />
          <rect x="200" y="40" width="380" height="186" rx="12" fill="oklch(0.16 0.01 330)" />
          <rect x="208" y="48" width="364" height="168" rx="6" fill="url(#mesa-tela)" />
          <g opacity=".85">
            <rect x="222" y="62" width="70" height="140" rx="4" fill="oklch(1 0 0 / .06)" />
            <rect x="230" y="72" width="40" height="5" rx="2" className="fill-brand" />
            <rect x="230" y="84" width="50" height="4" rx="2" fill="oklch(1 0 0 / .25)" />
            <rect x="230" y="94" width="34" height="4" rx="2" fill="oklch(1 0 0 / .2)" />
            <rect x="304" y="62" width="254" height="40" rx="4" fill="oklch(1 0 0 / .06)" />
            <rect x="304" y="112" width="254" height="90" rx="4" fill="oklch(1 0 0 / .03)" />
            <polyline points="310,190 345,170 380,176 415,150 450,156 485,130 520,138 552,116" className="stroke-brand" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <rect className={aro} x="194" y="34" width="392" height="232" rx="16" strokeWidth="3" />
        </>
      )}

      {objeto(
        "gabinete",
        <>
          <rect className={sombra} x="640" y="54" width="120" height="210" rx="12" fill="oklch(0.25 0.03 50)" filter="url(#mesa-desfoque)" opacity=".4" />
          <rect x="640" y="40" width="120" height="210" rx="12" fill="url(#mesa-aluminio)" />
          <rect x="650" y="50" width="100" height="190" rx="8" fill="oklch(0.14 0.01 330)" />
          {[100, 180].map((cy) => (
            <g key={cy}>
              <circle cx="700" cy={cy} r="34" className="fill-brand" opacity=".12" />
              <circle cx="700" cy={cy} r="30" fill="none" className="stroke-brand" strokeWidth="3" opacity=".9" />
              <circle cx="700" cy={cy} r="22" fill="oklch(0.2 0.01 330)" />
              <g stroke="oklch(1 0 0 / .25)" strokeWidth="2">
                <line x1="700" y1={cy - 20} x2="700" y2={cy + 20} />
                <line x1="680" y1={cy} x2="720" y2={cy} />
                <line x1="686" y1={cy - 14} x2="714" y2={cy + 14} />
                <line x1="714" y1={cy - 14} x2="686" y2={cy + 14} />
              </g>
            </g>
          ))}
          <rect className={aro} x="634" y="34" width="132" height="222" rx="15" strokeWidth="3" />
        </>
      )}

      {objeto(
        "notebook",
        <g transform="rotate(-9 140 400)">
          <rect className={sombra} x="40" y="314" width="230" height="190" rx="12" fill="oklch(0.25 0.03 50)" filter="url(#mesa-desfoque)" opacity=".4" />
          <rect x="40" y="300" width="230" height="64" rx="10" fill="oklch(0.17 0.01 330)" />
          <rect x="48" y="306" width="214" height="52" rx="5" fill="url(#mesa-tela)" />
          <rect x="56" y="314" width="60" height="4" rx="2" className="fill-brand" />
          <rect x="56" y="324" width="90" height="3" rx="1.5" fill="oklch(1 0 0 / .25)" />
          <rect x="40" y="362" width="230" height="128" rx="10" fill="url(#mesa-aluminio)" />
          <rect x="54" y="374" width="202" height="62" rx="4" fill="oklch(0.16 0.01 330)" />
          <g fill="oklch(0.3 0.01 330)">
            <Teclas x={58} y={378} n={12} w={14} h={10} gap={2} ultima={18} />
            <Teclas x={58} y={391} n={11} w={14} h={10} gap={2} ultima={28} />
            <Teclas x={58} y={404} n={10} w={14} h={10} gap={2} ultima={38} />
            <rect x="58" y="417" width="40" height="12" rx="2" />
            <rect x="100" y="417" width="104" height="12" rx="2" />
            <rect x="206" y="417" width="46" height="12" rx="2" />
          </g>
          <rect x="58" y="378" width="14" height="10" rx="2" className="fill-brand" opacity=".55" />
          <rect x="118" y="444" width="74" height="38" rx="5" fill="oklch(0.3 0.01 330)" />
          <rect className={aro} x="34" y="294" width="242" height="202" rx="14" strokeWidth="3" />
        </g>
      )}

      {objeto(
        "teclado",
        <>
          <rect className={sombra} x="300" y="342" width="250" height="96" rx="10" fill="oklch(0.15 0.01 330)" filter="url(#mesa-desfoque)" opacity=".5" />
          <rect x="300" y="330" width="250" height="96" rx="10" fill="url(#mesa-branco)" />
          <g fill="white" stroke="oklch(0.82 0.01 80)" strokeWidth="1">
            {[338, 356, 374].map((y) => (
              <Teclas key={y} x={308} y={y} n={13} w={14} h={14} gap={4} ultima={18} />
            ))}
            <Teclas x={308} y={394} n={3} w={14} h={22} gap={4} />
            <rect x="362" y="394" width="104" height="22" rx="3" />
            <Teclas x={470} y={394} n={4} w={14} h={22} gap={4} ultima={18} />
          </g>
          <rect x="308" y="338" width="14" height="14" rx="3" className="fill-brand" opacity=".85" />
          <rect className={aro} x="294" y="324" width="262" height="108" rx="13" strokeWidth="3" />
        </>
      )}

      {objeto(
        "mouse",
        <>
          <ellipse className={sombra} cx="598" cy="394" rx="26" ry="40" fill="oklch(0.15 0.01 330)" filter="url(#mesa-desfoque)" opacity=".5" />
          <ellipse cx="598" cy="384" rx="25" ry="39" fill="url(#mesa-branco)" />
          <line x1="598" y1="348" x2="598" y2="376" stroke="oklch(0.82 0.01 80)" strokeWidth="1.5" />
          <rect x="594" y="356" width="8" height="14" rx="4" fill="oklch(0.3 0.01 330)" />
          <rect className={aro} x="567" y="339" width="62" height="90" rx="31" strokeWidth="3" />
        </>
      )}

      {/* celular, enfeite */}
      <g aria-hidden transform="rotate(14 690 360)">
        <rect x="660" y="300" width="56" height="110" rx="10" fill="oklch(0.18 0.01 330)" />
        <rect x="664" y="306" width="48" height="98" rx="7" fill="url(#mesa-tela)" />
      </g>
    </svg>
  )
}
