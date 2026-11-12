# MCP do admin: registro de execução

Lote 1 (fases 1 e 2, T1 a T13). Sem commit (regra do repo): gate verde e seguir.
Gate quick = `npx tsc --noEmit && npx eslint <arquivos tocados> && npx vitest run <testes da task> --reporter=dot`.
Avisos de lint que aparecem nos arquivos tocados são anteriores ao lote (`form.watch` incompatível com o React Compiler, `Check` sem uso no GameForm, `optionalUrlSchema` sem uso em `validations.ts`).

## T1

- Arquivos: `vitest.config.mts` (novo), `package.json` (script `test`, `engines.node >=22`, devDeps), `package-lock.json`.
- Dependências: `vitest@5.1.0`, `vite-tsconfig-paths@6.1.1`; `@types/node` de `^20` para `^22.20.5` (o vitest 5 exige `@types/node ^22 || >=24` como peer; casa com `engines >=22`).
- Gate: `npx tsc --noEmit && npx eslint vitest.config.mts && npx vitest run --passWithNoTests --reporter=dot` → exit 0, sem testes.
- Tests: none (config). Check A/C não se aplicam.
- Nota: o Vite 8 avisa que já resolve `paths` do tsconfig nativamente (`resolve.tsconfigPaths`); o plugin ficou porque a task pede. Trocar é uma linha.
- Veredito: Done-when cumprido (vitest e tsc saem 0).

## T2

- Arquivos: `src/server/firebase-admin.ts`, `src/server/firebase-admin.test.ts`, `vitest.config.mts` (alias de `server-only` para o `empty.js` do próprio pacote, porque ele lança fora da condição `react-server`).
- Dependências: `firebase-admin@14.5.0`, `server-only@0.0.1`. O primeiro `npm install` deixou `@opentelemetry/api` fora da árvore; um `npm install` seguido resolveu.
- Gate: `npx tsc --noEmit && npx eslint vitest.config.mts src/server/firebase-admin.ts src/server/firebase-admin.test.ts && npx vitest run src/server/firebase-admin.test.ts --reporter=dot` → 2 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Sem env lança `ServicoNaoConfiguradoError` (Edge Case 503) | `src/server/firebase-admin.test.ts:19` `expect(() => obterFirestore()).toThrow(ServicoNaoConfiguradoError)`; `:20` `.toThrow("Servidor MCP não configurado.")` | mensagem exata do Edge Case | Sim |
| Chave com `\\n` vira quebra de linha | `src/server/firebase-admin.test.ts:31` `expect(credencial.privateKey).toBe("-----BEGIN...\nABC\nDEF\n...")` | quebra de linha real | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `firebase-admin.test.ts:19-20` | Done-when 1 / Edge Case 503 | Sim |
| `firebase-admin.test.ts:31` | Done-when 2 | Sim |

- Veredito: 2 critérios, 2 asserções no valor exato; nada além do spec.

## T3

- Arquivos: `firestore.rules` (três `match` novos, `mcpAcessos`, `mcpAuditoria`, `mcpLimite`, com `allow read, write: if false;`, antes do bloco default).
- Gate: tsc e lint sem mudança de TS desde a rodada verde de T2 (não re-rodado); regras não têm lint no repo.
- Tests: none.
- Lembrete: o projeto Firebase é compartilhado (ver `CLAUDE.md`); publicar as regras exige juntar com as do outro site.
- Veredito: Done-when cumprido.

## T4

- Arquivos: `src/lib/conteudo/tipos.ts` (`NOMES_DE_RECURSO`/`Recurso`, `Ordem`, `DocumentoLido`, `AGORA`, `DefinicaoRecurso`, `CODIGOS_DE_ERRO`, `ErroDominio`).
- Gate: `npx tsc --noEmit && npx eslint src/lib/conteudo/tipos.ts` → exit 0.
- Tests: none.
- Acréscimos ao contrato do design (sem mudar o que já estava lá): `recurso` e `idDoDocumentoUnico` (o `atualmente` mora em `site/currently`, precisa do id); `ordem` é `null` no documento único (ajustado em T11); `derivados` recebe `Partial<Entrada>` (ajustado em T6, porque o admin grava patch parcial).
- Veredito: Done-when cumprido.

## T5

- Arquivos: `src/lib/conteudo/projetos.ts`, `src/lib/conteudo/projetos.test.ts`, `src/lib/conteudo/leitura.ts` (leitura saneada + `paraDataIso`/`deDataIso`, movidos do `ProjectForm`), `src/components/admin/ProjectForm.tsx` (usa `projetos.paraEntrada`; `projectToFormValues` delega a `projetos.deDocumento`; `toIsoDate`/`fromIsoDate` saíram), `src/lib/validations.ts` (`startDate`/`endDate` exigem `YYYY-MM-DD`).
- Gate: `npx tsc --noEmit && npx eslint src/components/admin/ProjectForm.tsx src/lib/conteudo/projetos.ts src/lib/conteudo/projetos.test.ts src/lib/conteudo/leitura.ts src/lib/validations.ts && npx vitest run src/lib/conteudo/projetos.test.ts --reporter=dot` → 3 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Ida e volta preserva os campos | `projetos.test.ts:33` `expect(entrada).toEqual(documento)` (inclui `liveUrl: null`, `Date` de início e fim) | igualdade campo a campo | Sim |
| Datas `YYYY-MM-DD` | `projetos.test.ts:27` `expect(valores.startDate).toBe("2024-03-05")`; `:28` endDate `"2024-06-30"`; `:56` formato fora do padrão recusado com `"Data inválida (use AAAA-MM-DD)"` | formato exato | Sim |
| `concluido` sem `endDate` recusado com a mensagem do schema | `projetos.test.ts:42` `toContainEqual({ path: ["endDate"], message: "Projetos concluídos precisam de data de término" })` | mensagem exata | Sim |
| `ProjectForm` usa `paraEntrada`, comportamento igual | `ProjectForm.tsx` (`projetos.paraEntrada(finalValues)`); sem teste de UI (matriz: componente = e2e T41) | - | Gate tsc/lint |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `projetos.test.ts:27-33` | Done-when 1 (ida e volta, datas) / MCP-06 | Sim |
| `projetos.test.ts:41-42` | Done-when 2 / MCP-07 | Sim |
| `projetos.test.ts:55-56` | Done-when 1 (datas YYYY-MM-DD) / MCP-07 | Sim |

- Veredito: todos os critérios com asserção no valor do spec.

## T6

- Arquivos: `src/lib/conteudo/posts.ts` (definição + `estimateReadingTime`, movida de `lib/firebase/posts.ts` para a definição ficar sem SDK), `src/lib/conteudo/posts.test.ts`, `src/lib/firebase/posts.ts` (`createPost`/`updatePost` usam `posts.derivados`; `AGORA` vira `serverTimestamp()`), `src/lib/conteudo/tipos.ts` (`derivados` com `Partial<Entrada>`).
- Gate: `npx tsc --noEmit && npx eslint src/lib/firebase/posts.ts src/lib/conteudo/posts.ts src/lib/conteudo/posts.test.ts src/lib/conteudo/tipos.ts && npx vitest run src/lib/conteudo/posts.test.ts --reporter=dot` → 5 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 1ª publicação marca `publishedAt: "agora"` (ao criar) | `posts.test.ts:22` `expect(derivados(entrada, null).publishedAt).toBe(AGORA)` | `"agora"` | Sim |
| 1ª publicação de rascunho existente | `posts.test.ts:28` `.toBe(AGORA)` | `"agora"` | Sim |
| Já publicado mantém | `posts.test.ts:34` `.not.toHaveProperty("publishedAt")` | campo não regravado | Sim |
| Despublicar zera | `posts.test.ts:42` `.toBeNull()` | `null` | Sim |
| `readingTime` recalculado quando `content` muda | `posts.test.ts:49` `.readingTime).toBe(3)` (401 palavras, ~200/min) | valor recalculado | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `posts.test.ts:22,28,34,42` | Done-when 1 / MCP-06 | Sim |
| `posts.test.ts:49` | Done-when 2 / MCP-06 | Sim |

