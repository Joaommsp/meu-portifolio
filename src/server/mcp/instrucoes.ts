import "server-only"

import { RECURSOS_DE_DOCUMENTO_UNICO } from "@/lib/conteudo"
import { NOMES_DE_RECURSO } from "@/lib/conteudo/tipos"
import { ROTULOS_DOS_TIPOS_DE_IMAGEM } from "@/lib/imagem"
import { emMegabytes, ITENS_POR_PAGINA, MAX_BYTES_DA_IMAGEM } from "@/lib/mcp/limites"
import { juntarComOu } from "@/lib/utils"

import type { Acesso } from "./acessos/tipos"

/** `instructions` do `initialize` (MCP-15): o que a LLM lê antes de chamar. */

const DOCUMENTOS_UNICOS = RECURSOS_DE_DOCUMENTO_UNICO.map((r) => `"${r}"`).join(", ")

const BASE = `Servidor do conteúdo do portfólio do João (o mesmo que o painel /admin publica).

Recursos: ${NOMES_DE_RECURSO.join(", ")}. ${DOCUMENTOS_UNICOS} é um documento único: use obter e atualizar sem id.

Antes de criar ou atualizar, chame descrever_recurso para ver os campos, os limites e os obrigatórios do recurso. Em atualizar, mande só os campos que mudam.

Datas na entrada no formato YYYY-MM-DD. listar devolve ${ITENS_POR_PAGINA} itens por página; passe o cursor recebido para a próxima.

Imagem: chame subir_imagem e use a URL devolvida no campo. Prefira a url pública da imagem; base64 só até ${emMegabytes(MAX_BYTES_DA_IMAGEM)} (${juntarComOu(ROTULOS_DOS_TIPOS_DE_IMAGEM)}).

Erro volta como "CODIGO: mensagem"; corrija os campos apontados e tente de novo.`

export function instrucoes(acesso: Acesso): string {
  if (acesso.tipo !== "unico" || !acesso.escopo) return BASE
  const { recurso, itemId, acoes } = acesso.escopo
  const item = itemId ? `, só o item ${itemId}` : ""
  return `${BASE}

Este é um acesso de uso único: recurso ${recurso}${item}, ações ${acoes.join(", ")}.
Tarefa: ${acesso.tarefa ?? ""}
Ao terminar a tarefa, chame concluir_tarefa: o acesso se encerra.`
}
