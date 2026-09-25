import { TOM_SELO } from "@/components/selo/tons"
import type { BookStatus } from "@/types/book"

/**
 * Cor do selo de status do livro, a mesma no card e na página de detalhe.
 * O rótulo mora em `types/book.ts`, ao lado do enum.
 */
export const BOOK_STATUS_COLOR: Record<BookStatus, string> = {
  lendo: TOM_SELO.brand,
  lido: TOM_SELO.success,
  relendo: TOM_SELO.brand,
  // Neutro: o `--info` que havia aqui não existe no tema, e o selo saía sem cor.
  wishlist: TOM_SELO.neutro,
  pausado: TOM_SELO.warning,
  abandonado: TOM_SELO.apagado,
}
