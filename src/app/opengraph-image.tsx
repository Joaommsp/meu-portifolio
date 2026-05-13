/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "João Marcos — Frontend Developer & UI/UX Designer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
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
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            color: "#9ca3af",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "100%",
              background: "#34d399",
              boxShadow: "0 0 24px #34d399",
            }}
          />
          <span>Portfólio</span>
        </div>

        {/* Hero text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h1
            style={{
              fontSize: "108px",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: 0,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>joão</span>
            <span style={{ color: "#34d399" }}>.</span>
            <span>marcos</span>
          </h1>
          <p
            style={{
              fontSize: "36px",
              color: "#9ca3af",
              margin: 0,
              maxWidth: "900px",
              lineHeight: 1.3,
            }}
          >
            Frontend Developer & UI/UX Designer
          </p>
        </div>

        {/* Footer */}
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
          <span>joaomarcos.dev</span>
          <span>Paulo Afonso · BA</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
