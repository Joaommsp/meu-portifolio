import { restGetCurrently, firestoreRestAvailable } from "@/lib/firebase/rest"
import { EMPTY_CURRENTLY, type Currently } from "@/types/currently"

/**
 * Camada de leitura do "O que tá rolando" (server-side).
 *
 * Sem Firebase, sem rede ou antes do primeiro save, devolve o estado vazio —
 * a seção continua no ar e os cards declaram "nada no momento". Nunca exibe
 * conteúdo antigo como se fosse atual.
 */
export async function getCurrently(): Promise<Currently> {
  if (!firestoreRestAvailable) return EMPTY_CURRENTLY
  return restGetCurrently()
}
