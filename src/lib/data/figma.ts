import { restListFigmaFiles, firestoreRestAvailable } from "@/lib/firebase/rest"
import type { FigmaFile } from "@/types/figma"

/**
 * Leitura pública dos arquivos da Figma Community (server-side).
 * Sem Firebase ou sem rede, devolve lista vazia — a página mostra o convite
 * pro perfil em vez de quebrar.
 */
export async function getFigmaFiles(): Promise<FigmaFile[]> {
  if (!firestoreRestAvailable) return []
  return restListFigmaFiles()
}
