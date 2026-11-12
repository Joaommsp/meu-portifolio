# STATE

## Handoff
- **Feature:** mcp-do-admin (`.specs/features/mcp-do-admin/`): **entregue localmente, sem commit** (regra do repo). T1-T41 feitas; Verifier PASS; e2e em `e2e.md`.
- **Próximo passo:** o João revisa e decide commit/deploy. Antes do deploy, na Vercel: env `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_UID`, `MCP_PUBLIC_URL` (URL completa com `/api/mcp`); Node 22+; colar `firestore.rules` no console; ligar TTL em `mcpLimite.expiraEm`.
- **Dívidas abertas (features próprias):** admin no celular (sidebar `w-64` fixa, `src/app/admin/layout.tsx:27-30`, `AdminSidebar.tsx:107`; pede mockup); `sr-only` "Close" em inglês em `src/components/ui/dialog.tsx:89`; Verifier menores (teste do nome com 60 caracteres, asserção de ausência de sessão, valor 10 só no teste do serviço); demais `lib/firebase/*.ts` ainda repetem nome de coleção (AD-001).
- **Fora do git:** toda a feature + `.specs/`; alteração alheia em `src/components/sections/Services.tsx`.
- **Ambiente:** dev `npm run dev` (3001) com service account no `.env.local`.

## Decisions

### AD-001
- **Decision**: A regra de cada recurso de conteúdo (schema, conversão documento/formulário/entrada, campos derivados) mora em `src/lib/conteudo/<recurso>.ts`, pura e sem SDK; admin cliente e servidor importam a mesma definição.
- **Reason**: O servidor do MCP grava com firebase-admin e não pode usar as libs do SDK cliente nem a conversão que vivia dentro dos formulários.
- **Trade-off**: Refatora formulários e libs do admin que já funcionavam.
- **Scope**: todo recurso de conteúdo do admin, atual e futuro.
- **Date**: 2026-11-03
- **Status**: active
- **Vigência**: convenção

### AD-002
- **Decision**: Código que só roda no servidor (firebase-admin, segredos, MCP) fica em `src/server/` e importa `server-only`.
- **Reason**: O repo era todo cliente + leitura REST; a credencial de serviço não pode chegar ao navegador.
- **Trade-off**: Uma pasta nova fora do padrão `lib/*`.
- **Scope**: repo inteiro.
- **Date**: 2026-11-03
- **Status**: active
- **Vigência**: convenção
