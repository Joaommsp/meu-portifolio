import { NextResponse } from "next/server"

import { getNowPlaying } from "@/lib/spotify"

// Cache de 30s no edge, mas no client polling controla refresh.
export const revalidate = 30

export async function GET() {
  const data = await getNowPlaying()
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  })
}
