/**
 * Spotify Web API — fetchers pro now-playing widget.
 *
 * Usa OAuth com refresh_token. Setup uma vez:
 *  1. Cria app em developer.spotify.com/dashboard
 *  2. Roda /api/spotify/login local pra pegar refresh_token
 *  3. Cola CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN em .env.local
 */

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing"
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1"

export type SpotifyTrack = {
  name: string
  artist: string
  album: string
  albumImage: string | null
  url: string
}

export type NowPlayingResponse =
  | { source: "now-playing"; track: SpotifyTrack }
  | { source: "recent"; track: SpotifyTrack }
  | { source: "fallback"; track: SpotifyTrack }

const FALLBACK_PLAYLIST: SpotifyTrack[] = [
  {
    name: "Lover, You Should've Come Over",
    artist: "Jeff Buckley",
    album: "Grace",
    albumImage: null,
    url: "https://open.spotify.com/track/3lA1U3GjAlChJqz5LYNjwX",
  },
  {
    name: "Holocene",
    artist: "Bon Iver",
    album: "Bon Iver, Bon Iver",
    albumImage: null,
    url: "https://open.spotify.com/track/2IFf3FpQRaEJ8ivPYTcF7T",
  },
  {
    name: "Redbone",
    artist: "Childish Gambino",
    album: "Awaken, My Love!",
    albumImage: null,
    url: "https://open.spotify.com/track/0wXuerDYiBnERgIpbb3JBR",
  },
]

function getEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) return null
  return { clientId, clientSecret, refreshToken }
}

async function getAccessToken(): Promise<string | null> {
  const env = getEnv()
  if (!env) return null

  const basic = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString(
    "base64"
  )

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.refreshToken,
    }),
    cache: "no-store",
  })

  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

type SpotifyTrackPayload = {
  name: string
  external_urls?: { spotify?: string }
  artists?: Array<{ name: string }>
  album?: {
    name: string
    images?: Array<{ url: string }>
  }
}

function normalizeTrack(item: SpotifyTrackPayload): SpotifyTrack {
  return {
    name: item.name,
    artist: item.artists?.map((a) => a.name).join(", ") ?? "",
    album: item.album?.name ?? "",
    albumImage: item.album?.images?.[0]?.url ?? null,
    url: item.external_urls?.spotify ?? "https://open.spotify.com",
  }
}

function pickFallback(): SpotifyTrack {
  const idx = Math.floor(Math.random() * FALLBACK_PLAYLIST.length)
  return FALLBACK_PLAYLIST[idx] ?? FALLBACK_PLAYLIST[0]!
}

export async function getNowPlaying(): Promise<NowPlayingResponse> {
  const accessToken = await getAccessToken()
  if (!accessToken) return { source: "fallback", track: pickFallback() }

  // Tenta currently-playing primeiro
  try {
    const res = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })

    if (res.status === 200) {
      const data = (await res.json()) as {
        is_playing: boolean
        item?: SpotifyTrackPayload
      }
      if (data.is_playing && data.item) {
        return { source: "now-playing", track: normalizeTrack(data.item) }
      }
    }
  } catch {
    /* fall through pra recently-played */
  }

  // Fallback 1: último ouvido (API real)
  try {
    const res = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })

    if (res.ok) {
      const data = (await res.json()) as {
        items?: Array<{ track: SpotifyTrackPayload }>
      }
      const item = data.items?.[0]?.track
      if (item) return { source: "recent", track: normalizeTrack(item) }
    }
  } catch {
    /* cai no fallback fictício */
  }

  // Fallback 2: playlist curada
  return { source: "fallback", track: pickFallback() }
}
