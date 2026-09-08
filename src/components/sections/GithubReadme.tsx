import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"

import { cn } from "@/lib/utils"

/**
 * Renderiza o README do perfil do GitHub.
 *
 * Por que o pipeline é diferente do `MarkdownContent`: aquele recebe markdown
 * escrito por mim; este recebe HTML de um repositório externo. Mesmo sendo o
 * repositório do próprio João, injetar HTML de fora sem passar por allowlist é
 * a porta de entrada clássica de XSS — se o repo for comprometido, o site vai
 * junto. Daí `rehype-raw` (interpreta o HTML) sempre seguido de
 * `rehype-sanitize` (descarta o que não estiver na lista).
 *
 * A ordem importa: sanitizar antes do raw não adianta, porque nesse momento o
 * HTML ainda é texto.
 */
const schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "picture",
    "source",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      // O schema padrão descarta width/height. Sem dimensão, SVG sem tamanho
      // intrínseco (todos os ícones de tecnologia) estica pra largura inteira
      // do card — o README fica uma pilha de logos gigantes.
      "width",
      "height",
      "loading",
      "decoding",
      "srcSet",
      "sizes",
    ],
    source: ["srcSet", "media", "type"],
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
  },
}

/**
 * Só número, `px` ou `%` viram medida. Qualquer outra coisa é descartada —
 * o valor vem de HTML externo e acaba num atributo `style`.
 */
function medida(valor: unknown): string | undefined {
  if (typeof valor !== "string" && typeof valor !== "number") return undefined
  const m = String(valor).trim().match(/^(\d+(?:\.\d+)?)(px|%)?$/)
  return m ? `${m[1]}${m[2] ?? "px"}` : undefined
}

/**
 * O README serve a logo em duas versões via <picture>, escolhidas por
 * `prefers-color-scheme` — o que faz sentido no GitHub, que segue o tema de
 * quem lê. Aqui não: esta página é sempre creme. Sem isto, quem usa o sistema
 * no escuro receberia a logo CLARA sobre fundo claro, e ela sumiria.
 *
 * Descartando a fonte de tema escuro, o <picture> cai no <img> de fallback,
 * que é a versão escura — a correta para este fundo.
 */
function FonteDoReadme({ media, ...resto }: React.ComponentProps<"source">) {
  if (typeof media === "string" && /prefers-color-scheme:\s*dark/.test(media)) {
    return null
  }
  return <source media={media} {...resto} />
}

/**
 * O Preflight do Tailwind aplica `height: auto` em toda `img`, o que anula o
 * `height="42"` dos ícones de tecnologia — e SVG sem tamanho intrínseco passa
 * a esticar pra largura inteira do card. O sanitizador (com razão) descarta
 * `style` vindo de fora, então a medida é reaplicada aqui, já validada.
 */
function ImagemDoReadme({
  src,
  alt,
  width,
  height,
}: React.ComponentProps<"img">) {
  const w = medida(width)
  const h = medida(height)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      style={{ width: w, height: h, maxWidth: "100%" }}
    />
  )
}

export function GithubReadme({ conteudo }: { conteudo: string }) {
  return (
    <div
      className={cn(
        "prose max-w-none",
        "prose-headings:font-display prose-headings:tracking-tight",
        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-li:text-muted-foreground",
        "prose-strong:text-foreground",
        "prose-a:text-brand prose-a:no-underline hover:prose-a:underline",
        // O README dimensiona pelos atributos: logo com `width="156px"`,
        // ícones só com `height="42"` (a largura sai da proporção). Nada de
        // `h-auto` aqui — CSS ganha de atributo HTML, e a altura dos ícones
        // some junto, esticando cada logo pra largura inteira do card.
        // `max-w-full` basta: nenhuma imagem do README passa disso.
        "prose-img:inline prose-img:my-1 prose-img:max-w-full",
        "prose-hr:border-border"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{ img: ImagemDoReadme, source: FonteDoReadme }}
      >
        {conteudo}
      </ReactMarkdown>
    </div>
  )
}
