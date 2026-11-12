# MCP do admin Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/mcp-do-admin/design.md`
**Status**: Done
**Commits**: nenhum por task. `CLAUDE.md` do repo: commit e push só com pedido; aplicar, validar e parar.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md` (ler docs do Next antes de API nova), `CLAUDE.md` do repo. Sem testes existentes: runner novo (Vitest) aprovado na spec.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Definição de recurso (`src/lib/conteudo`) | unit | Cada AC que a toca; ida e volta documento/formulário/entrada; derivados de posts | `src/lib/conteudo/*.test.ts` | `npx vitest run <arquivo>` |
| Funções puras (`src/lib/mcp`, `src/server/mcp/acessos/{segredo,situacao}`) | unit | 1:1 com os ACs | `**/*.test.ts` ao lado | `npx vitest run <arquivo>` |
| Serviços (`src/server/conteudo/servico`, `src/server/mcp/acessos/servico`, `src/server/imagem`) | unit | Todos os ramos; 1:1 com ACs; edge cases listados na spec | `**/*.test.ts` ao lado, repositório em memória | `npx vitest run <arquivo>` |
| Repositórios firebase-admin | unit (conversões puras) + integration contra Firestore real 1× no fim | Conversões na task; get/list/create/update/delete/transação no contrato (T40) | `src/server/**/*.test.ts`, `src/server/__contrato__/*.contrato.test.ts` | `npx vitest run <arquivo>` |
| Rotas (`src/app/api/**/route.ts`) | integration | Toda rota: sucesso + cada cenário de backend da spec | `src/app/api/**/route.test.ts` | `npx vitest run <arquivo>` |
| Componentes e página do admin | e2e (1× no fim, T41) | Fluxo do mockup: gerar, copiar, revogar, encerrar, apagar, estados | roteiro em `.specs/features/mcp-do-admin/e2e.md` | Playwright MCP + `claude mcp add` |
| Config / regras / tipos | none | build gate only | - | - |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Depois de cada task | `npx tsc --noEmit && npx eslint <arquivos tocados> && npx vitest run <testes da task> --reporter=dot` |
| Build | 1× depois da última task | `npx tsc --noEmit && npm run lint && npx vitest run --reporter=dot` (sem `next build` com o dev de pé; o build real é o da Vercel) + contrato T40 + e2e T41 |

---

## Execution Plan

### Phase 1: Fundação

```
T1 → T2 → T3
```

### Phase 2: Definições de conteúdo (AD-001)

```
T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13
```

### Phase 3: Conteúdo no servidor

```
T14 → T15 → T16
```

### Phase 4: Acessos

```
T17 → T18 → T19 → T20 → T21
```

### Phase 5: Servidor MCP

```
T22 → T23
```

### Phase 6: API de gestão

```
T24 → T25 → T26 → T27 → T28 → T29
```

### Phase 7: Dados da tela

```
T30 → T31 → T32
```

### Phase 8: Tela

```
T33 → T34 → T35 → T36 → T37 → T38 → T39
```

### Phase 9: Fechamento

```
T40 → T41
```

---

## Task Breakdown

### T1: Runner de teste

**What**: Instalar Vitest + `vite-tsconfig-paths`, criar `vitest.config.mts` (ambiente node, alias `@/`), script `test` e `engines.node >= 22` no `package.json`.
**Where**: `vitest.config.mts`
**Depends on**: None
**Reuses**: guia `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
**Requirement**: infraestrutura (todas)
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] `npx vitest run --passWithNoTests` sai 0
- [x] `npx tsc --noEmit` sai 0
**Tests**: none
**Gate**: quick

---

### T2: Inicialização do firebase-admin

**What**: Instalar `firebase-admin` e `server-only`; `obterFirestore()` / `obterAuth()` com init único (`getApps`), chave com `\n` restaurado, e `ServicoNaoConfiguradoError` quando faltam as env.
**Where**: `src/server/firebase-admin.ts`
**Depends on**: T1
**Reuses**: padrão de `requireDb`/`FirebaseNotConfiguredError` de `src/lib/firebase/config.ts`
**Requirement**: Edge Case 503 sem service account
**Tools**: MCP: context7 · Skill: NONE
**Done when**:
- [x] Sem env → lança `ServicoNaoConfiguradoError`
- [x] Chave com `\\n` vira quebra de linha
- [x] Gate quick passa; 2 testes
**Tests**: unit
**Gate**: quick