- Veredito: os três ramos de `publishedAt` e o recálculo têm asserção no valor; `views: 0` ao criar é regra herdada do `createPost`, sem teste próprio (não está no Done-when).

## T7

- Arquivos: `src/lib/conteudo/livros.ts`, `src/lib/conteudo/livros.test.ts`, `src/components/admin/BookForm.tsx` (grava `livros.paraEntrada(finalValues)`), `src/app/admin/books/[id]/editar/page.tsx` (`initialValues = livros.deDocumento(book)` no lugar do mapeamento à mão).
- Gate: `npx tsc --noEmit && npx eslint src/lib/conteudo/livros.ts src/lib/conteudo/livros.test.ts src/components/admin/BookForm.tsx "src/app/admin/books/[id]/editar/page.tsx" && npx vitest run src/lib/conteudo/livros.test.ts --reporter=dot` → 3 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Ida e volta preserva campos | `livros.test.ts:28` `expect(livros.paraEntrada(valores)).toEqual(documento)` | igualdade | Sim |
| `rating` fora de 0..10 recusado | `livros.test.ts:36-37` (11 e -1) `success false` + issue em `["rating"]` | recusa no campo | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `livros.test.ts:27-28` | Done-when 1 / MCP-06 | Sim |
| `livros.test.ts:36-37` | Done-when 1 / MCP-07 | Sim |

- Veredito: cobertos; a mensagem do `rating` é a padrão do zod (o schema não define texto), por isso a asserção é no campo.

## T8

- Arquivos: `src/lib/conteudo/games.ts`, `src/lib/conteudo/games.test.ts`, `src/components/admin/GameForm.tsx`, `src/app/admin/games/[id]/editar/page.tsx` (mesmo padrão de T7).
- Gate: `npx tsc --noEmit && npx eslint src/lib/conteudo/games.ts src/lib/conteudo/games.test.ts src/components/admin/GameForm.tsx "src/app/admin/games/[id]/editar/page.tsx" && npx vitest run src/lib/conteudo/games.test.ts --reporter=dot` → 2 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Ida e volta preserva campos | `games.test.ts:29` `toEqual(documento)` | igualdade | Sim |
| `platforms` vazio recusado | `games.test.ts:38` `{ path: ["platforms"], message: "Adicione pelo menos uma plataforma" }` | mensagem do schema | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `games.test.ts:28-29` | Done-when 1 / MCP-06 | Sim |
| `games.test.ts:37-38` | Done-when 1 / MCP-07 | Sim |

- Veredito: cobertos.

## T9

- Arquivos: `src/lib/validations.ts` (`figmaFormSchema`; `optionalHttpUrlSchema` extraído do `liveUrl`/`githubUrl`, mesma regra; `contagemSchema` inteiro ≥ 0), `src/lib/conteudo/figma.ts`, `src/lib/conteudo/figma.test.ts`, `src/lib/conteudo/validacao.ts` (`primeiroErro`), `src/app/admin/figma/page.tsx` (valida com o schema ao salvar; toast com a mensagem do primeiro erro, mantendo a descrição antiga quando o erro é o título).
- Schema: título obrigatório ("Falta o título"), `url` obrigatória http(s) (reusa `requiredUrlSchema`), capa vazia ou http(s), `likes`/`users`/`order` inteiros ≥ 0.
- Gate: `npx tsc --noEmit && npx eslint src/lib/validations.ts src/lib/conteudo/validacao.ts src/lib/conteudo/figma.ts src/lib/conteudo/figma.test.ts src/app/admin/figma/page.tsx && npx vitest run src/lib/conteudo/figma.test.ts src/lib/conteudo/projetos.test.ts --reporter=dot` → 6 passed (projetos re-rodado porque `validations.ts` mudou).
- Dados atuais: lidos pela REST pública (só leitura, `visible == true`) e passados por `primeiroErro(def.schema, def.deDocumento(doc))` num teste temporário, apagado depois: figma 3/3, uses 2/2, jogando 2/2, atualmente 1/1, todos válidos. **Bloqueio parcial:** itens com `visible == false` não saem pela REST pública (regras); ficam para o contrato T40 com a service account.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Sem título recusado com "Falta o título" | `figma.test.ts:22` `expect(primeiroErro(figma.schema, valores)).toEqual({ campo: "title", mensagem: "Falta o título" })` para `""` e `"   "` | mensagem exata da página | Sim |
| Documentos atuais passam | teste temporário descrito acima (8 passed) | sem erro | Sim (parcial: só visíveis) |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `figma.test.ts:22` | Done-when 1 / MCP-07 | Sim |
| `figma.test.ts:32-33` | MCP-06 (ida e volta, matriz da camada) | Sim |

- Veredito: cobertos; leitura dos ocultos pendente para T40.

## T10

- Arquivos: `src/lib/validations.ts` (`usesItemSchema`, `usesFormSchema`), `src/lib/conteudo/uses.ts` (leitura com `normalizarItens`), `src/lib/conteudo/uses.test.ts`, `src/app/admin/uses/page.tsx` (valida a categoria já sem os itens em branco, como a página fazia antes de gravar).
- Gate: `npx tsc --noEmit && npx eslint src/lib/validations.ts src/lib/conteudo/uses.ts src/lib/conteudo/uses.test.ts src/app/admin/uses/page.tsx && npx vitest run src/lib/conteudo/uses.test.ts --reporter=dot` → 3 passed (lint do teste corrigido numa rodada).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Item sem nome recusado | `uses.test.ts:30` `{ path: ["items", 0, "name"], message: "Item sem nome" }` | recusa no item | Sim |
| Documento antigo sem `items` lê como `[]` | `uses.test.ts:38` `expect(uses.deDocumento(antigo).items).toEqual([])` | `[]` | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `uses.test.ts:29-30` | Done-when 1 / MCP-07 | Sim |
| `uses.test.ts:38` | Done-when 1 | Sim |
| `uses.test.ts:44-45` | MCP-06 (ida e volta) | Sim |

- Veredito: cobertos.

## T11

- Arquivos: `src/lib/validations.ts` (`atualmenteFormSchema`: `strictObject` com os três slots, conferido contra `CurrentlySlot` por `satisfies`; título vazio permitido, porque o dado atual tem `estudando` com título vazio e `visible: true`), `src/lib/conteudo/atualmente.ts` (`unico: true`, `site/currently`, `normalizarItemAtual`), `src/lib/conteudo/atualmente.test.ts`, `src/lib/conteudo/tipos.ts` (`ordem: Ordem | null`), `src/lib/firebase/currently.ts` (usa `normalizarItemAtual` da definição no lugar da cópia local), `src/app/admin/atualmente/page.tsx` (valida os slots ao salvar; toast com a mensagem do primeiro erro).
- Gate: `npx tsc --noEmit && npx eslint src/lib/validations.ts src/lib/conteudo/tipos.ts src/lib/conteudo/atualmente.ts src/lib/conteudo/atualmente.test.ts src/lib/firebase/currently.ts src/app/admin/atualmente/page.tsx && npx vitest run src/lib/conteudo/atualmente.test.ts --reporter=dot` → 2 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Slot fora de `lendo/ouvindo/estudando` recusado | `atualmente.test.ts:16` `{ code: "unrecognized_keys", keys: ["assistindo"] }` | recusa da chave | Sim |
| Documento ausente lê como `EMPTY_CURRENTLY` | `atualmente.test.ts:22` `toEqual({ lendo: EMPTY_CURRENTLY.lendo, ... })` | slots vazios | Sim (lacuna de precisão: `Valores` são só os slots; `updatedAt`/`exists` de `EMPTY_CURRENTLY` são estado de tela, não campo do recurso) |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `atualmente.test.ts:15-16` | Done-when 1 / MCP-10 | Sim |
| `atualmente.test.ts:22` | Done-when 1 / MCP-10 | Sim |

