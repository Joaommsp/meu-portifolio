# MCP do admin Specification

**Faixa**: GRANDE (auth, tokens, escrita em banco com credencial de serviço, 7+ arquivos).
**Mockup**: https://claude.ai/artifact/77Zt9rLm9jxZ96Rd5R8Pi8 (aprovado em 03/11/2026).
**Referência**: gfi-reports `.specs/features/mcp-de-relatorios/` (modelo de acessos, ver `context.md`).

## Problem Statement

Hoje o conteúdo do portfólio (projetos, posts, livros, games, figma, uses, agora, jogando) só muda pelo admin, formulário a formulário, no navegador. O João quer pedir a uma LLM "cadastra o livro X", "publica este post" ou "atualiza o jogando" e a mudança acontecer, sem abrir cada tela. Para isso o site precisa de um servidor MCP autenticado que grave no Firestore com as mesmas regras de validação do admin.

## Goals

- [ ] Qualquer conteúdo dos 8 recursos do admin pode ser listado, lido, criado, editado e apagado por um cliente MCP com chave pessoal, com a mesma validação do formulário.
- [ ] Um acesso de uso único entrega, num clique, um prompt pronto que faz a LLM concluir uma tarefa delimitada e encerra sozinho.
- [ ] Nenhuma credencial em texto puro fica guardada: o banco tem só o sha256.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Guestbook (moderação pelo MCP) | Não está na lista do pedido; é conteúdo de visitante, não do admin. |
| Endpoint REST paralelo ao MCP | O uso único fala o mesmo MCP (ver Assumptions); um caminho de auth só. |
| OAuth / login do cliente MCP | Só Bearer no header, como no gfi-reports. |
| Upload de vídeo ou arquivo que não seja imagem | O admin hoje só sobe imagem. |
| Vários usuários / perfis de permissão | O admin tem um dono só (`ADMIN_UID`); escopo = tipo do acesso. |
| Spotify, GitHub, WakaTime, Behance | Dados vindos de API externa, não editáveis no admin. |
| Desfazer / histórico de versões do conteúdo | A auditoria registra a ação, não guarda o antes. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Ferramentas: uma por recurso ou genéricas | 6 ferramentas genéricas com `recurso` como enum (`listar`, `obter`, `criar`, `atualizar`, `apagar`, `descrever_recurso`) + `subir_imagem` + `concluir_tarefa` | 8 recursos x 5 ações = 40 ferramentas lotam o contexto da LLM; `descrever_recurso` devolve os campos e limites de cada um | y |
| Uso único fala MCP ou só REST/prompt | Fala o MCP no mesmo `/api/mcp`; o prompt traz URL, Bearer, o comando de conexão e, para cliente sem MCP, o `curl` de `tools/call` | Um caminho de auth e de validação; o JSON-RPC por POST também é chamável por `curl` | y |
| Prazo do uso único | 2 h fixas | A tarefa é editar conteúdo, não um relatório; janela curta reduz o estrago de prompt vazado. gfi-reports usa 24 h porque o trabalho é longo | y |
| Escopo do uso único | 1 recurso (obrigatório) + 1 item (opcional) + ações escolhidas entre `ler`, `criar`, `editar`; `apagar` nunca | Prompt colado em chat é mais exposto que a chave pessoal; apagar fica só na pessoal | y |
| Como as imagens chegam | Ferramenta `subir_imagem` aceita `url` pública (o Cloudinary busca, sem passar pelo corpo da função) ou `base64` até 3 MB decodificados; devolve a URL do Cloudinary para usar no campo | 3 MB decodificados viram ~4 MB em base64, abaixo do teto de 4,5 MB da Vercel; reaproveita o preset do Cloudinary que o admin já usa | y |
| Formatos de imagem | JPG, PNG, WebP, GIF | Mesmos de `src/lib/cloudinary.ts` | y (código) |
| Quem gerencia os acessos | Só o dono do admin: rotas `/api/admin/mcp/*` exigem ID token do Firebase com `uid == ADMIN_UID`, conferido com `firebase-admin` | O admin hoje é só client-side com regras; criar chave exige servidor | y |
| Regras do Firestore | Coleções de acessos e auditoria fechadas ao SDK cliente (`allow read, write: if false`); só o servidor (admin SDK) lê e grava | Hash e auditoria não podem vazar pelo cliente | y |
| Validação dos dados | Reaproveitar os schemas de `src/lib/validations.ts` (post, projeto, game, livro) e criar os que faltam (figma, uses, agora, jogando) no mesmo arquivo, usados também pelos formulários | Regra num lugar só; formulário e MCP não divergem | y |
| `slug` duplicado | 409 de domínio (`isError: true`, código `SLUG_EM_USO`) | Mesma regra do `isSlugTaken` do admin | y |
| Rate limit | 120 chamadas/min por acesso, contado no Firestore (não em memória) | Instâncias da Vercel não compartilham memória | y |
| Máximo de chaves pessoais ativas | 10 | Evita acúmulo esquecido; o dono revoga as velhas | y |
| Atualização do site público após gravação | Nenhuma ação extra: as páginas leem o Firestore via REST sem cache de dados | `rest.ts` não usa `revalidate`; conferir no Design | y |
| Runner de teste | Adicionar Vitest (o repo não tem nenhum) | Sem runner não há gate por task | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Chave pessoal e servidor MCP ⭐ MVP

