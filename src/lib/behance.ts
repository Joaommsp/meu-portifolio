/**
 * Projetos do Behance.
 *
 * A Adobe encerrou a API pública: `api.behance.net` responde 403 ("A client or
 * user is required") e o RSS antigo dá 400. Sobrou ler o HTML do perfil.
 *
 * A extração se apoia em dois padrões de URL — `/gallery/{id}/{slug}` e o CDN
 * das capas — e não em nome de classe CSS, que no Behance é hasheado e muda a
 * cada deploy deles. Isso não torna a raspagem estável, só menos frágil.
 *
 * Por isso a revalidação é longa e a falha é silenciosa: se o Behance mudar, a
 * página fica com o último resultado bom em cache até ele expirar, e depois
 * simplesmente não mostra a seção — nunca quebra a página.
 */

const PERFIL = "joaomarcos10oficial"
const PERFIL_URL = `https://www.behance.net/${PERFIL}`
const REVALIDATE_SECONDS = 60 * 60 * 12 // 12h — conteúdo que muda raramente

export type BehanceProject = {
  id: string
  title: string
  url: string
  coverImage: string | null
  /** "UX/UI Design" ou "Social Media", quando o título traz o prefixo. */
  category: string | null
}

/** Entidades que aparecem nos títulos extraídos do HTML. */
function decodificar(texto: string): string {
  return texto
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim()
}

/**
 * Os títulos vêm como "UX/UI Design - Waveflix". Separar a categoria deixa o
 * card com um rótulo próprio e o nome do projeto sem prefixo repetido.
 */
function separarCategoria(titulo: string): {
  title: string
  category: string | null
} {
  const m = titulo.match(/^\s*(UX\/UI Design|Social Media|Branding)\s*[-–—]\s*(.+)$/i)
  if (!m) return { title: titulo, category: null }
  return { title: m[2]!.trim(), category: m[1]!.trim() }
}

function extrair(html: string): BehanceProject[] {
  const projetos: BehanceProject[] = []
  const vistos = new Set<string>()

  // Cada projeto é um <article>; o recorte por article evita casar a capa de
  // um com o link de outro.
  const artigos = html.match(/<article\b[\s\S]*?<\/article>/gi) ?? []

  for (const artigo of artigos) {
    const link = artigo.match(/\/gallery\/(\d+)\/([A-Za-z0-9\-_%]+)/)
    if (!link) continue

    const id = link[1]!
    if (vistos.has(id)) continue

    const rotulo = artigo.match(/aria-label="([^"]{3,120})"/)
    if (!rotulo) continue

    const capa = artigo.match(
      /https:\/\/mir-s3-cdn-cf\.behance\.net\/projects\/[^"'\\\s]+?\.(?:png|jpe?g|webp)/i
    )

    const { title, category } = separarCategoria(decodificar(rotulo[1]!))
    vistos.add(id)
    projetos.push({
      id,
      title,
      category,
      url: `https://www.behance.net/gallery/${id}/${link[2]}`,
      coverImage: capa ? capa[0] : null,
    })
  }

  return projetos
}

export type BehanceResultado = {
  projects: BehanceProject[]
  profileUrl: string
  /** false quando a busca falhou ou o HTML mudou de forma — a página avisa. */
  ok: boolean
}

export async function fetchBehanceProjects(): Promise<BehanceResultado> {
  const vazio: BehanceResultado = {
    projects: [],
    profileUrl: PERFIL_URL,
    ok: false,
  }

  try {
    const res = await fetch(PERFIL_URL, {
      headers: {
        // Sem User-Agent de navegador o Behance devolve página de bloqueio.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return vazio

    const projetos = extrair(await res.text())
    if (projetos.length === 0) return vazio

    return { projects: projetos, profileUrl: PERFIL_URL, ok: true }
  } catch {
    return vazio
  }
}

export const BEHANCE_PROFILE_URL = PERFIL_URL
export const BEHANCE_HANDLE = PERFIL
