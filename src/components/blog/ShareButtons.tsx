"use client"

import * as React from "react"
import { Check, Copy, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type Props = {
  title: string
  url: string
}

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = React.useState(false)
  const [fullUrl, setFullUrl] = React.useState(url)
  const [canNativeShare, setCanNativeShare] = React.useState(false)

  // Resolve URL absoluta + detecta navigator.share APÓS hydration
  // pra não divergir entre server e client.
  React.useEffect(() => {
    setFullUrl(new URL(url, window.location.origin).toString())
    setCanNativeShare("share" in navigator)
  }, [url])

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success("Link copiado")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Erro ao copiar — selecione manualmente")
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: fullUrl })
    } catch {
      /* usuário cancelou — silencioso */
    }
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(fullUrl)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    fullUrl
  )}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Compartilhar
      </span>
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" />
        }
      >
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" />
        }
      >
        LinkedIn
      </Button>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? (
          <Check className="size-3.5" data-icon="inline-start" />
        ) : (
          <Copy className="size-3.5" data-icon="inline-start" />
        )}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      {canNativeShare && (
        <Button variant="ghost" size="sm" onClick={nativeShare}>
          <Share2 className="size-3.5" data-icon="inline-start" />
          Mais
        </Button>
      )}
    </div>
  )
}