---

### T3: Regras do Firestore

**What**: Fechar `mcpAcessos`, `mcpAuditoria` e `mcpLimite` ao SDK cliente (`allow read, write: if false`).
**Where**: `firestore.rules`
**Depends on**: T2
**Reuses**: estrutura atual do arquivo
**Requirement**: Assumption "Regras do Firestore"
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Três blocos `match` novos com comentário no padrão do arquivo
**Tests**: none
**Gate**: quick

---

### T4: Contrato da definição de recurso

**What**: Tipos `Recurso`, `DefinicaoRecurso<Valores, Entrada>` (colecao, ordem, temSlug, unico, schema, deDocumento, paraEntrada, derivados?, descricao) e `ErroDominio` com os códigos da spec.
**Where**: `src/lib/conteudo/tipos.ts`
**Depends on**: None
**Reuses**: -
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Tipos exportados; `tsc` limpo
**Tests**: none
**Gate**: quick

---

### T5: Definição de projetos

**What**: Definição de projetos reaproveitando `projectFormSchema`; `toProjectInput` sai de `ProjectForm.tsx` e vira `paraEntrada` (o formulário passa a importar); `deDocumento` faz o caminho inverso.
**Where**: `src/lib/conteudo/projetos.ts`
**Depends on**: T4
**Reuses**: `src/lib/validations.ts:89`, `src/components/admin/ProjectForm.tsx:168`
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: `reuse-fn`
**Done when**:
- [x] Ida e volta documento → valores → entrada preserva os campos; datas `YYYY-MM-DD`
- [x] `concluido` sem `endDate` é recusado com a mensagem do schema
- [x] `ProjectForm` usa `paraEntrada`; comportamento do form igual
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T6: Definição de posts

**What**: Definição de posts com `derivados(entrada, atual)` puro (`readingTime`, `publishedAt` na primeira publicação, `null` ao despublicar); `src/lib/firebase/posts.ts` passa a usar `derivados`.
**Where**: `src/lib/conteudo/posts.ts`
**Depends on**: T5
**Reuses**: `postFormSchema`, `estimateReadingTime` (`src/lib/firebase/posts.ts:28`)
**Requirement**: MCP-06
**Tools**: MCP: NONE · Skill: `reuse-fn`
**Done when**:
- [x] Publicar pela 1ª vez marca `publishedAt: "agora"`; já publicado mantém; despublicar zera
- [x] `readingTime` recalculado quando `content` muda
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T7: Definição de livros

**What**: Definição de livros com `bookFormSchema`; conversão do `BookForm` passa a vir daqui.
**Where**: `src/lib/conteudo/livros.ts`
**Depends on**: T6
**Reuses**: `src/lib/validations.ts:211`, `src/components/admin/BookForm.tsx`
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: `reuse-fn`
**Done when**:
- [x] Ida e volta preserva campos; `rating` fora de 0..10 recusado
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T8: Definição de games

**What**: Definição de games com `gameFormSchema`; conversão do `GameForm` passa a vir daqui.
**Where**: `src/lib/conteudo/games.ts`
**Depends on**: T7
**Reuses**: `src/lib/validations.ts:159`, `src/components/admin/GameForm.tsx`
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: `reuse-fn`
**Done when**:
- [x] Ida e volta preserva campos; `platforms` vazio recusado
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T9: Definição de figma

**What**: `figmaFormSchema` novo em `validations.ts` (título obrigatório, url http(s), números ≥ 0) e definição de figma; a página do admin valida com ele ao salvar.
**Where**: `src/lib/conteudo/figma.ts`
**Depends on**: T8
**Reuses**: `src/types/figma.ts`, `src/app/admin/figma/page.tsx:87`
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Item sem título recusado com a mesma mensagem que a página mostra hoje ("Falta o título")
- [x] Documentos atuais do Firestore passam no schema (conferido por leitura REST)
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T10: Definição de uses

