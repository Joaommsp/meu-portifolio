import { TOM_SELO } from "@/components/selo/tons"
import type { GameStatus } from "@/types/game"

/**
 * Cor do selo de status do jogo, a mesma no card e na página de detalhe.
 * O rótulo mora em `types/game.ts`, ao lado do enum.
 */
export const GAME_STATUS_COLOR: Record<GameStatus, string> = {
  jogando: TOM_SELO.brand,
  concluido: TOM_SELO.success,
  rejogando: TOM_SELO.brand,
  // Neutro: o `--info` que havia aqui não existe no tema, e o selo saía sem cor.
  wishlist: TOM_SELO.neutro,
  abandonado: TOM_SELO.apagado,
}
