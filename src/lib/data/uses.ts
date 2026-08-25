import { restListUses, firestoreRestAvailable } from "@/lib/firebase/rest"
import type { UsesCategory } from "@/types/uses"

/**
 * Leitura pública do setup (server-side).
 * Sem Firebase ou sem rede, devolve lista vazia — a página mostra o aviso de
 * "ainda montando" em vez de quebrar.
 */
export async function getUsesCategories(): Promise<UsesCategory[]> {
  if (!firestoreRestAvailable) return []
  return restListUses()
}