**What**: `usesFormSchema` (categoria + itens) e definição de uses com `normalizarItens` na leitura; a página valida com ele.
**Where**: `src/lib/conteudo/uses.ts`
**Depends on**: T9
**Reuses**: `src/types/uses.ts` (`normalizarItens`), `src/app/admin/uses/page.tsx`
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Item sem nome recusado; documento antigo sem `items` lê como `[]`
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T11: Definição de atualmente

**What**: `atualmenteFormSchema` (3 slots fixos) e definição `unico: true` (documento único); a página valida com ele.
**Where**: `src/lib/conteudo/atualmente.ts`
**Depends on**: T10
**Reuses**: `src/types/currently.ts` (`CURRENTLY_SLOTS`, `EMPTY_CURRENTLY`)
**Requirement**: MCP-10
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Slot fora de `lendo|ouvindo|estudando` recusado; documento ausente lê como `EMPTY_CURRENTLY`
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T12: Definição de jogando

**What**: `jogandoFormSchema` e definição de jogando; a página valida com ele.
**Where**: `src/lib/conteudo/jogando.ts`
**Depends on**: T11
**Reuses**: `src/types/playing.ts` (`PLAYING_STATUS`)
**Requirement**: MCP-06, MCP-07
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Status fora de `PLAYING_STATUS` recusado
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T13: Registro dos recursos

**What**: `RECURSOS` (as 8 definições) e `descreverRecurso(recurso)` que devolve campos, tipos, limites e enums lidos do schema.
**Where**: `src/lib/conteudo/index.ts`
**Depends on**: T12
**Reuses**: T5-T12
**Requirement**: MCP-05 (`descrever_recurso`), MCP-15
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] 8 recursos registrados; `descreverRecurso("livros")` lista `status` com os valores de `BOOK_STATUSES`
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T14: Repositório de conteúdo (firebase-admin)

**What**: `RepositorioConteudo` (interface) + implementação Firestore: listar paginado (50, cursor), obter, criar, atualizar, apagar, slugEmUso; `Date`→`Timestamp`, `"agora"`→`serverTimestamp`, saída com datas ISO. Fake em memória para os testes dos serviços.
**Where**: `src/server/conteudo/repositorio.ts`
**Depends on**: Phase 2 concluída
**Reuses**: `src/server/firebase-admin.ts`, ordenações de `src/lib/firebase/*.ts`
**Requirement**: MCP-06, Edge Cases (lista vazia, 50 por página)
**Tools**: MCP: context7 · Skill: NONE
**Done when**:
- [x] Conversões de ida e volta testadas (puras)
- [x] Fake em memória cumpre a mesma interface
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T15: Serviço de conteúdo

**What**: `executar(acao, recurso, args, escopo)`: escopo, merge do parcial + validação do schema inteiro, slug, `NAO_ENCONTRADO`, `ACAO_INVALIDA` em `atualmente`, `FALHA_EXTERNA`.
**Where**: `src/server/conteudo/servico.ts`
**Depends on**: T14
**Reuses**: `RECURSOS`, fake de T14
**Requirement**: MCP-06, MCP-07, MCP-08, MCP-09, MCP-10, UNICO-04
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Um teste por AC listado e por código de erro
- [x] Fora do escopo não chama o repositório (espião)
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T16: Upload de imagem

**What**: `subirImagem({ url } | { base64, tipo })` para o Cloudinary (preset unsigned), com tipo, 3 MB decodificados e exclusividade; `ALLOWED_TYPES` sai de `cloudinary.ts` para constante compartilhada.
**Where**: `src/server/imagem.ts`
**Depends on**: T15
**Reuses**: `src/lib/cloudinary.ts:41`
**Requirement**: IMG-01, IMG-02, IMG-03, IMG-04, IMG-05
**Tools**: MCP: NONE · Skill: `reuse-fn`
**Done when**:
- [x] Um teste por AC (fetch simulado); falha do Cloudinary vira `FALHA_EXTERNA`
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T17: Segredo

