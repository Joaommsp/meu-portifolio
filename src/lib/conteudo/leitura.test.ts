import { describe, expect, it } from "vitest"

import { deDataIso, paraDataIso } from "./leitura"

/** As datas do conteúdo ficam no horário de Brasília, seja qual for o fuso de quem roda. */
describe("datas no fuso do site", () => {
  it("paraDataIso usa o dia de Brasília quando o dia UTC já virou", () => {
    // 01:00 UTC do dia 10 = 22:00 do dia 9 em Brasília.
    expect(paraDataIso(new Date("2026-01-10T01:00:00.000Z"))).toBe("2026-01-09")
  })

  it("deDataIso devolve a meia-noite de Brasília", () => {
    expect(deDataIso("2026-01-10").toISOString()).toBe("2026-01-10T03:00:00.000Z")
  })
})