- Veredito: cobertos.

## T12

- Arquivos: `src/lib/validations.ts` (`jogandoFormSchema`, enum de `PLAYING_STATUS`), `src/lib/conteudo/jogando.ts`, `src/lib/conteudo/jogando.test.ts`, `src/app/admin/jogando/page.tsx` (valida ao salvar, mantém "Falta o título" e a descrição).
- Gate: `npx tsc --noEmit && npx eslint src/lib/validations.ts src/lib/conteudo/jogando.ts src/lib/conteudo/jogando.test.ts src/app/admin/jogando/page.tsx && npx vitest run src/lib/conteudo/jogando.test.ts --reporter=dot` → 2 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Status fora de `PLAYING_STATUS` recusado | `jogando.test.ts:23` `{ path: ["status"], message: "Status inválido" }` | mensagem do schema | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `jogando.test.ts:22-23` | Done-when 1 / MCP-07 | Sim |
| `jogando.test.ts:31-32` | MCP-06 (ida e volta) | Sim |

- Veredito: coberto.

## T13

- Arquivos: `src/lib/conteudo/index.ts` (`RECURSOS` com `satisfies Record<Recurso, DefinicaoRecurso<unknown, unknown>>`; `descreverRecurso` lê campos, tipos, limites e enums do schema com `z.toJSONSchema(schema, { io: "input", unrepresentable: "any" })`), `src/lib/conteudo/index.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/lib/conteudo/index.ts src/lib/conteudo/index.test.ts && npx vitest run src/lib/conteudo/index.test.ts --reporter=dot` → 2 passed. Conferido à parte (teste temporário, apagado) que os 8 recursos descrevem sem lançar.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 8 recursos registrados | `index.test.ts:10` chaves = `NOMES_DE_RECURSO`; `:12` cada `RECURSOS[nome].recurso` = nome | 8, um por nome | Sim |
| `descreverRecurso("livros")` lista `status` com `BOOK_STATUSES` | `index.test.ts:19` `toMatchObject({ type: "string", enum: [...BOOK_STATUSES] })` | enum igual à constante | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `index.test.ts:10,12` | Done-when 1 | Sim |
| `index.test.ts:19` | Done-when 1 / MCP-05 (`descrever_recurso`) | Sim |

- Veredito: cobertos.

## Fechamento do lote

- `npx tsc --noEmit` + eslint em todos os arquivos tocados (0 erros, 5 avisos anteriores) + `npx vitest run --reporter=dot` → 10 arquivos, 27 passed, 0 failed.
- Desvios do design: nenhum com `SPEC_DEVIATION`; acréscimos de contrato listados em T4.
- Pendências fora do lote: `.env.example` ainda sem `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_UID` e `MCP_PUBLIC_URL` (nenhuma task do lote cobre); conferir os itens ocultos de figma/uses/jogando contra os schemas no T40.

# Lote 2 (fases 3 e 4)

## T14

- Arquivos: `src/server/conteudo/repositorio.ts` (interface `RepositorioConteudo`, `RepositorioConteudoFirestore`, conversões puras `paraDocumento`/`paraSaida`/`paraItem`, `definicaoDe`), `src/server/conteudo/memoria.ts` (fake `RepositorioConteudoEmMemoria`, com `semear`), `src/server/conteudo/repositorio.test.ts`, `src/lib/mcp/limites.ts` (constantes do MCP num lugar só).
- Gate: `npx tsc --noEmit && npx eslint src/lib/mcp/limites.ts src/server/conteudo/repositorio.ts src/server/conteudo/memoria.ts src/server/conteudo/repositorio.test.ts && npx vitest run src/server/conteudo/repositorio.test.ts --reporter=dot` → 8 passed (uma rodada de correção: `noUncheckedIndexedAccess`).
- Decisão: `criar`/`atualizar` recebem `campos` e `derivados` separados; só os derivados trocam `AGORA` pelo carimbo (um título "agora" não vira data). Documento único (`atualmente`) grava com `set(merge)`; os demais com `update`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Conversões de ida (Date→Timestamp, carimbos) | `repositorio.test.ts:12` `toBeInstanceOf(Timestamp)` + `carimbo.isEqual(doc.createdAt)`; `:24` sem `createdAt` ao atualizar; `:31` `carimbo.isEqual(doc.publishedAt)` e `doc.title` = "agora" | createdAt/updatedAt do servidor (MCP-06) | Sim |
| Conversões de volta (datas ISO) | `repositorio.test.ts:43` `toEqual({ id, updatedAt: "2026-11-03T12:00:00.000Z", ... })` | ISO na saída (design) | Sim |
| Lista vazia sem erro | `repositorio.test.ts:66` `toEqual({ itens: [], proximoCursor: null })` | lista vazia | Sim |
| 50 por página com cursor | `repositorio.test.ts:73` `toHaveLength(50)`, `proximoCursor` = id do 50º, 2ª página `["F50"]` e cursor `null` | 50 + cursor | Sim |
| Fake cumpre a interface | `repositorio.test.ts:89` createdAt/updatedAt/publishedAt = agora; `:100` slugEmUso com `exceto` | mesma interface | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `repositorio.test.ts:12,24,31,43` | Done-when 1 / MCP-06 | Sim |
| `repositorio.test.ts:66,73` | Edge Cases (vazio, 50/página) | Sim |
| `repositorio.test.ts:89,100` | Done-when 2 / MCP-06, MCP-09 | Sim |

- Veredito: cobertos; listar/obter/gravação reais ficam para o contrato T40.

## T15

- Arquivos: `src/server/conteudo/servico.ts` (`criarServicoConteudo(repo).executar(acao, recurso, args, escopo)`), `src/server/conteudo/servico.test.ts`, `src/lib/mcp/tipos.ts` (tipos compartilhados: `TipoAcesso`, `PREFIXO_DO_SEGREDO`, `ACOES_DO_UNICO`, `EscopoDoUnico`, `SituacaoAcesso`, `AcaoAuditada`, `AcessoVisto`, `RegistroVisto`).
- Gate: `npx tsc --noEmit && npx eslint src/lib/mcp/tipos.ts src/server/conteudo/servico.ts src/server/conteudo/servico.test.ts && npx vitest run src/server/conteudo/servico.test.ts --reporter=dot` → 19 passed (uma rodada: dado de teste usava status válido).
- Decisões: escopo conferido antes de tudo; com `itemId` fixo, `listar` é FORA_DO_ESCOPO (leria outros itens) e `criar` segue só a permissão de ação; parcial mescla um nível em objeto aninhado (slot do `atualmente`); `obter` do `atualmente` ausente devolve os slots vazios; `ServicoNaoConfiguradoError` atravessa (a rota decide o 503).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| MCP-06 criar/atualizar válido grava com carimbos e devolve o item | `servico.test.ts:39` `toMatchObject({ ...livro, createdAt: AGORA, updatedAt: AGORA })` e releitura igual; `:53` `rating: 10`, `createdAt` mantido, `updatedAt` novo | item gravado | Sim |
| MCP-07 inválido: mensagem por campo, sem gravar | `servico.test.ts:67` `campos: { title: "Título obrigatório", author: "Autor(a) obrigatório" }` + lista vazia; `:79` `campos: { status: "Status inválido" }` + status mantido | mensagens do schema | Sim |
| MCP-08 NAO_ENCONTRADO | `servico.test.ts:90` obter/atualizar/apagar `codigo: "NAO_ENCONTRADO"` | código exato | Sim |
| MCP-09 SLUG_EM_USO | `servico.test.ts:103` criar, `:112` atualizar; sem gravar | código exato | Sim |
| MCP-10 atualmente | `servico.test.ts:126` obter/atualizar sem id; `:136` listar/criar/apagar `ACAO_INVALIDA` | código exato | Sim |
| UNICO-04 FORA_DO_ESCOPO sem ler nem gravar | `servico.test.ts:151` 4 casos `codigo: "FORA_DO_ESCOPO"` + 6 espiões `not.toHaveBeenCalled()` + dado intacto; `:169` dentro do escopo funciona | código exato, espião | Sim |
| FALHA_EXTERNA | `servico.test.ts:180` `codigo: "FALHA_EXTERNA"`, mensagem própria | sem stack | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `servico.test.ts:39,53` | MCP-06 | Sim |
| `servico.test.ts:67,79` | MCP-07 | Sim |
| `servico.test.ts:90` | MCP-08 | Sim |
| `servico.test.ts:103,112` | MCP-09 | Sim |
| `servico.test.ts:126,136` | MCP-10 | Sim |
| `servico.test.ts:151,169` | UNICO-04 / Done-when 2 | Sim |
| `servico.test.ts:180` | Edge Case FALHA_EXTERNA | Sim |