**What**: `gerarSegredo(tipo)` → `{ segredo, hash, prefixo }` e `hashDoSegredo(s)`.
**Where**: `src/server/mcp/acessos/segredo.ts`
**Depends on**: Phase 3 concluída
**Reuses**: `node:crypto`
**Requirement**: CHAVE-01, CHAVE-03, UNICO-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Formato `pf_pk_`/`pf_uu_` + 43 base64url; hash sha256 hex de 64; prefixo = tipo + 4
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T18: Situação do acesso

**What**: `situacao(acesso, agora)` pura: revogado > encerrado > vencido > ativo.
**Where**: `src/server/mcp/acessos/situacao.ts`
**Depends on**: T17
**Reuses**: -
**Requirement**: ACESSOS-01, MCP-11, UNICO-02
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Um teste por situação + limite exato de `expiraEm`
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T19: Repositório de acessos

**What**: `RepositorioAcessos` (interface) + Firestore: acessos por hash, auditoria, `consumirLimite` em transação (`mcpLimite/{id}_{minuto}`, `expiraEm`), contagem de pessoais ativas. Fake em memória.
**Where**: `src/server/mcp/acessos/repositorio.ts`
**Depends on**: T18
**Reuses**: `src/server/firebase-admin.ts`
**Requirement**: MCP-14, AUDIT-01, AUDIT-03
**Tools**: MCP: context7 · Skill: NONE
**Done when**:
- [x] Conversões puras testadas; fake cumpre a interface (inclui limite por minuto)
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T20: Serviço de acessos

**What**: `criarChave`, `criarUnico`, `revogar`, `encerrar`, `apagar`, `listar`, `atividade`, `autenticar` (situação, limite, `ultimoUsoEm` 1×/min) e auditoria de cada ação.
**Where**: `src/server/mcp/acessos/servico.ts`
**Depends on**: T19
**Reuses**: T17, T18, fake de T19
**Requirement**: CHAVE-01, CHAVE-02, ACESSOS-02, ACESSOS-03, ACESSOS-04, ACESSOS-06, UNICO-01, UNICO-02, UNICO-05, UNICO-06, MCP-11, MCP-13, MCP-14, AUDIT-01, AUDIT-03
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Um teste por AC listado; auditoria sem segredo nem dados do item
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T21: Configuração dos clientes e prompt

**What**: `CLIENTES_MCP` (6), `configuracaoDoCliente(...)`, `promptDeUsoUnico(...)` (URL, Bearer, `claude mcp add`, `curl` com os dois `Accept`, escopo, tarefa).
**Where**: `src/lib/mcp/conexao.ts`
**Depends on**: T20
**Reuses**: textos do mockup aprovado
**Requirement**: CHAVE-01, UNICO-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Uma configuração por cliente contém URL e Bearer; prompt contém os 5 itens
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T22: Servidor MCP

**What**: Instalar `@modelcontextprotocol/server`; `criarServidor(acesso, deps)` com `instructions` e as ferramentas do escopo (`listar`, `obter`, `criar`, `atualizar`, `apagar`, `descrever_recurso`, `subir_imagem`, `concluir_tarefa`), erro de domínio como `isError: true`, auditoria nas de escrita.
**Where**: `src/server/mcp/servidor.ts`
**Depends on**: Phase 4 concluída
**Reuses**: T13, T15, T16, T20
**Requirement**: MCP-04, MCP-05, MCP-15, UNICO-03, UNICO-05, AUDIT-01
**Tools**: MCP: context7 · Skill: NONE
**Done when**:
- [x] `tools/list` da pessoal = 7; do único = só as concedidas + `descrever_recurso` + `concluir_tarefa` (+ `subir_imagem` se criar/editar); sem `apagar`
- [x] `initialize` traz `instructions`
- [x] Testes por `Request` no transporte stateless com fakes
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T23: Rota `/api/mcp`

