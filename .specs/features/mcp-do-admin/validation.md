# MCP do admin Validation

**Result**: PASS
**Faixa**: GRANDE
**Iteração**: 2 (de 3; a 1 reprovou com M9, M14, M15, M17 vivos e gaps IMG-02 e FALHA_EXTERNA)
**Date**: 2026-11-04
**Spec**: `.specs/features/mcp-do-admin/spec.md`
**Diff range**: working tree contra HEAD (`4ff8136`, sem commit da feature): `git diff HEAD` + não rastreados em `src/` e `vitest.config.mts`. Fora: `src/components/sections/Services.tsx`, `.specs/`.
**Verifier**: sub-agente independente (autor != verificador). `execucao.md` não usado como evidência.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1..T39 | Done | checkboxes marcados em `tasks.md` |
| T40 contrato Firestore real | Done | marcado em `tasks.md:733`; não rodado nesta verificação (opt-in, por instrução) |
| T41 e2e | Pendente | `tasks.md:748` `[ ]`; ACs só de UI ficam "pendente e2e (T41)" e não reprovam |

---

## Gaps da iteração 1

| Gap | Teste novo (`file:line` + asserção) | Valor do spec | Fechado? |
| --- | ----------------------------------- | ------------- | -------- |
| M9 / UNICO-04 `listar` com item fixo | `src/server/conteudo/servico.test.ts:155` caso "listar com item fixo"; `:166` `rejects.toMatchObject({ codigo: "FORA_DO_ESCOPO" })`; `:167` todos os espiões do repo `not.toHaveBeenCalled()` | `FORA_DO_ESCOPO`, sem ler nem gravar | Sim (M9 morto) |
| M14 / AUDIT-01 `apagar` (e `atualizar`) pela ferramenta | `src/server/mcp/servidor.test.ts:216-234` it.each atualizar/apagar via tools/call; `:229` `auditoria.at(-1)).toMatchObject({ acessoId, acao: ferramenta, recurso: "livros", itemId })`; `:237-249` falha de domínio não audita | registro com id do acesso, ação, recurso e id do item, só no sucesso | Sim (M14 morto) |
| M15 / Edge 413 pelo corpo lido | `src/app/api/mcp/route.test.ts:98-107` sem Content-Length e com Content-Length menor que o real; `:106` `status toBe(413)`; `:107` `toMatchObject({ codigo: "CORPO_GRANDE" })` | 413 acima de 4 MB | Sim (M15 morto) |
| M17 / fuso de `paraDataIso` | `src/lib/conteudo/leitura.test.ts:9` `paraDataIso(new Date("2026-01-10T01:00:00.000Z"))).toBe("2026-01-09")` | dia de Brasília (UTC-3) | Sim (M17 morto) |
| IMG-02 formatos | `src/server/imagem.test.ts:53-63` it.each `image/jpeg`, `image/webp`, `image/gif`; `:61` `toEqual({ url, largura: 800, altura: 1200, bytes: 123456 })`; `:62` `file` == `data:${tipo};base64,...`; PNG em 3 MB exatos `:43-51` | JPG, PNG, WebP, GIF até 3 MB, mesmos campos | Sim (sonda G1 morta) |
| FALHA_EXTERNA (rota de admin e ferramenta) | rota: `src/app/api/admin/mcp/acessos/route.test.ts:176-187` `status toBe(503)` + `toEqual({ codigo: "FALHA_EXTERNA", mensagem: "Falha ao acessar o banco de dados. Tente de novo." })`; ferramenta: `src/server/mcp/servidor.test.ts:252-262` `isError toBe(true)`, `/^FALHA_EXTERNA: /`, `not.toContain("stack interna")` | 503 na rota de admin; `isError` + `FALHA_EXTERNA` na ferramenta; sem stack | Sim (sondas G2 e G3 mortas) |

**6/6 fechados.**

---

## Spec-Anchored Acceptance Criteria

Caminhos relativos a `src/`.