- Veredito: um teste por AC e por código.

## T16

- Arquivos: `src/server/imagem.ts` (`subirImagem(entrada, { fetch, env })`), `src/server/imagem.test.ts`, `src/lib/imagem.ts` (`TIPOS_DE_IMAGEM`, `ehTipoDeImagem`, `MENSAGEM_TIPO_NAO_SUPORTADO`), `src/lib/cloudinary.ts` (usa a constante compartilhada no lugar de `ALLOWED_TYPES`).
- Gate: `npx tsc --noEmit && npx eslint src/lib/imagem.ts src/lib/cloudinary.ts src/server/imagem.ts src/server/imagem.test.ts && npx vitest run src/server/imagem.test.ts --reporter=dot` → 7 passed (uma rodada: flag `s` de regex fora do target).
- Decisões: base64 aceita data URI (o tipo sai dele) ou `tipo` separado; tipo só é conferido no base64 (por URL quem decide é o Cloudinary); URL não http(s) → `VALIDACAO`; Cloudinary sem env → `FALHA_EXTERNA`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| IMG-01 | `imagem.test.ts:31` `toEqual({ url, largura: 800, altura: 1200, bytes: 123456 })`, `file` = a URL, endpoint `/v1_1/nuvem/image/upload` | campos exatos | Sim |
| IMG-02 | `imagem.test.ts:43` 3 MB exatos aceitos, `file` = `data:image/png;base64,...` | até 3 MB | Sim |
| IMG-03 | `imagem.test.ts:53` `codigo: "IMAGEM_GRANDE"`, mensagem contém "url", fetch não chamado | código exato | Sim |
| IMG-04 | `imagem.test.ts:66` `codigo: "TIPO_NAO_SUPORTADO"` | código exato | Sim |
| IMG-05 | `imagem.test.ts:75` os dois / nenhum → `ACAO_INVALIDA` | código exato | Sim |
| Falha do Cloudinary | `imagem.test.ts:87` `codigo: "FALHA_EXTERNA"`, `message: "O Cloudinary recusou a imagem: Resource not found"` | FALHA_EXTERNA | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `imagem.test.ts:31,43,53,66,75` | IMG-01..05 | Sim |
| `imagem.test.ts:87` | Done-when 1 / Edge Case | Sim |

- Veredito: um teste por AC.

## T17

- Arquivos: `src/server/mcp/acessos/segredo.ts`, `src/server/mcp/acessos/segredo.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/server/mcp/acessos/segredo.ts src/server/mcp/acessos/segredo.test.ts && npx vitest run src/server/mcp/acessos/segredo.test.ts --reporter=dot` → 4 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| `pf_pk_`/`pf_uu_` + 43 base64url | `segredo.test.ts:8` `toMatch(/^pf_pk_[A-Za-z0-9_-]{43}$/)` e `pf_uu_` | formato exato | Sim |
| sha256 hex de 64; prefixo = tipo + 4 | `segredo.test.ts:17` hash = `createHash("sha256")...digest("hex")`, `/^[0-9a-f]{64}$/`, prefixo `/^pf_pk_.{4}$/` | exato | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `segredo.test.ts:8` | CHAVE-01, UNICO-01 | Sim |
| `segredo.test.ts:17` | CHAVE-03 | Sim |
| `segredo.test.ts:27` | Edge Case (dois cliques criam chaves distintas) | Sim |

- Veredito: cobertos.

## T18

- Arquivos: `src/server/mcp/acessos/situacao.ts`, `src/server/mcp/acessos/tipos.ts` (`Acesso`, `RegistroAuditoria` com `Date`), `src/server/mcp/acessos/situacao.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/server/mcp/acessos/tipos.ts src/server/mcp/acessos/situacao.ts src/server/mcp/acessos/situacao.test.ts && npx vitest run src/server/mcp/acessos/situacao.test.ts --reporter=dot` → 5 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Uma por situação | `situacao.test.ts:11` ativo, `:15` revogado (com encerrado e vencido), `:19` encerrado (com vencido), `:23` vencido | precedência revogado > encerrado > vencido > ativo | Sim |
| Limite exato de `expiraEm` | `situacao.test.ts:27` `-1 ms` → "ativo"; instante exato → "vencido" | vence em `expiraEm` | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `situacao.test.ts:11-27` | ACESSOS-01, MCP-11, UNICO-02 / Done-when 1 | Sim |

- Veredito: cobertos.

## T19

- Arquivos: `src/server/mcp/acessos/repositorio.ts` (interface `RepositorioAcessos`, `RepositorioAcessosFirestore`, conversões puras, `idDoLimite`, `expiraEmDoLimite`, transação de `consumirLimite`), `src/server/mcp/acessos/memoria.ts` (fake `RepositorioAcessosEmMemoria`, expõe `acessos`, `auditoria`, `contadores`), `src/server/mcp/acessos/repositorio.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/server/mcp/acessos/repositorio.ts src/server/mcp/acessos/memoria.ts src/server/mcp/acessos/repositorio.test.ts && npx vitest run src/server/mcp/acessos/repositorio.test.ts --reporter=dot` → 5 passed.
- Decisão: `contarPessoaisAtivas` filtra `tipo == pessoal` e `revogadoEm == null` no Firestore e aplica `situacao` em memória (sem índice composto).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Conversões puras | `repositorio.test.ts:33` `acessoDeDoc(id, acessoParaDoc(a))` = `a`, Timestamp, sem `id` no doc; `:42` chaves do registro = `[acao, acessoId, em, itemId, prefixo, recurso]` | AUDIT-01/03 | Sim |
| Limite por minuto (id, expiraEm) | `repositorio.test.ts:59` `abc_<minuto>`, `expiraEm` = "2026-11-03T14:11:00.000Z" | MCP-14 | Sim |
| Fake cumpre a interface, inclui limite | `repositorio.test.ts:71` 120 aceitas, 121ª `false`, minuto seguinte `true`; `:84` conta 1 ativa | MCP-14, ACESSOS-06 | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `repositorio.test.ts:33` | Done-when 1 | Sim |
| `repositorio.test.ts:42` | AUDIT-01, AUDIT-03 | Sim |
| `repositorio.test.ts:59,71` | MCP-14 | Sim |
| `repositorio.test.ts:84` | ACESSOS-06 (base da contagem) | Sim |

- Veredito: cobertos; transação real no contrato T40.

## T20