**What**: `POST` (413 > 4 MB, 401 único, 429, 503 sem service account, transporte stateless JSON), `GET`/`DELETE` 405; `runtime = "nodejs"`, `maxDuration = 60`.
**Where**: `src/app/api/mcp/route.ts`
**Depends on**: T22
**Reuses**: docs locais de route handler do Next 16
**Requirement**: MCP-04, MCP-11, MCP-12, MCP-14, Edge Cases (413, 503)
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Um teste por status (200, 401 x4 situações com a mesma mensagem, 405, 413, 429, 503)
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T24: Auth do admin no servidor

**What**: `exigirAdmin(req)` → uid ou `Response` 401/403, com `verifyIdToken` e `ADMIN_UID`.
**Where**: `src/server/admin-auth.ts`
**Depends on**: Phase 5 concluída
**Reuses**: `isAdminUid` (`src/lib/firebase/auth.ts:46`)
**Requirement**: ACESSOS-05
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Sem token 401; token inválido 401; outro uid 403; dono passa
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T25: Rota de acessos (listar e criar)

**What**: `GET` lista pessoais e únicos; `POST` cria (`tipo`), 201 com `{ acesso, segredo, prompt? }`, 400 por campo, 409 `LIMITE_DE_CHAVES`.
**Where**: `src/app/api/admin/mcp/acessos/route.ts`
**Depends on**: T24
**Reuses**: T20, T21
**Requirement**: CHAVE-01, CHAVE-02, ACESSOS-01, ACESSOS-06, UNICO-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Teste por cenário: 200, 201 pessoal, 201 único, 400 por campo, 401, 403, 409, 503
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T26: Rota de apagar acesso

**What**: `DELETE /api/admin/mcp/acessos/[id]` (204, 404, 409 `ACESSO_ATIVO`).
**Where**: `src/app/api/admin/mcp/acessos/[id]/route.ts`
**Depends on**: T25
**Reuses**: T20, T24
**Requirement**: ACESSOS-03, ACESSOS-04
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Teste por status; auditoria mantida após apagar
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T27: Rota de revogar

**What**: `POST /api/admin/mcp/acessos/[id]/revogar` (200, 404, 409 se já inativo).
**Where**: `src/app/api/admin/mcp/acessos/[id]/revogar/route.ts`
**Depends on**: T26
**Reuses**: T20, T24
**Requirement**: ACESSOS-02
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Revogada recebe 401 no `autenticar` seguinte
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T28: Rota de encerrar

**What**: `POST /api/admin/mcp/acessos/[id]/encerrar` para acesso único (200, 404, 409 se inativo ou se for pessoal).
**Where**: `src/app/api/admin/mcp/acessos/[id]/encerrar/route.ts`
**Depends on**: T27
**Reuses**: T20, T24
**Requirement**: UNICO-06
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Teste por status
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T29: Rota de atividade

**What**: `GET /api/admin/mcp/atividade` com as 20 mais recentes.
**Where**: `src/app/api/admin/mcp/atividade/route.ts`
**Depends on**: T28
**Reuses**: T20, T24
**Requirement**: AUDIT-02
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] 25 registros → 20, ordem decrescente; vazio → `[]`
- [x] Gate quick passa
**Tests**: integration
**Gate**: quick

---

### T30: Cliente da API de gestão

**What**: Funções de fetch com o ID token do `auth.currentUser` e erro fiel (`{ codigo, mensagem, campos }`).
**Where**: `src/lib/admin-api/mcp.ts`
**Depends on**: Phase 6 concluída
**Reuses**: `requireAuth` (`src/lib/firebase/config.ts`)
**Requirement**: ACESSOS-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Erro HTTP vira `ErroApi` com a mensagem do servidor (teste com fetch simulado)
- [x] Gate quick passa
**Tests**: unit
**Gate**: quick

---

### T31: Hook de acessos

**What**: `useAcessosMcp()` com carregando/erro/dados por bloco (chaves, únicos, atividade), `recarregar`, sem `?? []` inline (constante `EMPTY` estável).
**Where**: `src/components/admin/mcp/useAcessosMcp.ts`
**Depends on**: T30
**Reuses**: T30
**Requirement**: ACESSOS-01, AUDIT-02
**Tools**: MCP: NONE · Skill: `react-safe-defaults`
**Done when**:
- [x] `tsc` + lint limpos; coberto pelo e2e (T41)
**Tests**: e2e
**Gate**: quick