### P1: Chave pessoal e servidor MCP

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CHAVE-01 segredo | `pf_pk_` + 43 base64url, uma vez | `server/mcp/acessos/segredo.test.ts:9` `toMatch(/^pf_pk_[A-Za-z0-9_-]{43}$/)`; `app/api/admin/mcp/acessos/route.test.ts:72` idem no 201 | PASS |
| CHAVE-01 nome 1..60, validade 1/30/90 | 400 por campo | `server/mcp/acessos/servico.test.ts:47-57` campos exatos; `app/api/admin/mcp/acessos/route.test.ts:107-110` status 400 + `campos` | PASS (60 aceito não testado, menor) |
| CHAVE-01 config 6 clientes | Claude Code, Claude Desktop, Cursor, VS Code, Codex, Windsurf | `lib/mcp/conexao.test.ts:11` `toEqual([... 6 nomes])`; `:21-26` URL e `Bearer <segredo>` em cada | PASS |
| CHAVE-02 | sem validade = 90 dias | `server/mcp/acessos/servico.test.ts:44` `expiraEm toBe(INICIO + 90 * DIA)`; `app/api/admin/mcp/acessos/route.test.ts:76` | PASS |
| CHAVE-03 | só sha256 hex como id + prefixo `pf_pk_`+4 | `server/mcp/acessos/segredo.test.ts:20-24`; `server/mcp/acessos/servico.test.ts:66-69` | PASS |
| MCP-04 | initialize, tools/list, tools/call sem sessão | `server/mcp/servidor.test.ts:98-105` `serverInfo.name "portfolio"`; `app/api/mcp/route.test.ts:61-63` 200 + 7 tools; `server/mcp/servidor.test.ts:174-186` tools/call grava | PASS (ausência de `mcp-session-id` não asserida, menor) |
| MCP-05 | 7 ferramentas da chave pessoal | `server/mcp/servidor.test.ts:132-134` `toEqual(["apagar","atualizar","criar","descrever_recurso","listar","obter","subir_imagem"])` | PASS |
| MCP-06 | grava com createdAt/updatedAt do servidor e devolve o item | `server/conteudo/servico.test.ts:39-50`, `:53-64`; `server/conteudo/repositorio.test.ts:20-28` `serverTimestamp().isEqual(...)` | PASS |
| MCP-07 | `isError: true` + mensagem por campo, sem gravar | `server/mcp/servidor.test.ts:199-203`; `server/conteudo/servico.test.ts:67-85` | PASS |
| MCP-08 | `NAO_ENCONTRADO` em obter/atualizar/apagar | `server/conteudo/servico.test.ts:90-97` it.each 3 ações; `server/mcp/servidor.test.ts:212-213`, `:247-248` | PASS |
| MCP-09 | `SLUG_EM_USO`, sem gravar | `server/conteudo/servico.test.ts:103-119` criar e atualizar | PASS |
| MCP-10 | `atualmente`: obter/atualizar sem id; `ACAO_INVALIDA` em listar/criar/apagar | `server/conteudo/servico.test.ts:126-144` | PASS |
| MCP-11 | 401 `Acesso inválido ou expirado.` nos casos ausente/inexistente/revogada/vencida/encerrada | `app/api/mcp/route.test.ts:83-84` `status 401` + `toEqual(ACESSO_INVALIDO)` para os 5 | PASS |
| MCP-12 | GET/DELETE 405 | `app/api/mcp/route.test.ts:145-146` `status 405`, `Allow: POST` | PASS |
| MCP-13 | `ultimoUsoEm` no máximo 1x/min | `server/mcp/acessos/servico.test.ts:241-250` | PASS |
| MCP-14 | 429 a partir da 121ª no minuto, libera no seguinte | `app/api/mcp/route.test.ts:113` 120x 200, `:120` `excedente.status 429`, `:122` seguinte 200; `server/mcp/acessos/servico.test.ts:256-262` | PASS (transação real coberta pelo contrato T40) |
| MCP-15 | instructions: recursos, descrever_recurso antes de gravar, subir_imagem | `server/mcp/servidor.test.ts:106-108` | PASS |

