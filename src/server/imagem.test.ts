import { describe, expect, it, vi } from "vitest"

import { MAX_BYTES_DA_IMAGEM } from "@/lib/mcp/limites"

import { subirImagem } from "./imagem"

const env = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "nuvem",
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "preset",
}

const respostaOk = {
  secure_url: "https://res.cloudinary.com/nuvem/image/upload/capa.png",
  width: 800,
  height: 1200,
  bytes: 123456,
}

function fetchFalso(status = 200, corpo: unknown = respostaOk) {
  return vi.fn(async () => new Response(JSON.stringify(corpo), { status }))
}

function enviado(f: ReturnType<typeof fetchFalso>) {
  const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
  return { url, corpo: init.body as FormData }
}

const base64De = (bytes: number) => Buffer.alloc(bytes, 1).toString("base64")

describe("subirImagem", () => {
  it("url http(s) vai ao Cloudinary como file e devolve url, largura, altura e bytes (IMG-01)", async () => {
    const f = fetchFalso()

    const r = await subirImagem({ url: "https://exemplo.com/capa.jpg" }, { fetch: f, env })

    expect(r).toEqual({ url: respostaOk.secure_url, largura: 800, altura: 1200, bytes: 123456 })
    const { url, corpo } = enviado(f)
    expect(url).toBe("https://api.cloudinary.com/v1_1/nuvem/image/upload")
    expect(corpo.get("file")).toBe("https://exemplo.com/capa.jpg")
    expect(corpo.get("upload_preset")).toBe("preset")
  })

  it("base64 de exatamente 3 MB em PNG vai como data URI e devolve os mesmos campos (IMG-02)", async () => {
    const f = fetchFalso()
    const base64 = base64De(MAX_BYTES_DA_IMAGEM)

    const r = await subirImagem({ base64, tipo: "image/png" }, { fetch: f, env })

    expect(r).toEqual({ url: respostaOk.secure_url, largura: 800, altura: 1200, bytes: 123456 })
    expect(enviado(f).corpo.get("file")).toBe(`data:image/png;base64,${base64}`)
  })

  it.each(["image/jpeg", "image/webp", "image/gif"])(
    "base64 em %s é aceito e vai como data URI do mesmo tipo (IMG-02)",
    async (tipo) => {
      const f = fetchFalso()
      const base64 = base64De(10)

      const r = await subirImagem({ base64, tipo }, { fetch: f, env })

      expect(r).toEqual({ url: respostaOk.secure_url, largura: 800, altura: 1200, bytes: 123456 })
      expect(enviado(f).corpo.get("file")).toBe(`data:${tipo};base64,${base64}`)
    }
  )

  it("base64 acima de 3 MB decodificados devolve IMAGEM_GRANDE orientando usar url (IMG-03)", async () => {
    const f = fetchFalso()

    const erro = await subirImagem(
      { base64: base64De(MAX_BYTES_DA_IMAGEM + 1), tipo: "image/jpeg" },
      { fetch: f, env }
    ).catch((e: unknown) => e)

    expect(erro).toMatchObject({ codigo: "IMAGEM_GRANDE" })
    expect((erro as Error).message).toContain("url")
    expect(f).not.toHaveBeenCalled()
  })

  it("tipo fora de JPG, PNG, WebP e GIF devolve TIPO_NAO_SUPORTADO (IMG-04)", async () => {
    const f = fetchFalso()

    await expect(
      subirImagem({ base64: base64De(10), tipo: "image/bmp" }, { fetch: f, env })
    ).rejects.toMatchObject({ codigo: "TIPO_NAO_SUPORTADO" })
    expect(f).not.toHaveBeenCalled()
  })

  it.each([
    ["os dois", { url: "https://exemplo.com/a.png", base64: base64De(10), tipo: "image/png" }],
    ["nenhum", {}],
  ])("url e base64: %s devolve ACAO_INVALIDA (IMG-05)", async (_caso, entrada) => {
    const f = fetchFalso()

    await expect(subirImagem(entrada, { fetch: f, env })).rejects.toMatchObject({
      codigo: "ACAO_INVALIDA",
    })
    expect(f).not.toHaveBeenCalled()
  })

  it("Cloudinary recusando vira FALHA_EXTERNA com o motivo (Edge Case)", async () => {
    const f = fetchFalso(400, { error: { message: "Resource not found" } })

    await expect(
      subirImagem({ url: "https://exemplo.com/sumiu.png" }, { fetch: f, env })
    ).rejects.toMatchObject({
      codigo: "FALHA_EXTERNA",
      message: "O Cloudinary recusou a imagem: Resource not found",
    })
  })
})
