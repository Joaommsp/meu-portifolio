/**
 * Structured Data (JSON-LD) — só renderiza em produção.
 *
 * React 19 dev mode warna sobre `<script>` em React tree
 * ("scripts inside React components are never executed when rendering on the client").
 * Pra JSON-LD essa warning é irrelevante (script não é executado, é metadata),
 * mas polui o console em dev.
 *
 * Solução: renderizar só em produção. Crawlers consomem produção, dev é só
 * ferramenta. Mesma SEO, console limpo.
 */
export function StructuredData({ data }: { data: object | object[] }) {
  if (process.env.NODE_ENV !== "production") return null
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