---

### T32: Item MCP na navegação

**What**: Entrada "MCP" com ícone `Plug` na sidebar do admin.
**Where**: `src/components/admin/AdminSidebar.tsx`
**Depends on**: T31
**Reuses**: lista de itens existente (`AdminSidebar.tsx:34`)
**Requirement**: ACESSOS-08
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Item aparece e marca ativo em `/admin/mcp`
**Tests**: e2e
**Gate**: quick

---

### T33: Endereço e capacidades

**What**: Cartões "Endereço do MCP" (caixa de cópia) e "O que a LLM pode fazer".
**Where**: `src/components/admin/mcp/ContextoMcp.tsx`
**Depends on**: Phase 7 concluída
**Reuses**: shadcn `card`, `button`, `tooltip`; mockup aprovado
**Requirement**: CHAVE-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Copiar funciona com fallback de seleção; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T34: Formulário da chave pessoal

**What**: Cartões dos 6 clientes, nome (`maxLength` 60 + contador), validade 1/30/90 (padrão 90), "Vence em", botão travado enquanto envia, banner de limite.
**Where**: `src/components/admin/mcp/ChavePessoalForm.tsx`
**Depends on**: T33
**Reuses**: `CLIENTES_MCP` (T21), shadcn `input`, `button`
**Requirement**: CHAVE-01, CHAVE-02, ACESSOS-06
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Erro do servidor por campo ao lado do campo; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T35: Formulário de uso único

**What**: Recurso, item (opcional, com busca), ações (ler/criar/editar; apagar desabilitado), tarefa (`maxLength` 500 + contador), "Encerra ao concluir a tarefa ou em 2 h".
**Where**: `src/components/admin/mcp/UsoUnicoForm.tsx`
**Depends on**: T34
**Reuses**: `RECURSOS` (T13), shadcn `select`, `checkbox`, `textarea`, `command`
**Requirement**: UNICO-01, UNICO-02
**Tools**: MCP: NONE · Skill: `anti-hardcoded`
**Done when**:
- [x] Opções de recurso vêm de `RECURSOS`; sem ação marcada o botão desabilita; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T36: Dialog do segredo

**What**: Mostra configuração do cliente (pessoal) ou prompt pronto (único), aviso "não será mostrado de novo", copiar.
**Where**: `src/components/admin/mcp/SegredoDialog.tsx`
**Depends on**: T35
**Reuses**: `configuracaoDoCliente`, `promptDeUsoUnico` (T21), shadcn `dialog`
**Requirement**: CHAVE-01, UNICO-01
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Fechar descarta o segredo do estado; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T37: Tabela de acessos

**What**: Tabela reutilizada para chaves e únicos: busca, situação em selo, ações em ícone com tooltip e `aria-label` (revogar/encerrar no ativo, lixeira destrutiva no inativo), confirmação em dialog, paginação de 10, estados por `EstadoListagem`.
**Where**: `src/components/admin/mcp/TabelaAcessos.tsx`
**Depends on**: T36
**Reuses**: shadcn `table`, `dialog`, `tooltip`; `EstadoListagem`; selos de `src/components/selo`
**Requirement**: ACESSOS-01, ACESSOS-02, ACESSOS-04, ACESSOS-07, UNICO-06
**Tools**: MCP: NONE · Skill: `react-safe-defaults`
**Done when**:
- [x] Nunca usado → "Nunca usado"; busca sem resultado com "Limpar busca"; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T38: Atividade recente

**What**: Lista das 20 últimas ações (ação · recurso · item, prefixo, quando), com vazio, erro e carregando.
**Where**: `src/components/admin/mcp/AtividadeRecente.tsx`
**Depends on**: T37
**Reuses**: `EstadoListagem`, formatador de data do projeto (`date-fns`)
**Requirement**: AUDIT-02
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Item ausente mostra só ação e recurso; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T39: Página `/admin/mcp`