### P1: Gerenciar acessos

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| ACESSOS-01 (back) | pessoais e únicos separados, situação derivada | `server/mcp/acessos/servico.test.ts:112-113`; `server/mcp/acessos/situacao.test.ts:11-30` 4 situações + precedência + limite exato; `app/api/admin/mcp/acessos/route.test.ts:51-53` | PASS |
| ACESSOS-01 (tela) | tabelas, colunas | implementação `components/admin/mcp/TabelaAcessos.tsx` | pendente e2e (T41) |
| ACESSOS-02 | grava `revogadoEm`, chamada seguinte 401 | `server/mcp/acessos/servico.test.ts:122-124`; `app/api/mcp/route.test.ts:83` revogada → 401 | PASS |
| ACESSOS-03 | 409 `ACESSO_ATIVO`, sem apagar | `app/api/admin/mcp/acessos/[id]/route.test.ts:50-52` | PASS |
| ACESSOS-04 | remove documento, mantém auditoria | `app/api/admin/mcp/acessos/[id]/route.test.ts:31-33`; `server/mcp/acessos/servico.test.ts:151-156` | PASS |
| ACESSOS-05 | sem token 401; outro uid 403 | `server/admin-auth.test.ts:28-47`; `app/api/admin/mcp/acessos/route.test.ts:152-153` 401, `:159-161` 403 + nada criado | PASS |
| ACESSOS-06 | 11ª ativa: 409 `LIMITE_DE_CHAVES` | `app/api/admin/mcp/acessos/route.test.ts:140-141`; `server/mcp/acessos/servico.test.ts:161-166` laço com 10 literal, tamanho continua 10 | PASS |
| ACESSOS-07 | dialog de confirmação antes de enviar | implementação `components/admin/mcp/ConfirmarAcao.tsx:30`, uso em `TabelaAcessos.tsx:251` | pendente e2e (T41) |
| ACESSOS-08 | seção "MCP" na navegação | implementação `components/admin/AdminSidebar.tsx:82-83` | pendente e2e (T41) |

### P1: Acesso de uso único

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| UNICO-01 segredo + prompt | `pf_uu_`+43; prompt com URL, Bearer, comando Claude Code, curl tools/call, tarefa | `app/api/admin/mcp/acessos/route.test.ts:92-100`; `lib/mcp/conexao.test.ts:44-63` | PASS |
| UNICO-01 validação | ações >= 1 entre ler/criar/editar; tarefa 1..500 | `server/mcp/acessos/servico.test.ts:88-99`; `app/api/admin/mcp/acessos/route.test.ts:119-120` 400 + campos | PASS |
| UNICO-02 | vence 2 h após criação | `server/mcp/acessos/servico.test.ts:84` `expiraEm "2026-11-03T16:00:00.000Z"` (criado 14:00) | PASS |
| UNICO-03 | só as ferramentas concedidas + descrever_recurso, subir_imagem (criar/editar), concluir_tarefa; nunca apagar | `server/mcp/servidor.test.ts:137-165` ler / criar / ler+editar, listas exatas; `:157` sem escopo só `concluir_tarefa` | PASS |
| UNICO-04 | `FORA_DO_ESCOPO` sem ler nem gravar (outro recurso, outro item, ação não concedida) | `server/conteudo/servico.test.ts:151-169` 6 casos (inclui listar com item fixo e apagar), espiões `not.toHaveBeenCalled()`, item inalterado | PASS |
| UNICO-05 | `concluir_tarefa` grava `encerradoEm`; seguintes 401 | `server/mcp/servidor.test.ts:288-290`; `app/api/mcp/route.test.ts:83` encerrado → 401 | PASS |
| UNICO-06 | "Encerrar" grava `encerradoEm` | `server/mcp/acessos/servico.test.ts:175`; `app/api/admin/mcp/acessos/[id]/encerrar/route.test.ts:33-34` | PASS (botão na tela: pendente e2e) |

