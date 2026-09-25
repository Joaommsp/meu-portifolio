import { TOM_SELO } from "@/components/selo/tons"
import type { Project } from "@/types/project"

/**
 * Cor do selo de status do projeto, a mesma no card e na página de detalhe.
 * O rótulo mora em `types/project.ts`, ao lado do enum.
 */
export const PROJECT_STATUS_COLOR: Record<Project["status"], string> = {
  "em-desenvolvimento": TOM_SELO.warning,
  concluido: TOM_SELO.success,
  arquivado: TOM_SELO.apagado,
}