- Arquivos: `src/server/mcp/acessos/servico.ts` (`criarServicoAcessos(repo, relogio)`), `src/server/mcp/acessos/servico.test.ts`, `src/lib/mcp/esquemas.ts` (`novaChaveSchema`, `novoUnicoSchema`, reutilizáveis no formulário), `src/lib/conteudo/tipos.ts` (código `ACESSO_INATIVO`).
- Gate: `npx tsc --noEmit && npx eslint src/lib/conteudo/tipos.ts src/lib/mcp/esquemas.ts src/server/mcp/acessos/servico.ts src/server/mcp/acessos/servico.test.ts && npx vitest run src/server/mcp/acessos/servico.test.ts --reporter=dot` → 29 passed (uma rodada: aviso de lint no teste).
- SPEC_DEVIATION: código novo `ACESSO_INATIVO` (`src/lib/conteudo/tipos.ts`) para revogar/encerrar acesso já inativo (a spec pede 409 sem nomear o código). Encerrar chave pessoal usa `ACAO_INVALIDA`; T26-T28 mapeiam os dois para 409.
- Decisões: auditoria de criar/revogar/encerrar/apagar com `recurso`/`itemId` nulos, exceto `unico_criado` (leva o escopo); `ultimoUsoEm` grava quando passaram mais de 60 s (design: "> 60 s"); o limite é conferido antes do `ultimoUsoEm`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| CHAVE-01 | `servico.test.ts:25` segredo `/^pf_pk_[A-Za-z0-9_-]{43}$/`, expiraEm = +30 dias; `:47` nome vazio, 61 caracteres e validade 7 → `VALIDACAO` por campo | 1..60, 1/30/90 | Sim |
| CHAVE-02 | `servico.test.ts:39` expiraEm = +90 dias | 90 | Sim |
| CHAVE-03 | `servico.test.ts:60` id = `hashDoSegredo(segredo)`, prefixo = 10 primeiros, segredo ausente do banco e da listagem | só hash + prefixo | Sim |
| ACESSOS-01 | `servico.test.ts:104` pessoais e únicos separados, situação "ativo"/"vencido" | derivada das datas | Sim |
| ACESSOS-02 | `servico.test.ts:116` `revogadoEm` gravado, `autenticar` → "invalido"; `:127` inativo `ACESSO_INATIVO`, inexistente `NAO_ENCONTRADO` | 401 na seguinte | Sim |
| ACESSOS-03 | `servico.test.ts:136` `codigo: "ACESSO_ATIVO"`, documento mantido | código exato | Sim |
| ACESSOS-04 | `servico.test.ts:144` documento removido; auditoria `["chave_criada","revogado","apagado"]` | auditoria mantida | Sim |
| ACESSOS-06 | `servico.test.ts:159` 11ª → `LIMITE_DE_CHAVES`, 10 guardadas | código exato | Sim |
| UNICO-01 | `servico.test.ts:74` `/^pf_uu_.../`, escopo e tarefa; `:88` sem ação, com apagar, tarefa vazia e 501 → `VALIDACAO` por campo | 1..500, ao menos uma ação | Sim |
| UNICO-02 | `servico.test.ts:74` `expiraEm: "2026-11-03T16:00:00.000Z"` | 2 h | Sim |
| UNICO-05 | `servico.test.ts:215` `encerradoEm` gravado e `autenticar` → "invalido" | 401 nas seguintes | Sim |
| UNICO-06 | `servico.test.ts:169` situação "encerrado", `encerradoEm` = agora; `:179` pessoal → `ACAO_INVALIDA` | encerradoEm | Sim |
| MCP-11 | `servico.test.ts:197` ausente, inexistente, sem Bearer; `:207` vencida; `:116` revogada; `:215` encerrada → `{ resultado: "invalido" }` | mesmo resultado nos quatro | Sim |
| MCP-13 | `servico.test.ts:227` 14:00:00 gravado, +30 s mantém, +61 s grava 14:01:01 | 1×/min | Sim |
| MCP-14 | `servico.test.ts:244` 120 "ok", 121ª `{ resultado: "limite" }`, minuto seguinte "ok" | 429 até o minuto seguinte | Sim |
| AUDIT-01, AUDIT-03 | `servico.test.ts:258` registros exatos `{ em, acessoId, prefixo, acao, recurso, itemId }` para chave_criada, unico_criado, revogado, atualizar, encerrado; JSON sem os segredos | campos exatos | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `servico.test.ts:25,39,47,60` | CHAVE-01..03 | Sim |
| `servico.test.ts:74,88` | UNICO-01, UNICO-02 | Sim |
| `servico.test.ts:104-179` | ACESSOS-01..04, ACESSOS-06, UNICO-06 | Sim |
| `servico.test.ts:188-244` | MCP-11, MCP-13, MCP-14, UNICO-05 | Sim |
| `servico.test.ts:258` | AUDIT-01, AUDIT-03 | Sim |
| `servico.test.ts:280` | AUDIT-02 (20 mais recentes, base da rota T29) | Sim |

- Veredito: um teste por AC listado; auditoria sem segredo nem dados do item.

## T21

- Arquivos: `src/lib/mcp/conexao.ts` (`CLIENTES_MCP`, `nomeDoServidor`, `configuracaoDoCliente`, `promptDeUsoUnico`), `src/lib/mcp/conexao.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/lib/mcp/conexao.ts src/lib/mcp/conexao.test.ts && npx vitest run src/lib/mcp/conexao.test.ts --reporter=dot` → 12 passed.
- SPEC_DEVIATION (textos do mockup ajustados): (1) Claude Desktop usa `env.AUTH_HEADER` e `--header "Authorization:${AUTH_HEADER}"`, formato do README do `mcp-remote` (espaço dentro de `args` quebra no Windows); (2) o `curl` do prompt chama `tools/call` (`descrever_recurso`), como pede UNICO-01, no lugar do `tools/list` do mockup; (3) `promptDeUsoUnico` recebe `itemId?` e não recebe `venceEm` (o texto do mockup diz "2 h"; hora formatada no servidor sairia em UTC).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Uma configuração por cliente com URL e Bearer | `conexao.test.ts:10` os 6 nomes; `:21` cada um contém `URL_MCP` e `Bearer pf_pk_...` | 6 clientes (CHAVE-01) | Sim |
| Prompt: URL, Bearer | `conexao.test.ts:44` `Servidor: <url>`, `Authorization: Bearer pf_uu_...` | UNICO-01 | Sim |
| Prompt: `claude mcp add` | `conexao.test.ts:49` comando literal | UNICO-01 | Sim |
| Prompt: `curl` com os dois Accept, `tools/call` | `conexao.test.ts:55` `-H "Accept: application/json, text/event-stream"`, `"method":"tools/call"` | UNICO-01 | Sim |
| Prompt: escopo e tarefa | `conexao.test.ts:61` `Escopo: games, ações ler, criar.`, `Tarefa: ...` | UNICO-01 | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `conexao.test.ts:10,21,28` | CHAVE-01 | Sim |
| `conexao.test.ts:44,49,55,61` | UNICO-01 | Sim |

- Veredito: cobertos.

## Fechamento do lote 2

- `npx vitest run --reporter=dot` → 18 arquivos, 116 passed, 0 failed (89 do lote 2).
- Pendências: `.env.example` ainda sem as env do servidor (herdado do lote 1); mapear `ACESSO_INATIVO` e `ACAO_INVALIDA` (encerrar pessoal) para 409 nas rotas T26-T28.

## T22