### P2: Imagens

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| IMG-01 | url vai ao Cloudinary; devolve url, largura, altura, bytes | `server/imagem.test.ts:31-41` `toEqual({ url, largura: 800, altura: 1200, bytes: 123456 })`, `file` == url | PASS |
| IMG-02 | base64 até 3 MB em JPG/PNG/WebP/GIF | `server/imagem.test.ts:43-51` PNG 3 MB exatos; `:53-63` it.each jpeg/webp/gif, mesmos campos e data URI do tipo | PASS |
| IMG-03 | > 3 MB: `IMAGEM_GRANDE` + orientação de `url` | `server/imagem.test.ts:74-76` codigo + `message toContain("url")` + fetch não chamado | PASS |
| IMG-04 | `TIPO_NAO_SUPORTADO` | `server/imagem.test.ts:79-85` | PASS |
| IMG-05 | ambos ou nenhum: `ACAO_INVALIDA` | `server/imagem.test.ts:88-97` | PASS |

### P2: Auditoria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| AUDIT-01 | registro em criado/revogado/encerrado/apagado e em criar/atualizar/apagar/subir_imagem com sucesso | `server/mcp/acessos/servico.test.ts:277-283` chave_criada, unico_criado, revogado, encerrado; `:151-156` apagado; `server/mcp/servidor.test.ts:180-186` criar; `:229-234` atualizar e apagar; `:278` subir_imagem; `:249` falha não audita | PASS |
| AUDIT-02 | 20 mais recentes | `server/mcp/acessos/servico.test.ts:298-299`; `app/api/admin/mcp/atividade/route.test.ts:32-35` | PASS |
| AUDIT-03 | sem segredo nem dados do item | `server/mcp/acessos/repositorio.test.ts:53-55` chaves exatas do doc; `server/mcp/acessos/servico.test.ts:284-286` | PASS |

**Status**: todos os ACs não-UI cobertos e com o valor do spec. Pendentes e2e (T41), sem reprovar: ACESSOS-01 (tela), ACESSOS-07, ACESSOS-08, UNICO-06 (botão).

---

## Edge Cases

- [x] Sem service account: 503 `Servidor MCP não configurado.` em `/api/mcp` (`app/api/mcp/route.test.ts:125-130`) e na rota de admin (`app/api/admin/mcp/acessos/route.test.ts:164-173`).
- [x] Firestore/Cloudinary falha: `FALHA_EXTERNA` no serviço (`server/conteudo/servico.test.ts:182-191`), no Cloudinary (`server/imagem.test.ts:100-105`), na ferramenta como `isError` (`server/mcp/servidor.test.ts:252-262`) e 503 na rota de admin (`app/api/admin/mcp/acessos/route.test.ts:176-187`); mensagem interna não vaza em nenhum.
- [x] Acesso vence durante a conversa: `server/mcp/acessos/servico.test.ts:216-221`; `app/api/mcp/route.test.ts:83`.
- [~] Dois cliques: segredos distintos (`server/mcp/acessos/segredo.test.ts:27`), cada um conta no limite (`app/api/admin/mcp/acessos/route.test.ts:134-141`). Botão desabilitado = pendente e2e (`components/admin/mcp/ChavePessoalForm.tsx:76,171`).
- [x] Corpo > 4 MB: 413 `CORPO_GRANDE` por Content-Length antes de autenticar (`app/api/mcp/route.test.ts:88-94`) e pelo corpo lido (`:98-107`).
- [x] `listar` vazio: `server/conteudo/repositorio.test.ts:67-70` `{ itens: [], proximoCursor: null }`.
- [x] `listar` > 50: `server/conteudo/repositorio.test.ts:80-86` 50 + cursor + segunda página.

## Cenários

**Backend**

| Cenário | Evidência | Result |
| ------- | --------- | ------ |
| Sucesso MCP-06 / ACESSOS-01 / UNICO-01 | tabelas acima | PASS |
| Entrada inválida (400 por campo) | MCP-07; `app/api/admin/mcp/acessos/route.test.ts:107-120` | PASS |
| Sem login 401 | MCP-11; ACESSOS-05 | PASS |
| Sem permissão 403 / FORA_DO_ESCOPO | `app/api/admin/mcp/acessos/route.test.ts:159`; UNICO-04 | PASS |
| Não existe 404 | MCP-08; `[id]/route.test.ts:41-42`, `revogar/route.test.ts:42-43`, `encerrar/route.test.ts:44-45` | PASS |
| Estado 409 | ACESSO_ATIVO, LIMITE_DE_CHAVES, SLUG_EM_USO (+ ACESSO_INATIVO `revogar/route.test.ts:52-53`, `encerrar/route.test.ts:54-55`) | PASS |
| Lista vazia / paginada | Edge Cases; atividade vazia `atividade/route.test.ts:41-42` | PASS |
| Envio duplicado | duas chaves distintas; botão travado pendente e2e | PASS no back |
| Falha de dependência | 503 sem SA; `FALHA_EXTERNA` na ferramenta e 503 na rota de admin | PASS |