**User Story**: Como dono do portfólio, quero gerar uma chave pessoal e ligá-la ao Claude Code para gerenciar todo o conteúdo do admin pela LLM.

**Why P1**: É o caminho principal de uso; sem ele não há feature.

**Acceptance Criteria**:

1. WHEN o dono cria uma chave com nome (1 a 60 caracteres) e validade 1, 30 ou 90 dias THEN o sistema SHALL devolver o segredo `pf_pk_` + 43 caracteres base64url uma única vez, com a configuração pronta para Claude Code, Claude Desktop, Cursor, VS Code, Codex e Windsurf.
2. WHEN a validade não é informada THEN o sistema SHALL usar 90 dias.
3. The system SHALL guardar do segredo apenas o sha256 hex (como ID do documento) e o `prefixo` (`pf_pk_` + 4 primeiros caracteres).
4. WHEN um cliente faz `POST /api/mcp` com `Authorization: Bearer <chave ativa>` THEN o sistema SHALL responder ao protocolo MCP (initialize, tools/list, tools/call) sem sessão no servidor.
5. WHEN a chave pessoal chama `tools/list` THEN o sistema SHALL listar `listar`, `obter`, `criar`, `atualizar`, `apagar`, `descrever_recurso` e `subir_imagem`.
6. WHEN `criar` ou `atualizar` recebe dados válidos para o recurso THEN o sistema SHALL gravar no Firestore com `createdAt`/`updatedAt` do servidor e devolver o item gravado.
7. IF `criar` ou `atualizar` recebe dados inválidos THEN o sistema SHALL devolver `isError: true` com a mensagem de cada campo, sem gravar.
8. IF `obter`, `atualizar` ou `apagar` recebe um `id` inexistente THEN o sistema SHALL devolver `isError: true` com código `NAO_ENCONTRADO`.
9. IF `criar` ou `atualizar` usa um `slug` já usado por outro item do mesmo recurso THEN o sistema SHALL devolver `isError: true` com código `SLUG_EM_USO`, sem gravar.
10. WHEN o recurso é `agora` THEN o sistema SHALL tratar `obter` e `atualizar` sem `id` (documento único) e devolver `isError: true` com código `ACAO_INVALIDA` em `listar`, `criar` e `apagar`.
11. IF o header falta, ou a chave não existe, foi revogada, venceu ou foi encerrada THEN o sistema SHALL responder HTTP 401 com a mesma mensagem `Acesso inválido ou expirado.` nos quatro casos.
12. WHEN chega `GET` ou `DELETE` em `/api/mcp` THEN o sistema SHALL responder 405.
13. WHEN uma chamada autenticada acontece THEN o sistema SHALL atualizar `ultimoUsoEm` do acesso no máximo 1 vez por minuto.
14. IF um acesso passa de 120 chamadas no mesmo minuto THEN o sistema SHALL responder HTTP 429 até o minuto seguinte.
15. WHEN o servidor MCP inicializa THEN o sistema SHALL enviar `instructions` explicando os recursos, o uso de `descrever_recurso` antes de gravar e o uso de `subir_imagem` para imagens.