- Arquivos: `src/server/mcp/servidor.ts` (`ferramentasDoAcesso`, `criarServidor`, `atenderMcp`), `src/server/mcp/instrucoes.ts`, `src/server/mcp/dependencias.ts` (fábrica Firestore das rotas), `src/server/http.ts` (mapeamento de erro único), `src/server/mcp/servidor.test.ts`. Instalado `@modelcontextprotocol/server@2.4.0`.
- Gate: `npx tsc --noEmit && npx eslint <5 arquivos> && npx vitest run src/server/mcp/servidor.test.ts --reporter=dot` → 11 passed.
- SDK conferido no d.ts: `registerTool(nome, { description, inputSchema: z.object(...) }, cb)`; o transporte stateless aceita `tools/list` e `tools/call` sem `initialize`. O 2.4 também traz `createMcpHandler` (era 2026-07-28 + fallback legado); ficou o `WebStandardStreamableHTTPServerTransport` do design (`enableJsonResponse: true`), porque o fallback legado do handler responde em SSE e o cliente moderno recua para `initialize`. O `acesso` é fechado no servidor por requisição (sem `authInfo`).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| MCP-04 sem sessão | `servidor.test.ts:94` `initialize` 200 com `serverInfo.name "portfolio"` | stateless | Sim |
| MCP-15 instructions | `servidor.test.ts:94` contém os 8 recursos, "chame descrever_recurso", "chame subir_imagem", "YYYY-MM-DD" | instructions | Sim |
| MCP-05 pessoal = 7 | `servidor.test.ts:129` `toEqual([apagar, atualizar, criar, descrever_recurso, listar, obter, subir_imagem])` | 7 | Sim |
| UNICO-03 | `servidor.test.ts:137,145,153` listas exatas por ações; nenhuma com `apagar` | concedidas + descrever + concluir (+ subir_imagem com criar/editar) | Sim |
| Erro de domínio `isError` | `servidor.test.ts:182` `/^VALIDACAO: /` e `"\ntitle: Título obrigatório"`, nada gravado; `:199` `/^NAO_ENCONTRADO: /` | MCP-07, MCP-08 | Sim |
| AUDIT-01 escrita | `servidor.test.ts:163` registro `{ acessoId, prefixo, acao: "criar", recurso: "livros", itemId }`; `:209` `subir_imagem` com recurso/itemId null; `:182` falha não audita | só no sucesso | Sim |
| UNICO-05 | `servidor.test.ts:225` `encerradoEm` = agora e `autenticar` → `{ resultado: "invalido" }` | 401 nas seguintes | Sim |

Check C

| Asserção | Mapeia para | Manter |
| --- | --- | --- |
| `servidor.test.ts:94,113` | MCP-04, MCP-15 (texto do único) | Sim |
| `servidor.test.ts:129-153` | MCP-05, UNICO-03 | Sim |
| `servidor.test.ts:163-209` | MCP-06/07/08 na borda do protocolo, AUDIT-01 | Sim |
| `servidor.test.ts:225` | UNICO-05 | Sim |

- Veredito: ferramentas por escopo, erro legível e auditoria cobertos.

## T23

- Arquivos: `src/app/api/mcp/route.ts`, `src/app/api/mcp/route.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint <2 arquivos> && npx vitest run src/app/api/mcp/route.test.ts --reporter=dot` → 8 passed.
- Injeção: `vi.mock("@/server/mcp/dependencias")` com estado `vi.hoisted` (route.ts só pode exportar handlers e config do Next; nada de setter).
- 413 confere `Content-Length` e o corpo lido (`arrayBuffer`), antes de autenticar; o transporte recebe uma cópia da requisição.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 200 | `route.test.ts:56` status 200 e `result.tools` com 7 | MCP-04 | Sim |
| 401 mesma mensagem | `route.test.ts:66` sem header, inexistente, revogada, vencida, encerrada → 401 e `toEqual({ codigo: "NAO_AUTENTICADO", mensagem: "Acesso inválido ou expirado." })` | MCP-11 | Sim |
| 405 | `route.test.ts:134` GET e DELETE → 405, `Allow: POST` | MCP-12 | Sim |
| 413 | `route.test.ts:88` Content-Length 4 MB + 1; `:97` corpo lido 4 MB + 1 | Edge Case 413 | Sim |
| 429 | `route.test.ts:105` 120 × 200, 121ª 429 `LIMITE_DE_CHAMADAS`, minuto seguinte 200 | MCP-14 | Sim |
| 503 | `route.test.ts:120` `toEqual({ codigo: "NAO_CONFIGURADO", mensagem: "Servidor MCP não configurado." })` | Edge Case 503 | Sim |

Check C: todas as asserções mapeiam para MCP-04, 11, 12, 14 e Edge Cases (413, 503). Manter.

- Veredito: um teste por status.

## T24

- Arquivos: `src/server/admin-auth.ts` (`exigirAdmin(req, verificarIdToken, env)` → `{ uid } | { resposta }`), `src/server/admin-auth.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint <2 arquivos> && npx vitest run src/server/admin-auth.test.ts --reporter=dot` → 6 passed.
- `ServicoNaoConfiguradoError` sobe (vira 503 na casca), não 401. Não reusa `isAdminUid` (lê `NEXT_PUBLIC_ADMIN_UID` no import do cliente); mesma comparação com `ADMIN_UID` do servidor e fallback.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| Sem token 401 | `admin-auth.test.ts:27` status 401, `NAO_AUTENTICADO` | ACESSOS-05 | Sim |
| Token inválido 401 | `admin-auth.test.ts:34` | ACESSOS-05 | Sim |
| Outro uid 403 | `admin-auth.test.ts:41` status 403, `SEM_PERMISSAO` | ACESSOS-05 | Sim |
| Dono passa | `admin-auth.test.ts:48` `toEqual({ uid })`; `:52` fallback `NEXT_PUBLIC_ADMIN_UID` | uid do dono | Sim |

Check C: `:58` mapeia para Edge Case 503 nas rotas de admin. Manter todos.

- Veredito: cobertos.

## T25

- Arquivos: `src/app/api/admin/mcp/acessos/route.ts`, `src/server/mcp/rota-admin.ts` (`rotaDeAdmin`: dependências + guarda + erro; `enderecoDoMcp`: `MCP_PUBLIC_URL` ou origem + `/api/mcp`), `src/server/mcp/dependencias.fake.ts` (fakes das rotas de gestão), `src/app/api/admin/mcp/acessos/route.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint <4 arquivos> && npx vitest run src/app/api/admin/mcp/acessos/route.test.ts --reporter=dot` → 11 passed.
- Validação da entrada: o serviço aplica `novaChaveSchema`/`novoUnicoSchema`; `tipo` fora de `pessoal|unico` → 400 com `campos.tipo`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 200 lista | `route.test.ts:42` `pessoais` e `unicos` separados, situação "ativo" | ACESSOS-01 | Sim |
| 201 pessoal | `route.test.ts:57` segredo `/^pf_pk_[A-Za-z0-9_-]{43}$/`, `expiraEm` +90 dias, sem `prompt` | CHAVE-01, CHAVE-02 | Sim |
| 201 único | `route.test.ts:71` `/^pf_uu_.../`, escopo, `expiraEm` +2 h, prompt com URL, Bearer e tarefa | UNICO-01 | Sim |
| 400 por campo | `route.test.ts:92` `campos` nome e validadeDias; `:104` acoes e tarefa; `:114` tipo | CHAVE-01, UNICO-01 | Sim |
| 401 / 403 | `route.test.ts:134` sem token e inválido; `:144` outro uid 403 sem gravar | ACESSOS-05 | Sim |
| 409 | `route.test.ts:121` 11ª → `LIMITE_DE_CHAVES` | ACESSOS-06 | Sim |
| 503 | `route.test.ts:152` `NAO_CONFIGURADO` + mensagem | Edge Case | Sim |

Check C: todas mapeiam aos ACs acima. Manter.

- Veredito: cobertos.

## T26

