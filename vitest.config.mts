import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

/**
 * Testes unitários e de rota rodam no Node: o que se testa aqui é regra
 * pura e código de servidor, não componente. O alias `@/` vem do tsconfig.
 *
 * `server-only` lança fora do bundle de servidor do Next; no teste ele vira
 * o módulo vazio que o próprio pacote usa na condição `react-server`.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
