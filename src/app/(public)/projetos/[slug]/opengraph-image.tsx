/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

import { findProjectBySlug } from "@/lib/data/projects"

export const alt = "Projeto"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const STATUS_LABEL: Record<string, string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  concluido: "Concluído",
  arquivado: "Arquivado",
}

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  design: "Design",
  outro: "Outro",
}

export default async function ProjectOG({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await findProjectBySlug(slug)

  if (!project) {
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
          Projeto não encontrado
        </div>
      ),
      { ...size }
    )
  }

  const techs = project.technologies.slice(0, 5)

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
            "radial-gradient(ellipse at 80% 20%, #14422c 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, #0d2a1f 0%, transparent 50%), #0a0a14",
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
            <span>joaomarcos.dev/projetos</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                border: "1px solid #ffffff22",
                borderRadius: "999px",
                fontSize: "18px",
                color: "#9ca3af",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {CATEGORY_LABEL[project.category] ?? project.category}
            </div>
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                border: "1px solid #34d39955",
                borderRadius: "999px",
                fontSize: "18px",
                color: "#34d399",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {STATUS_LABEL[project.status] ?? project.status}
            </div>
          </div>
        </div>

        {/* Title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <h1
            style={{
              fontSize: project.title.length > 30 ? "76px" : "96px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: 0,
              maxWidth: "1056px",
            }}
          >
            {project.title}
          </h1>

          {project.shortDescription && (
            <p
              style={{
                fontSize: "28px",
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
              {project.shortDescription}
            </p>
          )}
        </div>

        {/* Footer: tech stack */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {techs.map((tech) => (
              <span
                key={tech}
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  background: "#ffffff0a",
                  border: "1px solid #ffffff15",
                  borderRadius: "8px",
                  color: "#d1d5db",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#34d399" }}>—</span>
            João Marcos
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