**UI (`/admin/mcp`)**: quantidade, vazio, dado parcial, busca sem resultado, erro com "Tentar de novo", carregando, segredo uma vez, celular/desktop: **pendente e2e (T41)**.

---

## Discrimination Sensor

Cópia do projeto em scratch (sem `node_modules`, `.next`, `.git`; `node_modules` por junction ao original), uma mutação por vez, só os testes do módulo, original restaurado byte a byte após cada rodada. Linha de base na cópia: 8 arquivos, 107 testes verdes antes das mutações. Ao fim: junction removida com `rmdir` sem `/s`, `node_modules` do repo com as mesmas 781 entradas, cópia apagada, `git status --porcelain` do repo real idêntico ao de antes (conferido também depois do gate).

| # | File:line | Mutação | Teste que matou | Killed? |
| - | --------- | ------- | --------------- | ------- |
| M9 | `src/server/conteudo/servico.ts:65` | `(acao === "listar" \|\| ` → `(false \|\| ` (listar liberado com item fixo) | `server/conteudo/servico.test.ts` "listar com item fixo devolve FORA_DO_ESCOPO" | Killed |
| M14 | `src/server/mcp/servidor.ts:132` | ferramenta `apagar` sem auditoria | `server/mcp/servidor.test.ts` "apagar com sucesso audita ação, recurso e itemId" | Killed |
| M15 | `src/app/api/mcp/route.ts:31` | remove o 413 do corpo lido | `app/api/mcp/route.test.ts` 2 casos "413 CORPO_GRANDE: corpo lido" (o SDK devolve JSON-RPC sem `codigo`) | Killed |
| M17 | `src/lib/conteudo/leitura.ts:55` | `DESLOCAMENTO_DO_SITE_MS = 0` | `lib/conteudo/leitura.test.ts` "paraDataIso usa o dia de Brasília" (`2026-01-10` != `2026-01-09`) | Killed |
| N1 | `src/server/mcp/acessos/situacao.ts:15` | troca a ordem: encerrado antes de revogado | `server/mcp/acessos/situacao.test.ts` "revogado vence sobre encerrado e vencido" | Killed |
| N2 | `src/lib/mcp/limites.ts:26` | `MAX_CHAVES_PESSOAIS_ATIVAS = 11` (limite usado em `server/mcp/acessos/servico.ts:126`) | `server/mcp/acessos/servico.test.ts` "a 11ª chave pessoal ativa devolve LIMITE_DE_CHAVES" (laço com 10 literal; o teste de rota segue a constante e passou) | Killed |
| N3 | `src/server/mcp/servidor.ts:65` | `ferramentasDoAcesso` concede `apagar` ao acesso único | `server/mcp/servidor.test.ts` 3 testes de tools/list do único | Killed |
| G1 | `src/lib/imagem.ts:8` | remove `image/webp` dos tipos aceitos (sonda do gap IMG-02) | `server/imagem.test.ts` "base64 em image/webp é aceito" | Killed |
| G2 | `src/server/http.ts:67` | `FALHA_EXTERNA` 503 → 500 na rota de admin (sonda do gap) | `app/api/admin/mcp/acessos/route.test.ts` "503 FALHA_EXTERNA quando o serviço lança erro inesperado" | Killed |
| G3 | `src/server/mcp/servidor.ts:80` | erro não-domínio na ferramenta vaza `String(erro)` (sonda do gap) | `server/mcp/servidor.test.ts` "erro inesperado do serviço volta com isError e FALHA_EXTERNA, sem a mensagem interna" | Killed |

