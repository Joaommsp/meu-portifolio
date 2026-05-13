/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

import { findGameBySlug } from "@/lib/data/games"

export const alt = "Jogo"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const STATUS_LABEL: Record<string, string> = {
  jogando: "Jogando agora",
  concluido: "Concluído",
  rejogando: "Rejogando",
  wishlist: "Na wishlist",
  abandonado: "Abandonado",
}

export default async function GameOG({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = await findGameBySlug(slug)

  if (!game) {
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
          Jogo não encontrado
        </div>
      ),
      { ...size }
    )
  }

  const platforms = game.platforms.slice(0, 4)
  const topGenre = game.genres[0]

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "60px",
          background:
            "radial-gradient(ellipse at 25% 25%, #14422c 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, #0d2a1f 0%, transparent 55%), #0a0a14",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          gap: "48px",
        }}
      >
        {/* Cover */}
        {game.coverImage && (
          <div
            style={{
              display: "flex",
              width: "340px",
              height: "510px",
              borderRadius: "16px",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow:
                "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 60px -30px rgba(52,211,153,0.4)",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            <img
              src={game.coverImage}
              alt={game.title}
              width={340}
              height={510}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Top */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "20px",
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
              <span>joaomarcos.dev/games</span>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                {STATUS_LABEL[game.status] ?? game.status}
              </div>
              {topGenre && (
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
                  {topGenre}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  border: "1px solid #ffffff22",
                  borderRadius: "999px",
                  fontSize: "18px",
                  color: "#9ca3af",
                  fontFamily: "monospace",
                }}
              >
                {game.yearPlayed}
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: game.title.length > 22 ? "62px" : "82px",
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                margin: 0,
                marginTop: "8px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {game.title}
            </h1>

            {game.shortDescription && (
              <p
                style={{
                  fontSize: "22px",
                  color: "#9ca3af",
                  margin: 0,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {game.shortDescription}
              </p>
            )}
          </div>

          {/* Bottom: platforms + rating + author */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontFamily: "monospace",
              }}
            >
              {platforms.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {platforms.map((p) => (
                    <span
                      key={p}
                      style={{
                        display: "flex",
                        padding: "5px 12px",
                        background: "#ffffff0a",
                        border: "1px solid #ffffff15",
                        borderRadius: "6px",
                        color: "#d1d5db",
                        fontSize: "16px",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "18px",
                  color: "#9ca3af",
                }}
              >
                <span style={{ color: "#34d399" }}>—</span>
                João Marcos
              </span>
            </div>

            {game.rating != null && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontFamily: "monospace",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                  }}
                >
                  Minha nota
                </span>
                <span
                  style={{
                    fontSize: "56px",
                    fontWeight: 700,
                    color: "#34d399",
                    lineHeight: 1,
                  }}
                >
                  {game.rating.toFixed(1)}
                  <span
                    style={{
                      fontSize: "24px",
                      color: "#9ca3af",
                      fontWeight: 400,
                      marginLeft: "4px",
                    }}
                  >
                    /10
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
