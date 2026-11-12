import { describe, expect, it } from "vitest"

import { exigirAdmin } from "./admin-auth"
import { ServicoNaoConfiguradoError } from "./firebase-admin"

const DONO = "uid-do-dono"
const ENV = { ADMIN_UID: DONO }

/** Verificador falso: o token é o próprio uid; "invalido" lança como o firebase-admin. */
async function verificar(token: string): Promise<string> {
  if (token === "invalido") throw new Error("auth/argument-error")
  return token
}

function req(authorization?: string) {
  return new Request("http://localhost/api/admin/mcp/acessos", {
    headers: authorization ? { authorization } : {},
  })
}

async function status(resultado: Awaited<ReturnType<typeof exigirAdmin>>) {
  if (!("resposta" in resultado)) throw new Error("esperava resposta de erro")
  return { status: resultado.resposta.status, corpo: await resultado.resposta.json() }
}

describe("exigirAdmin (ACESSOS-05)", () => {
  it("sem token responde 401", async () => {
    expect(await status(await exigirAdmin(req(), verificar, ENV))).toMatchObject({
      status: 401,
      corpo: { codigo: "NAO_AUTENTICADO" },
    })
  })

  it("token inválido responde 401", async () => {
    expect(await status(await exigirAdmin(req("Bearer invalido"), verificar, ENV))).toMatchObject({
      status: 401,
      corpo: { codigo: "NAO_AUTENTICADO" },
    })
  })

  it("token de outro uid responde 403", async () => {
    expect(await status(await exigirAdmin(req("Bearer outro-uid"), verificar, ENV))).toMatchObject({
      status: 403,
      corpo: { codigo: "SEM_PERMISSAO" },
    })
  })

  it("o dono passa e recebe o uid", async () => {
    expect(await exigirAdmin(req(`Bearer ${DONO}`), verificar, ENV)).toEqual({ uid: DONO })
  })

  it("sem ADMIN_UID usa NEXT_PUBLIC_ADMIN_UID", async () => {
    expect(
      await exigirAdmin(req(`Bearer ${DONO}`), verificar, { NEXT_PUBLIC_ADMIN_UID: DONO })
    ).toEqual({ uid: DONO })
  })

  it("sem service account deixa o erro subir para virar 503", async () => {
    const semConta = async () => {
      throw new ServicoNaoConfiguradoError()
    }

    await expect(exigirAdmin(req("Bearer x"), semConta, ENV)).rejects.toBeInstanceOf(
      ServicoNaoConfiguradoError
    )
  })
})