**Independent Test**: Criar chave pela API de admin, `claude mcp add` com a configuração devolvida, pedir "cria um livro X" e ver o livro em `/admin/books`.

---

### P1: Gerenciar acessos no admin ⭐ MVP

**User Story**: Como dono, quero ver, revogar e apagar as chaves e acessos na tela `/admin/mcp` para controlar quem mexe no conteúdo.

**Why P1**: Chave sem revogação é risco; a tela é o único lugar que mostra o segredo.

**Acceptance Criteria**:

1. WHEN o dono abre `/admin/mcp` THEN o sistema SHALL listar chaves pessoais e acessos únicos em tabelas separadas com nome/tarefa, prefixo, criado em, vence em, último uso e situação (`ativo`, `revogado`, `encerrado`, `vencido`) derivada das datas.
2. WHEN o dono revoga uma chave ativa THEN o sistema SHALL gravar `revogadoEm` e a chave SHALL passar a receber 401 na chamada seguinte.
3. IF o dono tenta apagar um acesso ativo THEN o sistema SHALL responder 409 com código `ACESSO_ATIVO`, sem apagar.
4. WHEN o dono apaga um acesso inativo THEN o sistema SHALL remover o documento do acesso e manter os registros de auditoria dele.
5. IF uma rota `/api/admin/mcp/*` recebe requisição sem ID token válido THEN o sistema SHALL responder 401; IF o token é de outro `uid` THEN SHALL responder 403.
6. IF o dono tenta criar a 11ª chave pessoal ativa THEN o sistema SHALL responder 409 com código `LIMITE_DE_CHAVES`.
7. WHEN o dono confirma revogar ou apagar THEN o sistema SHALL pedir confirmação num dialog antes de enviar.
8. The system SHALL mostrar a seção "MCP" na navegação do admin, ao lado das demais.

**Independent Test**: Criar, revogar e apagar uma chave pela tela e conferir 401 no cliente MCP após revogar.

---

### P1: Acesso de uso único ⭐ MVP

**User Story**: Como dono, quero gerar um acesso curto preso a uma tarefa e receber um prompt pronto para colar numa LLM, sem configurar chave.

**Why P1**: É o segundo tipo de conexão pedido.

**Acceptance Criteria**:

1. WHEN o dono cria um acesso único com recurso, ações (`ler`, `criar`, `editar`, ao menos uma), item opcional e tarefa (1 a 500 caracteres) THEN o sistema SHALL devolver o segredo `pf_uu_` + 43 caracteres base64url uma única vez, dentro de um prompt pronto com URL do MCP, Bearer, comando de conexão para Claude Code, exemplo `curl` de `tools/call` e a tarefa.
2. The system SHALL fazer o acesso único vencer 2 h após a criação.
3. WHEN o acesso único chama `tools/list` THEN o sistema SHALL listar só as ferramentas das ações concedidas, mais `descrever_recurso`, `subir_imagem` (se `criar` ou `editar` concedido) e `concluir_tarefa`; `apagar` SHALL não aparecer.
4. IF o acesso único chama uma ferramenta com outro recurso, outro item ou ação não concedida THEN o sistema SHALL devolver `isError: true` com código `FORA_DO_ESCOPO`, sem ler nem gravar.
5. WHEN o acesso único chama `concluir_tarefa` THEN o sistema SHALL gravar `encerradoEm` e as chamadas seguintes SHALL receber 401.
6. WHEN o dono clica "Encerrar" num acesso único ativo THEN o sistema SHALL gravar `encerradoEm`.

**Independent Test**: Criar acesso único para "jogando", ação `criar`, colar o prompt no Claude Code, ver o item criado e o acesso como `encerrado`.

---

### P2: Imagens pelo MCP

**User Story**: Como dono, quero que a LLM suba a capa de um livro ou a imagem de um projeto sem eu abrir o admin.

**Why P2**: O conteúdo funciona sem imagem nova (pode reaproveitar URL), mas capa é comum.

**Acceptance Criteria**:

