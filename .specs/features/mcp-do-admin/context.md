# MCP do admin — contexto de partida

Pedido do João (03/11/2026): um servidor MCP para gerenciar o conteúdo do admin
(projetos, posts, livros e o resto) com uma LLM, com dois tipos de conexão:
chave de 90 dias e acesso de uso único, no modelo do gfi-reports.

## Decisões já tomadas com o João
- **Uso único** = token Bearer de vida curta (não é código trocado por sessão).
- **Gravação**: o servidor grava no Firestore com credencial de serviço
  (service account) do Firebase, configurada na Vercel pelo João.
- **Faixa**: GRANDE (auth, tokens, escrita em banco, 7+ arquivos) → fluxo
  completo do /tlc-spec-driven, Verifier, revisores. Mockup da tela de acessos
  no admin antes de codar.

## Referência: gfi-reports (github.com/gficonsultoria/gfi-reports)
Spec/design em `.specs/features/mcp-de-relatorios/`; código em
`apps/api/src/features/llm/*`, `apps/web/src/features/llm/*`.

- Uma coleção de acessos com `tipo: pessoal | unico`, mesma auth Bearer.
- Segredo: prefixo (`gfi_pk_` pessoal, `gfi_uu_` único) + 32 bytes base64url.
  Guarda só o sha256 hex; `prefixo` (prefixo + 4 chars) para a tela reconhecer.
  Situação derivada das datas (revogadoEm, encerradoEm, expiraEm), sem status.
- Chave pessoal: nome ≤ 60, validade 1 / 30 / 90 dias (padrão 90). Mostrada
  UMA vez, com configuração pronta para 6 clientes MCP (Claude Code:
  `claude mcp add --transport http <nome> <url> --header "Authorization: Bearer …"`).
  Revogar grava revogadoEm; apagar só quando inativa.
- Acesso único: 24 h, preso a um recurso; encerra sozinho quando a tarefa
  termina; botão "Encerrar". Entrega um PROMPT pronto (URL + Bearer + roteiro).
  No gfi-reports usa REST, não MCP; aqui decidir na spec.
- MCP: `POST /api/mcp`, stateless (sessionIdGenerator undefined, um servidor por
  POST, GET/DELETE 405). Só header Bearer. 401 com a MESMA mensagem para
  inexistente/revogado/encerrado/vencido. Permissões efetivas = perfil ∩ escopo
  da LLM. ultimoUsoEm atualizado no máximo 1×/min. Erro de domínio vira
  `isError: true`. Tem `instructions` e um prompt pronto.
- Auditoria por ação (chave criada, acesso único criado, revogado, apagado) com
  o id do acesso. Rate limit 120 req/min por acesso.
- Tela: escolher cliente (6 cartões) → gerar chave → copiar configuração;
  coluna com endereço do MCP, atividade recente e "o que a LLM pode fazer";
  tabelas de chaves e de acessos únicos.

## Notas de porte para este repo (Next 16 na Vercel + Firestore)
- Route Handler `app/api/mcp/route.ts`, `runtime = 'nodejs'`; transporte Web
  Standard do SDK (Request → Response) ou `mcp-handler`. Ler
  `node_modules/next/dist/docs/` antes (AGENTS.md).
- Acesso no Firestore com o sha256 como ID do documento (get direto).
- Rate limit em memória não funciona entre instâncias: Firestore em transação
  ou KV.
- Corpo da função na Vercel ~4,5 MB: imagem vai por Storage/Cloudinary, não base64
  grande no MCP.
- Hoje o admin grava pelo SDK cliente com regras (`NEXT_PUBLIC_ADMIN_UID`); o MCP
  precisa de `firebase-admin` (não instalado) e não pode passar pelas regras.
- Recursos do admin: `src/lib/firebase/{projects,posts,books,games,figma,uses,
  currently,playing}.ts` têm list/get/create/update/delete; reaproveitar tipos e
  validações (`src/lib/validations.ts`), não reescrever regra.
