import { NextResponse } from "next/server"

/**
 * Callback do OAuth — recebe o `code` do Spotify, troca por tokens,
 * e renderiza uma página HTML com o refresh_token pra você copiar.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return new NextResponse(
      `Spotify retornou erro: ${error}\n\nComece pelo /api/spotify/login`,
      { status: 400 }
    )
  }

  if (!code) {
    return new NextResponse(
      "Sem código de autorização.\n\nNão acesse /callback diretamente — começa em http://127.0.0.1:3001/api/spotify/login",
      { status: 400 }
    )
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return new NextResponse(
      "SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET precisam estar no .env.local",
      { status: 500 }
    )
  }

  const redirectUri = `${origin}/api/spotify/callback`
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    return new NextResponse(`Falha ao trocar code por token:\n${err}`, {
      status: 500,
    })
  }

  const data = (await tokenRes.json()) as {
    access_token?: string
    refresh_token?: string
  }

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Spotify · refresh token</title>
  <style>
    body { font-family: ui-monospace, monospace; background: #0a0a14; color: #f5f5f5; padding: 48px; line-height: 1.6; }
    .box { background: #1a1a24; border: 1px solid #34d39955; border-radius: 12px; padding: 24px; margin-top: 16px; word-break: break-all; }
    .brand { color: #34d399; }
    h1 { font-family: system-ui, sans-serif; font-weight: 700; }
    code { background: #1a1a24; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>✓ Autorização <span class="brand">concluída</span></h1>
  <p>Cole isto no seu <code>.env.local</code>:</p>
  <div class="box">SPOTIFY_REFRESH_TOKEN=${data.refresh_token ?? "(faltou)"}</div>
  <p style="margin-top: 32px; color: #9ca3af;">
    Reinicie o servidor depois de salvar. Após isso, este endpoint pode ser deletado.
  </p>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
