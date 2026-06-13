import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — uploads de capa/galeria via admin
      { protocol: "https", hostname: "res.cloudinary.com" },
      // GitHub avatars — atalho `github.com/<user>.png` redireciona pra avatars.githubusercontent.com
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Capas de álbum do Spotify
      { protocol: "https", hostname: "i.scdn.co" },
      // Capas de jogos — PlayStation Store + IGDB (banco de dados de games)
      { protocol: "https", hostname: "image.api.playstation.com" },
      { protocol: "https", hostname: "images.igdb.com" },
      // Avatars Google (guestbook)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Headers de segurança e cache
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },
}

export default nextConfig