**Sensor depth**: P0 (GRANDE). Iteração 1: 18 mutações (14 mortas). Iteração 2: os 4 vivos re-aplicados, 3 novas e 3 sondas dos gaps.
**Result**: 10/10 killed, PASS.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Spec-anchored outcome check | ok: valores asseridos casam com o spec em todos os ACs não-UI |
| Per-layer coverage (domínio 1:1; rotas happy + edge + error) | ok: rota de admin agora com 503 `FALHA_EXTERNA` |
| Testes novos mapeiam para AC/Edge Case | ok: cada teste novo cita o AC ou o Edge Case no nome |
| SPEC_DEVIATION | `lib/conteudo/tipos.ts:89` código `ACESSO_INATIVO` (409 ao revogar/encerrar inativo); coberto por `revogar/route.test.ts:52-53` |
| Documented guidelines | `CLAUDE.md` do projeto + global |

---

## Gate Check

- **Comando**: `npx tsc --noEmit` e `npx vitest run --reporter=dot`, no repo real, exit lido sem pipe (lint não pedido nesta verificação).
- **tsc**: exit 0, sem saída.
- **vitest**: exit 0; 28 arquivos passaram, 1 pulado; 189 testes passaram, 0 falharam, 21 pulados (todos de `src/server/__contrato__/firestore.contrato.test.ts`, opt-in, justificado: T40 já rodou verde à parte).
- **Contagem antes da feature**: 0 (repo sem runner). **Iteração 1**: 196 (175 ativos). **Agora**: 210 (189 ativos), +14 testes ativos.
- **Falhas**: nenhuma. stderr esperado: logs `[conteudo]`/`[api]`/`[mcp] falha de dependência` dos testes de `FALHA_EXTERNA`.

---

## Fix Plans

Nenhum bloqueante. Menores, opcionais:

1. CHAVE-01: asserir nome com 60 caracteres aceito (só o 61 recusado está testado).
2. MCP-04: asserir ausência de `mcp-session-id` na resposta.
3. ACESSOS-06 na rota: o teste segue `MAX_CHAVES_PESSOAIS_ATIVAS`; o valor 10 do spec fica ancorado só no teste do serviço.

---

## Pendente e2e (T41)

ACESSOS-01 (tela), ACESSOS-07, ACESSOS-08, UNICO-06 (botão), Edge "botão desabilitado na criação", todos os Cenários de UI.

---

## Requirement Traceability Update

| Requirement | New Status |
| ----------- | ---------- |
| CHAVE-01..03, MCP-04..15 | Verified |
| ACESSOS-02..06 | Verified |
| ACESSOS-01 | Verified (back); tela pendente e2e |
| ACESSOS-07, ACESSOS-08 | Pendente e2e (T41) |
| UNICO-01..05 | Verified |
| UNICO-06 | Verified (back); botão pendente e2e |
| IMG-01..05 | Verified |
| AUDIT-01..03 | Verified |

---

## Summary

**Overall**: Ready no back; UI aguarda o e2e (T41)
**Spec-anchored check**: 35/35 ACs não-UI casam com o spec; 0 spec-precision gaps; ACESSOS-07 e ACESSOS-08 (só UI) pendentes e2e
**Sensor**: 10/10 killed (4 vivos da iteração 1 agora mortos)
**Gate**: tsc ok; 189 passed, 0 failed, 21 skipped (contrato opt-in)

---

## Fechamento do e2e (T41, 11/11/2026)

Os itens marcados "pendente e2e (T41)" foram exercidos em `.specs/features/mcp-do-admin/e2e.md`: ACESSOS-01 (tela), ACESSOS-02, ACESSOS-04, ACESSOS-07, ACESSOS-08, UNICO-01, UNICO-06 (botão), AUDIT-02 e os cenários de UI (vazio, erro por campo, busca sem resultado, confirmação, contador). Parte MCP 18/18, inclusive Claude Code conectado só com Bearer.

Exceção aceita pelo João: cenário "celular" falha no shell compartilhado do admin (`src/app/admin/layout.tsx:27-30`, `src/components/admin/AdminSidebar.tsx:107`), anterior à feature; vira feature própria.