1. WHEN `subir_imagem` recebe `url` http(s) THEN o sistema SHALL enviar a URL ao Cloudinary (o Cloudinary baixa) e devolver `url`, `largura`, `altura` e `bytes` do resultado.
2. WHEN `subir_imagem` recebe `base64` de até 3 MB decodificados em JPG, PNG, WebP ou GIF THEN o sistema SHALL enviar ao Cloudinary e devolver os mesmos campos.
3. IF o `base64` passa de 3 MB decodificados THEN o sistema SHALL devolver `isError: true` com código `IMAGEM_GRANDE` e a orientação de usar `url`.
4. IF o tipo não é JPG, PNG, WebP ou GIF THEN o sistema SHALL devolver `isError: true` com código `TIPO_NAO_SUPORTADO`.
5. IF `url` e `base64` vêm juntos ou nenhum vem THEN o sistema SHALL devolver `isError: true` com código `ACAO_INVALIDA`.

**Independent Test**: Pedir à LLM "sobe esta capa (URL) e põe no livro X" e ver a capa no site.

---

### P2: Auditoria e atividade recente

**User Story**: Como dono, quero ver o que cada acesso fez para confiar no que a LLM mudou.

**Why P2**: Controle; a feature funciona sem a tela de atividade.

**Acceptance Criteria**:

1. WHEN um acesso é criado, revogado, encerrado ou apagado, ou uma ferramenta de escrita (`criar`, `atualizar`, `apagar`, `subir_imagem`) termina com sucesso THEN o sistema SHALL gravar um registro de auditoria com data, id do acesso, prefixo, ação, recurso e id do item.
2. WHEN o dono abre `/admin/mcp` THEN o sistema SHALL mostrar as 20 ações mais recentes da auditoria.
3. The system SHALL não gravar na auditoria o segredo nem os dados do item.

**Independent Test**: Criar um item pelo MCP e ver a linha "criar · livros · <id>" na atividade recente.

---

## Edge Cases

- IF a service account não está configurada no servidor THEN o sistema SHALL responder 503 com `Servidor MCP não configurado.` em `/api/mcp` e nas rotas de admin, sem stack trace.
- IF o Firestore ou o Cloudinary falha THEN o sistema SHALL devolver `isError: true` com código `FALHA_EXTERNA` na ferramenta (ou 503 na rota de admin), sem stack trace.
- WHEN um acesso vence durante uma conversa THEN a chamada seguinte SHALL receber 401 com a mesma mensagem.
- WHEN dois cliques criam a mesma chave THEN o sistema SHALL criar duas chaves distintas (cada uma conta no limite de 10); o botão SHALL ficar desabilitado enquanto a criação está em curso.
- IF o corpo da requisição em `/api/mcp` passa de 4 MB THEN o sistema SHALL responder 413.
- WHEN `listar` não encontra itens THEN o sistema SHALL devolver lista vazia, sem erro.
- WHEN `listar` tem mais de 50 itens THEN o sistema SHALL devolver 50 por página com cursor para a próxima.

---

## Cenários

**Backend (`/api/mcp` e `/api/admin/mcp/*`)**

- Sucesso: MCP-06, ACESSOS-01, UNICO-01.
- Entrada inválida (400 / erro por campo): MCP-07, CHAVE-01 (nome, validade), UNICO-01 (tarefa, ações).
- Sem login (401): MCP-11, ACESSOS-05.
- Sem permissão (403): ACESSOS-05 (outro uid); fora do escopo do uso único é `FORA_DO_ESCOPO` (UNICO-04).
- Não existe (404): `NAO_ENCONTRADO` no MCP (MCP-08); acesso inexistente na rota de admin = 404.
- Estado não permite (409): `ACESSO_ATIVO` (ACESSOS-03), `LIMITE_DE_CHAVES` (ACESSOS-06), `SLUG_EM_USO` (MCP-09).
- Lista vazia / paginada: Edge Cases (vazio; 50 por página com cursor).
- Envio duplicado: Edge Cases (cada criação é uma chave; botão travado).
- Falha de dependência: Edge Cases (503 sem service account; `FALHA_EXTERNA`).
- Outro tenant: não se aplica, o admin tem um dono só.

**UI (`/admin/mcp`)**