**What**: Monta abas Chave pessoal / Uso único, coluna de contexto, atividade e as duas tabelas, ligadas ao hook; layout do mockup em desktop e celular.
**Where**: `src/app/admin/mcp/page.tsx`
**Depends on**: T38
**Reuses**: T31-T38, shadcn `tabs`
**Requirement**: ACESSOS-01, ACESSOS-08
**Tools**: MCP: playwright (conferência visual 1×) · Skill: NONE
**Done when**:
- [x] Página abre no dev (porta 3001) igual ao mockup; `tsc` + lint limpos
**Tests**: e2e
**Gate**: quick

---

### T40: Contrato com o Firestore real

**What**: Teste que só roda com `MCP_CONTRATO=1` e a service account: CRUD de cada recurso em coleções `mcpTeste_*`, transação de limite, acesso por hash; apaga tudo ao fim.
**Where**: `src/server/__contrato__/firestore.contrato.test.ts`
**Depends on**: Phase 8 concluída
**Reuses**: repositórios T14, T19
**Requirement**: MCP-06, MCP-13, MCP-14
**Tools**: MCP: NONE · Skill: NONE
**Done when**:
- [x] Roda verde contra o projeto real; coleções de teste removidas
**Tests**: integration
**Gate**: build

---

### T41: e2e do fluxo

**What**: Com o dev de pé: Playwright em `/admin/mcp` (gerar chave, copiar, revogar, criar uso único, encerrar, apagar, estados) e `claude mcp add` real criando e apagando um item; evidências no roteiro.
**Where**: `.specs/features/mcp-do-admin/e2e.md`
**Depends on**: T40
**Reuses**: mockup aprovado como roteiro
**Requirement**: todos os P1
**Tools**: MCP: playwright · Skill: NONE
**Done when**:
- [x] Cada passo do roteiro com resultado e captura (caminho absoluto fora do repo); celular falha no shell do admin, anterior à feature, aberto à parte
**Tests**: e2e
**Gate**: build

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
| ---- | ----------------- | ------- | ------ |
| T1 | None | início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | None | início Phase 2 | ✅ |
| T5-T13 | anterior | cadeia T4 → ... → T13 | ✅ |
| T14 | T13 | Phase 2 → Phase 3 | ✅ |
| T15, T16 | anterior | T14 → T15 → T16 | ✅ |
| T17 | T16 | Phase 3 → Phase 4 | ✅ |
| T18-T21 | anterior | cadeia | ✅ |
| T22 | T21 | Phase 4 → Phase 5 | ✅ |
| T23 | T22 | T22 → T23 | ✅ |
| T24 | T23 | Phase 5 → Phase 6 | ✅ |
| T25-T29 | anterior | cadeia | ✅ |
| T30 | T29 | Phase 6 → Phase 7 | ✅ |
| T31, T32 | anterior | cadeia | ✅ |
| T33 | T32 | Phase 7 → Phase 8 | ✅ |
| T34-T39 | anterior | cadeia | ✅ |
| T40 | T39 | Phase 8 → Phase 9 | ✅ |
| T41 | T40 | T40 → T41 | ✅ |

## Test Co-location Validation

| Task | Camada | Matriz exige | Task diz | Status |
| ---- | ------ | ------------ | -------- | ------ |
| T1, T3, T4 | config / regras / tipos | none | none | ✅ |
| T2 | firebase-admin init (serviço) | unit | unit | ✅ |
| T5-T13 | definição de recurso | unit | unit | ✅ |
| T14, T19 | repositório (conversões) | unit + contrato T40 | unit | ✅ |
| T15, T16, T20 | serviço | unit | unit | ✅ |
| T17, T18, T21 | função pura | unit | unit | ✅ |
| T22, T23, T25-T29 | rota / transporte | integration | integration | ✅ |
| T24 | serviço de auth | unit | unit | ✅ |
| T30 | cliente HTTP | unit | unit | ✅ |
| T31-T39 | componente / página | e2e (T41) | e2e | ✅ |
| T40 | repositório real | integration | integration | ✅ |
| T41 | fluxo | e2e | e2e | ✅ |
