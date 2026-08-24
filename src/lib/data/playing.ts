import { restListPlaying, firestoreRestAvailable } from "@/lib/firebase/rest"
import type { Playing } from "@/types/playing"

/**
 * Leitura pública do "jogando agora" (server-side).
 * Sem Firebase ou sem rede, devolve lista vazia — a seção some, em vez de
 * quebrar a página ou inventar conteúdo.
 */
export async function getPlaying(): Promise<Playing[]> {
  if (!firestoreRestAvailable) return []
  return restListPlaying()
}