- Quantidade: 0, 1, poucas e 10 chaves (limite); acessos únicos muitos (tabela pagina em 10).
- Vazio: nenhuma chave, com a ação "Gerar chave"; nenhum acesso único, com "Criar acesso único"; atividade vazia.
- Dado parcial: acesso nunca usado mostra "Nunca usado" no último uso; atividade sem item mostra só a ação.
- Busca sem resultado: busca por nome/prefixo nas tabelas, "Nada encontrado para …" + "Limpar busca".
- Erro: mensagem fiel da rota, com "Tentar de novo", por bloco (tabela de chaves, tabela de únicos, atividade).
- Carregando: só o bloco que carrega; botões de criar/revogar/apagar com estado de envio.
- Segredo mostrado uma vez: dialog com copiar e aviso de que não será mostrado de novo.
- Celular e desktop.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CHAVE-01 | P1: Chave pessoal (AC1) | Design | Pending |
| CHAVE-02 | P1: Chave pessoal (AC2) | Design | Pending |
| CHAVE-03 | P1: Chave pessoal (AC3) | Design | Pending |
| MCP-04 | P1: Chave pessoal (AC4) | Design | Pending |
| MCP-05 | P1: Chave pessoal (AC5) | Design | Pending |
| MCP-06 | P1: Chave pessoal (AC6) | Design | Pending |
| MCP-07 | P1: Chave pessoal (AC7) | Design | Pending |
| MCP-08 | P1: Chave pessoal (AC8) | Design | Pending |
| MCP-09 | P1: Chave pessoal (AC9) | Design | Pending |
| MCP-10 | P1: Chave pessoal (AC10) | Design | Pending |
| MCP-11 | P1: Chave pessoal (AC11) | Design | Pending |
| MCP-12 | P1: Chave pessoal (AC12) | Design | Pending |
| MCP-13 | P1: Chave pessoal (AC13) | Design | Pending |
| MCP-14 | P1: Chave pessoal (AC14) | Design | Pending |
| MCP-15 | P1: Chave pessoal (AC15) | Design | Pending |
| ACESSOS-01 | P1: Gerenciar acessos (AC1) | Design | Pending |
| ACESSOS-02 | P1: Gerenciar acessos (AC2) | Design | Pending |
| ACESSOS-03 | P1: Gerenciar acessos (AC3) | Design | Pending |
| ACESSOS-04 | P1: Gerenciar acessos (AC4) | Design | Pending |
| ACESSOS-05 | P1: Gerenciar acessos (AC5) | Design | Pending |
| ACESSOS-06 | P1: Gerenciar acessos (AC6) | Design | Pending |
| ACESSOS-07 | P1: Gerenciar acessos (AC7) | Design | Pending |
| ACESSOS-08 | P1: Gerenciar acessos (AC8) | Design | Pending |
| UNICO-01 | P1: Uso único (AC1) | Design | Pending |
| UNICO-02 | P1: Uso único (AC2) | Design | Pending |
| UNICO-03 | P1: Uso único (AC3) | Design | Pending |
| UNICO-04 | P1: Uso único (AC4) | Design | Pending |
| UNICO-05 | P1: Uso único (AC5) | Design | Pending |
| UNICO-06 | P1: Uso único (AC6) | Design | Pending |
| IMG-01 | P2: Imagens (AC1) | Design | Pending |
| IMG-02 | P2: Imagens (AC2) | Design | Pending |
| IMG-03 | P2: Imagens (AC3) | Design | Pending |
| IMG-04 | P2: Imagens (AC4) | Design | Pending |
| IMG-05 | P2: Imagens (AC5) | Design | Pending |
| AUDIT-01 | P2: Auditoria (AC1) | Design | Pending |
| AUDIT-02 | P2: Auditoria (AC2) | Design | Pending |
| AUDIT-03 | P2: Auditoria (AC3) | Design | Pending |

**Coverage:** 37 total, 0 mapped to tasks, 37 unmapped (Tasks ainda não feito).

---

## Success Criteria

- [ ] Do zero a "livro criado pela LLM" em menos de 2 minutos: gerar chave, colar o comando, pedir.
- [ ] Chave revogada recebe 401 na chamada seguinte, em 100% dos casos testados.
- [ ] Nenhum documento do Firestore contém o segredo em texto puro.