- Arquivos: `src/app/api/admin/mcp/acessos/[id]/route.ts` (`params` é Promise no Next 16), `.../[id]/route.test.ts`.
- Gate (T26-T28 juntos): `npx tsc --noEmit && npx eslint <pasta [id]> && npx vitest run <3 testes [id]> --reporter=dot` → 10 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 204 + auditoria mantida | `[id]/route.test.ts:25` 204, documento removido, auditoria `["chave_criada","revogado","apagado"]` | ACESSOS-04 | Sim |
| 404 | `[id]/route.test.ts:38` `NAO_ENCONTRADO` | acesso inexistente = 404 | Sim |
| 409 | `[id]/route.test.ts:45` `ACESSO_ATIVO`, documento mantido | ACESSOS-03 | Sim |

Check C: mapeiam a ACESSOS-03/04 e ao cenário 404. Manter.

## T27

- Arquivos: `src/app/api/admin/mcp/acessos/[id]/revogar/route.ts`, `.../revogar/route.test.ts`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 200 e 401 seguinte | `revogar/route.test.ts:25` `situacao: "revogado"`, `revogadoEm` = agora; `autenticar` → `invalido` | ACESSOS-02 | Sim |
| 404 | `revogar/route.test.ts:39` | 404 | Sim |
| 409 já inativo | `revogar/route.test.ts:46` `ACESSO_INATIVO` | 409 | Sim |

Check C: mapeiam a ACESSOS-02 e aos cenários 404/409. Manter.

## T28

- Arquivos: `src/app/api/admin/mcp/acessos/[id]/encerrar/route.ts`, `.../encerrar/route.test.ts`.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 200 | `encerrar/route.test.ts:28` `situacao: "encerrado"`, `encerradoEm` = agora | UNICO-06 | Sim |
| 404 | `encerrar/route.test.ts:41` | 404 | Sim |
| 409 inativo | `encerrar/route.test.ts:48` `ACESSO_INATIVO` | 409 | Sim |
| 409 pessoal | `encerrar/route.test.ts:58` `ACAO_INVALIDA` | 409 | Sim |

Check C: mapeiam a UNICO-06 e aos cenários 404/409. Manter.

## T29

- Arquivos: `src/app/api/admin/mcp/atividade/route.ts`, `.../atividade/route.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint <pasta atividade> && npx vitest run src/app/api/admin/mcp/atividade --reporter=dot` → 2 passed.

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| 25 → 20 decrescente | `atividade/route.test.ts:22` length 20, primeiro `14:00:24`, último `14:00:05`, ordem decrescente | AUDIT-02 | Sim |
| vazio → [] | `atividade/route.test.ts:38` `toEqual([])` | lista vazia 200 | Sim |

Check C: mapeiam a AUDIT-02 e ao cenário de lista vazia. Manter.

## Fechamento do lote 3

- `npx vitest run --reporter=dot` → 26 arquivos, 164 passed, 0 failed (48 do lote 3).
- Contrato de erro de todas as rotas: `{ codigo, mensagem, campos? }` (`src/server/http.ts`). Códigos só de HTTP: `NAO_AUTENTICADO` (401), `SEM_PERMISSAO` (403), `LIMITE_DE_CHAMADAS` (429), `CORPO_GRANDE` (413), `METODO_NAO_PERMITIDO` (405), `NAO_CONFIGURADO` (503). Erro não previsto vira 503 `FALHA_EXTERNA` com mensagem própria e log no servidor.
- Pendências: `.env.example` sem as env do servidor (herdado); 401 do `/api/mcp` sai sem `WWW-Authenticate` (o spec não pede; conferir no e2e T41 se o Claude Code tenta OAuth).

## T30

- Arquivos: `src/lib/admin-api/mcp.ts`, `src/lib/admin-api/mcp.test.ts`.
- Gate: `npx tsc --noEmit && npx eslint src/lib/admin-api && npx vitest run src/lib/admin-api/mcp.test.ts --reporter=dot` → 8 passed (1 rodada de correção: `calls[0]!` por `noUncheckedIndexedAccess`).

Check A

| Critério | Evidência | Resultado do spec | Coberto |
| --- | --- | --- | --- |
| ID token no header | `mcp.test.ts:32` `Authorization: Bearer token-do-admin`, caminho `/api/admin/mcp/acessos` | ACESSOS-01 / ACESSOS-05 | Sim |
| Corpo da criação | `mcp.test.ts:44` `{ tipo: "pessoal", nome, validadeDias }` | CHAVE-01 | Sim |
| 400 → ErroApi fiel | `mcp.test.ts:58` status, `codigo`, `message` e `campos` do servidor | erro por campo | Sim |
| 409 código estável | `mcp.test.ts:75` `ACESSO_INATIVO` | 409 | Sim |
| Corpo de erro não JSON | `mcp.test.ts:87` `Erro 502.` | falha de dependência | Sim |
| 204 sem corpo | `mcp.test.ts:99` resolve `undefined`, caminho `/acessos/abc` | ACESSOS-04 | Sim |
| Sem usuário | `mcp.test.ts:106` 401 sem chamar a rede | ACESSOS-05 | Sim |
| Falha de rede | `mcp.test.ts:115` `SEM_CONEXAO` | falha de dependência | Sim |

Check C: cada teste mapeia ao "Done when" de T30 (erro HTTP vira `ErroApi` com a mensagem do servidor) ou a um cenário da spec. Manter.

## T31

- Arquivo: `src/components/admin/mcp/useAcessosMcp.ts`. Gate: tsc + eslint verdes.
- Cenários: carregando por bloco (só a primeira carga; recarga mantém o dado na tela), erro por bloco com a mensagem do servidor, `recarregarAcessos` / `recarregarAtividade` separados, `acoes` (criar chave, criar único, revogar, encerrar, apagar) que recarregam listas e atividade. Constantes `SEM_ACESSOS` / `SEM_REGISTROS` estáveis, blocos em `useMemo`.

## T32

- Arquivo: `src/components/admin/AdminSidebar.tsx` (item "MCP", ícone `Plug`, `/admin/mcp`). Gate: tsc + eslint verdes.
- Cenários: item visível; ativo por `pathname.startsWith("/admin/mcp")`.

## T33

- Arquivos: `src/components/admin/mcp/ContextoMcp.tsx`, `CaixaDeCopia.tsx`, `useEnderecoMcp.ts`. Gate: tsc + eslint verdes.
- Cenários: endereço `${origin}/api/mcp` lido no cliente (`useSyncExternalStore`, vazio no servidor → esqueleto); Copiar com `navigator.clipboard.writeText`, sem permissão seleciona o texto; botão vira "Copiado" por 2 s. Capacidades com números de `limites.ts` e `NOMES_DE_RECURSO`.

## T34

- Arquivos: `src/components/admin/mcp/ChavePessoalForm.tsx`, `erros.ts`, `formatos.ts`; `src/components/selo/tons.ts` (tom `perigo` novo, para "Revogado"). Gate: tsc + eslint verdes.
- Cenários: 6 clientes de `CLIENTES_MCP` (`aria-pressed`); nome `maxLength` 60 + contador; validade 1/30/90 (padrão 90); "Vence em" recalcula; envio trava o fieldset e o botão ("Gerando"); 400 com `campos` → erro ao lado de nome/validade; outro erro (409 `LIMITE_DE_CHAVES`, 503) → toast com a mensagem do servidor; 10 chaves ativas → aviso e botão desabilitado.

## T35

- Arquivos: `src/components/admin/mcp/UsoUnicoForm.tsx`, `src/lib/firebase/itens.ts` (id e título dos itens do recurso, pela definição de `RECURSOS`). Gate: tsc + eslint verdes.
- Cenários: recurso de `NOMES_DE_RECURSO` com rótulo; item opcional com busca (Popover + Command): carregando (esqueleto), erro + "Tentar de novo", "Nada encontrado", "Todos os itens de X"; documento único (`atualmente`) mostra "Documento único" desabilitado; ações de `ACOES_DO_UNICO`, "Apagar" desabilitado com tooltip "Apagar só com chave pessoal"; sem ação marcada o botão desabilita; tarefa `maxLength` 500 + contador; 400 por campo (recurso, itemId, acoes, tarefa); envio trava tudo.

