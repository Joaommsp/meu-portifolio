import { describe, expect, it } from "vitest"

import { situacao } from "./situacao"

const expiraEm = new Date("2026-11-03T14:00:00.000Z")
const antes = new Date("2026-11-03T13:00:00.000Z")
const depois = new Date("2026-11-03T15:00:00.000Z")
const base = { revogadoEm: null, encerradoEm: null, expiraEm }

describe("situação do acesso (ACESSOS-01, MCP-11, UNICO-02)", () => {
  it("sem revogação, sem encerramento e antes de expirar é ativo", () => {
    expect(situacao(base, antes)).toBe("ativo")
  })

  it("revogado vence sobre encerrado e vencido", () => {
    expect(situacao({ ...base, revogadoEm: antes, encerradoEm: antes }, depois)).toBe("revogado")
  })

  it("encerrado vence sobre vencido", () => {
    expect(situacao({ ...base, encerradoEm: antes }, depois)).toBe("encerrado")
  })

  it("depois de expiraEm é vencido", () => {
    expect(situacao(base, depois)).toBe("vencido")
  })

  it("limite exato: 1 ms antes de expiraEm é ativo; no instante de expiraEm é vencido", () => {
    expect(situacao(base, new Date(expiraEm.getTime() - 1))).toBe("ativo")
    expect(situacao(base, new Date(expiraEm.getTime()))).toBe("vencido")
  })
})
