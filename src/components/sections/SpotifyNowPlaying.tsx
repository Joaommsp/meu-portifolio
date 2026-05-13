"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type SpotifyTrack = {
  name: string
  artist: string
  album: string
  albumImage: string | null
  url: string
}

type Source = "now-playing" | "recent" | "fallback"

type Response = {
  source: Source
  track: SpotifyTrack
}

const POLL_INTERVAL = 30_000

const SOURCE_LABEL: Record<Source, string> = {
  "now-playing": "Tocando agora",
  recent: "Último som",
  fallback: "Da playlist",
}

export function SpotifyNowPlaying({ className }: { className?: string }) {
  const [data, setData] = React.useState<Response | null>(null)

  React.useEffect(() => {
    let aborted = false

    async function fetchNow() {
      try {
        const res = await fetch("/api/spotify/now-playing", {
          cache: "no-store",
        })
        if (!res.ok || aborted) return
        const json = (await res.json()) as Response
        if (!aborted) setData(json)
      } catch {
        /* mantém estado anterior */
      }
    }

    fetchNow()
    const id = window.setInterval(fetchNow, POLL_INTERVAL)
    return () => {
      aborted = true
      window.clearInterval(id)
    }
  }, [])

  if (!data) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm",
          className
        )}
      >
        <span className="size-9 animate-pulse rounded-md bg-muted/40" />
        <span className="flex flex-col gap-1">
          <span className="h-2.5 w-32 animate-pulse rounded bg-muted/40" />
          <span className="h-2 w-20 animate-pulse rounded bg-muted/30" />
        </span>
      </div>
    )
  }

  const { source, track } = data
  const isLive = source === "now-playing"

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${SOURCE_LABEL[source]}: ${track.name} por ${track.artist}`}
      className={cn(
        "group inline-flex max-w-sm items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-2 pr-4 backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-card/60",
        className
      )}
    >
      {/* Capa */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted/40">
        {track.albumImage ? (
          <Image
            src={track.albumImage}
            alt={`Capa de ${track.album}`}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand">
            <SpotifyMark className="size-5" />
          </div>
        )}
        {isLive && <Equalizer />}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_8px_var(--brand-glow)]" />
          )}
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-brand">
            {SOURCE_LABEL[source]}
          </span>
        </div>
        <span className="mt-0.5 truncate text-sm font-medium text-foreground transition-colors group-hover:text-brand">
          {track.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {track.artist}
        </span>
      </div>
    </a>
  )
}

function Equalizer() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-end justify-center gap-0.5 bg-black/40 p-1.5"
    >
      <span className="block w-0.5 origin-bottom animate-eq-1 bg-brand" />
      <span className="block w-0.5 origin-bottom animate-eq-2 bg-brand" />
      <span className="block w-0.5 origin-bottom animate-eq-3 bg-brand" />
      <span className="block w-0.5 origin-bottom animate-eq-1 bg-brand" />
    </div>
  )
}

function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.56.3z" />
    </svg>
  )
}
