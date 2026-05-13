import { NextResponse } from "next/server"

/**
 * One-time OAuth helper. Acessa /api/spotify/login uma vez no localhost,
 * autoriza o app, e o callback printa o refresh_token pra colar no .env.
 *
 * Em produção esse endpoint não tem uso — pode ser removido depois.
 */
export async function GET(req: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID não definido" },
      { status: 500 }
    )
  }

  const origin = new URL(req.url).origin
  const redirectUri = `${origin}/api/spotify/callback`

  const scope = [
    "user-read-currently-playing",
    "user-read-recently-played",
  ].join(" ")

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  })

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}