## T36

- Arquivo: `src/components/admin/mcp/SegredoDialog.tsx`. Gate: tsc + eslint verdes.
- Cenários: pessoal → "Chave criada", configuração do cliente escolhido (`configuracaoDoCliente`) + "Só a chave", aviso "Esta chave não será mostrada de novo."; único → "Prompt pronto" com o `prompt` do servidor (fallback `promptDeUsoUnico`), "encerra às HH:mm", aviso "O acesso não será mostrado de novo."; "Já copiei", X e Esc fecham e a página zera o segredo do estado.

## T37

- Arquivos: `src/components/admin/mcp/TabelaAcessos.tsx`, `EstadoBloco.tsx`, `ConfirmarAcao.tsx`. Gate: tsc + eslint verdes.
- Cenários: esqueleto; erro "Não foi possível carregar as chaves." + mensagem + "Tentar de novo"; vazio com "Gerar chave" / "Criar acesso único" (troca a aba e rola até o formulário); busca (nome, tarefa ou prefixo) sem resultado → "Nada encontrado para "x"" + "Limpar busca"; paginação de 10 com "1 a 10 de N" e "Página x de y"; "Nunca usado"; selo por situação; ativo pessoal → Ban "Revogar", ativo único → CircleStop "Encerrar", inativo → Trash2 destrutivo "Apagar", todos com tooltip, `aria-label` e dialog de confirmação (botão com estado de envio, Cancelar travado enquanto envia); sucesso → toast e recarga; erro (409 `ACESSO_ATIVO`/`ACESSO_INATIVO`) → toast com a mensagem do servidor. `EstadoListagem` não serve (spinner, texto fixo, ocupa a grade): estados compostos em `EstadoBloco`.

## T38

- Arquivo: `src/components/admin/mcp/AtividadeRecente.tsx`. Gate: tsc + eslint verdes.
- Cenários: esqueleto; erro com mensagem + "Tentar de novo"; vazio "Nenhuma ação ainda"; linha "ação · recurso · item" (sem recurso/item mostra só a ação), prefixo e quando (relativo abaixo de 24 h, senão data e hora).

## T39

- Arquivo: `src/app/admin/mcp/page.tsx`. Gate: `npx tsc --noEmit && npx eslint src/app/admin/mcp/page.tsx src/components/admin/mcp` verde.
- Cenários: abas Chave pessoal / Uso único (controladas); grade de 2 colunas a partir de `lg`, 1 coluna abaixo; tabelas com `overflow-x-auto`; criar → SegredoDialog; limite de 10 chaves ativas calculado da lista. Conferência visual no dev fica com o orquestrador.

## Correções da revisão

1. Feito: `errosPorCampo` e `validarOuFalhar(resultado, mensagem)` em `src/lib/conteudo/validacao.ts`; os dois serviços importam (cada um mantém a própria mensagem).
2. Feito: `BYTES_POR_MB` e `emMegabytes()` em `limites.ts`; imagem, servidor, rota `/api/mcp`, instruções e ContextoMcp montam o texto das constantes; `INTERVALO_DO_ULTIMO_USO_MS = MS_POR_MINUTO`; comentário da atividade cita `REGISTROS_DA_ATIVIDADE`.
3. Feito: `currently.ts` usa `atualmente.colecao`/`idDoDocumentoUnico`; `posts.ts` usa `posts.colecao`.
4. Feito: `nomeDoServidor` usa `slugify` com fallback; a diferença (pontuação sumir em vez de virar hífen) não muda a validade do nome, documentada no comentário. `NOME_DO_SERVIDOR_MCP` em `src/lib/mcp/conexao.ts`, usado pelo servidor.
5. Feito: `rotulo` em `DefinicaoRecurso` e nas 8 definições; `ROTULO_DO_RECURSO` deriva de `RECURSOS`.
6. Feito: `ROTULO_DA_ACAO_DO_UNICO` + `rotuloDasAcoes()` em `formatos.ts`, usados em UsoUnicoForm, TabelaAcessos e SegredoDialog.
7. Feito: `MENSAGEM_FALHA_DO_BANCO` exportada de `http.ts` e usada no serviço de conteúdo e no servidor MCP; `console.error` do erro original antes do `FALHA_EXTERNA`.
8. Feito: `tokenBearer()` em `src/lib/mcp/conexao.ts` (o `http.ts` puxa o firebase-admin, que o serviço de acessos não precisa).
9. Feito: `urlDeUpload(nuvem)` em `src/lib/imagem.ts`, usada no admin e no servidor.
10. Feito: `CAMINHO_DO_MCP` em `src/lib/mcp/conexao.ts`; `GET /api/admin/mcp/acessos` e o 201 devolvem `enderecoMcp`; tela lê do servidor, `useEnderecoMcp` removido; tipos, hook e testes da rota e do cliente atualizados (inclui o caso sem `MCP_PUBLIC_URL`).
11. Feito: SegredoDialog sem fallback (sem `prompt` mostra erro); montagem do prompt e despacho por `tipo` em `criarAcesso()` de `rota-admin.ts`; mensagem do tipo inválido montada de `TIPOS_DE_ACESSO`.
12. Feito: `mensagemLimiteDeChaves()` em `limites.ts`, usada no form e no serviço.
13. Feito: `useFonte.ts` próprio (troca de fonte volta a carregando), `useItensDoRecurso.ts` sobre ele, `mensagemDoErro` reusada; UsoUnicoForm usa `EsqueletoBloco`/`ErroBloco`; `Aviso.tsx` próprio, usado no SegredoDialog e no aviso de limite do ChavePessoalForm.
14. Feito: `FERRAMENTAS` espalha `ACOES_DE_CONTEUDO`, ferramentas por ação lidas de `PERMISSAO_DA_ACAO`; `conteudo()` tipado com `Recurso`/`ArgumentosConteudo`. Testes de tools/list inalterados e verdes.
15. Feito: `NovaChaveEntrada`/`NovoUnicoEntrada` = `z.output` dos schemas (`NovaChaveValida`/`NovoUnicoValido`); `AcessoCriado`, `RespostaDaLista`, `RespostaDaCriacao` em `src/lib/mcp/tipos.ts`, sem import de `src/server` no cliente.
16. Feito: "Vence em" usa `useHoje()` (`useSyncExternalStore`, meia-noite de hoje como snapshot; `null` no servidor).
17. Feito: `LIMITES_FIGMA/USES/ATUALMENTE/JOGANDO` e `MENSAGEM_URL_HTTP` sem travessão em `validations.ts`; páginas com `maxLength` + `Contador` (`src/components/admin/Contador.tsx`, no tom do `n/max` do ProjectForm); gêneros com `maxTags`.
18. Feito: `ehObjetoSimples` único em `src/lib/conteudo/leitura.ts` (regra do protótipo, a mais estrita; a mescla do serviço recebe JSON e definições, então não muda).
19. Feito: `definicaoDe` em `src/lib/conteudo/index.ts`; repositório, memória e serviço importam de lá.
20. Feito: `import "server-only"` em `dependencias.fake.ts`.
21. Feito: documento único derivado de `RECURSOS_DE_DOCUMENTO_UNICO`; formatos de imagem de `ROTULO_DO_TIPO_DE_IMAGEM` (`juntarComOu` em `utils.ts`); descrição do `atualmente` com `CURRENTLY_SLOTS.join(", ")`.

Gate: `tsc` ok, `eslint` ok (1 aviso antigo: `optionalUrlSchema` sem uso em `validations.ts`), `vitest` 175 passed, 21 skipped (contrato do Firestore), 0 failed.
