/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

import { findPostBySlug } from "@/lib/data/posts"

export const alt = "Post"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const CATEGORY_LABEL: Record<string, string> = {
  pensamento: "Pensamento",
  tutorial: "Tutorial",
  review: "Review",
  noticia: "Notícia",
  outro: "Outro",
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default async function PostOG({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await findPostBySlug(slug)

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a14",
            color: "#f5f5f5",
            fontSize: "64px",
          }}
        >
          Post não encontrado
        </div>
      ),
      { ...size }
    )
  }

  const date = post.publishedAt ?? post.createdAt
  const dateStr = dateFormatter.format(date)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(ellipse at 20% 20%, #14422c 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0d2a1f 0%, transparent 50%), #0a0a14",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: brand + category */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "22px",
              color: "#9ca3af",
              fontFamily: "monospace",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "100%",
                background: "#34d399",
                boxShadow: "0 0 16px #34d399",
              }}
            />
            <span>joaomarcos.dev/blog</span>
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              border: "1px solid #34d39955",
              borderRadius: "999px",
              fontSize: "20px",
              color: "#34d399",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            {CATEGORY_LABEL[post.category] ?? post.category}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <h1
            style={{
              fontSize: post.title.length > 50 ? "60px" : "76px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "1056px",
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              style={{
                fontSize: "26px",
                color: "#9ca3af",
                margin: 0,
                maxWidth: "1000px",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "22px",
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#34d399" }}>—</span>
            João Marcos
          </span>
          <span style={{ display: "flex", gap: "32px" }}>
            <span>{post.readingTime} min</span>
            <span>{dateStr}</span>
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
