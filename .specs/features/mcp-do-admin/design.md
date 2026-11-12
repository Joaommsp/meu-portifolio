# MCP do admin Design

**Spec**: `.specs/features/mcp-do-admin/spec.md`
**Mockup**: https://claude.ai/artifact/77Zt9rLm9jxZ96Rd5R8Pi8 (aprovado)
**Status**: Approved (03/11/2026)

---

## Abordagem

O ponto que decide a arquitetura: as regras de gravação vivem hoje em dois lugares presos ao navegador. As libs `src/lib/firebase/*.ts` usam o SDK cliente (que no Node trava, ver `rest.ts:4`, e passa pelas regras). A conversão de formulário para entrada (`toProjectInput`, `ProjectForm.tsx:168`) fica dentro dos componentes. O servidor do MCP não consegue reaproveitar nenhuma das duas.

| Abordagem | Como | Custo | Veredito |
| --------- | ---- | ----- | -------- |
| **A. Definição pura por recurso + dois adaptadores** | `src/lib/conteudo/<recurso>.ts` guarda schema, conversões e campos derivados (puros, sem SDK). O admin cliente e o repositório do servidor (firebase-admin) usam a mesma definição. | Mexe nas libs e nos formulários do admin (troca a regra inline por import) | **Recomendada**: regra num lugar só, como a spec pede |
| B. Repositório só do servidor, copiando as regras | Admin intocado; servidor reescreve `readingTime`, `publishedAt`, datas e slug | Menos arquivos agora | Duas cópias da regra divergem no primeiro ajuste |
| C. SDK cliente no servidor com token customizado | Servidor loga como admin e usa as libs atuais | Zero refatoração | SDK cliente no Node trava (`rest.ts:4`); descartada |

Segue a A.

## Architecture Overview

```mermaid
graph TD
  LLM[Cliente MCP] -->|POST Bearer| R[app/api/mcp/route.ts]
  R --> AU[acessos/autenticar: hash, situação, limite, ultimoUso]
  R --> SV[mcp/servidor: McpServer por requisição, ferramentas pelo escopo]
  SV --> CS[conteudo/servico: escopo, validação, slug, NAO_ENCONTRADO]
  CS --> DEF[lib/conteudo/recurso: schema, deDocumento, paraEntrada, derivados]
  CS --> REPO[server/conteudo/repositorio: firebase-admin]
  SV --> IMG[server/imagem: Cloudinary por URL ou data URI]
  SV --> AUD[acessos/auditoria]
  ADM[/admin/mcp tela] -->|ID token| RA[app/api/admin/mcp/*]
  RA --> GA[server/admin-auth: verifyIdToken + ADMIN_UID]
  RA --> AC[acessos/servico: criar, revogar, encerrar, apagar, listar]
  FORM[Formulários do admin] --> DEF
  LIB[lib/firebase/* SDK cliente] --> DEF
```

---

## Code Reuse Analysis

| Existente | Onde | Uso |
| --------- | ---- | --- |
| Schemas de post, projeto, game, livro | `src/lib/validations.ts:60,89,159,211` | Viram o `schema` da definição; os de figma, uses, atualmente e jogando nascem no mesmo arquivo |
| `toProjectInput` e os equivalentes dos outros formulários | `src/components/admin/*Form.tsx` | Saem do componente para `paraEntrada` da definição; o formulário importa |
| `estimateReadingTime`, regra de `publishedAt` | `src/lib/firebase/posts.ts:28,110-146` | Vira `derivados(entrada, atual)` puro em `lib/conteudo/posts.ts` |
| Constantes de enum (status, categorias, slots) | `src/types/*.ts` | Enum do schema e do `descrever_recurso`, sem cópia |
| `normalizarItens`, `EMPTY_*` | `src/types/uses.ts`, `currently.ts` | Leitura saneada no servidor |
| Formatos de imagem aceitos | `src/lib/cloudinary.ts:41` | Extrair `ALLOWED_TYPES` para constante compartilhada; servidor usa a mesma |
| `isAdminUid` / `ADMIN_UID` | `src/lib/firebase/auth.ts:46`, `config.ts:26` | Mesma comparação no servidor (`ADMIN_UID` do servidor, fallback no público) |
| `EstadoListagem` | `src/components/listagem/EstadoListagem.tsx` | Vazio, busca sem resultado, erro e carregando das tabelas e da atividade |
| shadcn `table`, `tabs`, `dialog`, `select`, `checkbox`, `tooltip`, `skeleton`, `textarea` | `src/components/ui/` | Tela inteira, nada nativo |
| Item de navegação | `src/components/admin/AdminSidebar.tsx:34-76` | Entrada "MCP" com ícone `Plug` |

### Integration Points

| Sistema | Como |
| ------- | ---- |
| Firestore | firebase-admin (ignora regras) nas coleções de conteúdo existentes + `mcpAcessos`, `mcpAuditoria`, `mcpLimite` novas |
| Regras do Firestore | `firestore.rules` ganha `match /mcpAcessos|mcpAuditoria|mcpLimite/{id} { allow read, write: if false; }` |
| Cloudinary | `POST /v1_1/<cloud>/image/upload` do servidor com o preset unsigned já usado (`file` = URL ou data URI) |
| Vercel | Env novas: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_UID`, `MCP_PUBLIC_URL` (opcional; senão deriva da requisição) |

---

## Components

### Definição de recurso (puro, cliente e servidor)
- **Purpose**: tudo o que é regra de um recurso, sem SDK.
- **Location**: `src/lib/conteudo/{projetos,posts,livros,games,figma,uses,atualmente,jogando}.ts` + `src/lib/conteudo/index.ts` (registro `RECURSOS`)
- **Interfaces**:
  - `colecao: string`, `ordem: { campo, direcao }`, `temSlug: boolean`, `unico: boolean` (atualmente)
  - `schema: ZodType<Valores>` (o do formulário)
  - `deDocumento(dados): Valores`: documento lido para a forma do formulário (datas em `YYYY-MM-DD`, `null` vira `""` onde o form espera)
  - `paraEntrada(valores): Entrada`: forma do formulário para o que se grava (datas como `Date`)
  - `derivados?(entrada, atual | null): Campos`: só posts (`readingTime`, `publishedAt: "agora" | null | mantém`)
  - `descricao: string`: texto curto para `descrever_recurso`
- **Reuses**: schemas de `validations.ts`, constantes de `types/`.

### Repositório de conteúdo (servidor)
- **Purpose**: ler e gravar qualquer recurso com firebase-admin a partir da definição.
- **Location**: `src/server/conteudo/repositorio.ts`
- **Interfaces**: `listar(recurso, { cursor?, limite: 50 })`, `obter(recurso, id)`, `criar(recurso, entrada)`, `atualizar(recurso, id, entrada)`, `apagar(recurso, id)`, `slugEmUso(recurso, slug, exceto?)`. Converte `Date` em `Timestamp`, `"agora"` em `FieldValue.serverTimestamp()`, e devolve JSON com datas ISO.
- **Dependencies**: `src/server/firebase-admin.ts` (init único com `getApps()`, `cert`, `\\n` da chave).

### Serviço de conteúdo (servidor)
- **Purpose**: regra das ferramentas: escopo, merge do parcial, validação, slug, erros de domínio.
- **Location**: `src/server/conteudo/servico.ts`
- **Interfaces**: `executar(acao, recurso, args, escopo) → Resultado | ErroDominio`. `atualizar` lê o atual, `deDocumento`, mescla o parcial, valida o schema inteiro (os `refine` de data valem) e grava. Erros: `NAO_ENCONTRADO`, `SLUG_EM_USO`, `ACAO_INVALIDA`, `FORA_DO_ESCOPO`, `VALIDACAO` (com campo → mensagem), `FALHA_EXTERNA`.

### Acessos (servidor)
- **Purpose**: ciclo de vida das chaves e acessos únicos.
- **Location**: `src/server/mcp/acessos/{segredo,situacao,servico,repositorio,auditoria,limite}.ts`
- **Interfaces**:
  - `gerarSegredo(tipo) → { segredo, hash, prefixo }`: `pf_pk_`/`pf_uu_` + `randomBytes(32).toString("base64url")`; `hash` = sha256 hex.
  - `situacao(acesso, agora) → "ativo" | "revogado" | "encerrado" | "vencido"` (pura).
  - `autenticar(bearer, agora) → Acesso | null`: get por hash, `situacao === "ativo"`, limite por minuto, `ultimoUsoEm` se > 60 s.
  - `criarChave({ nome, validadeDias = 90 })`, `criarUnico({ recurso, itemId?, acoes, tarefa })`, `revogar(id)`, `encerrar(id)`, `apagar(id)`, `listar()`, `atividade(20)`.
  - `consumirLimite(id, agora) → boolean`: transação em `mcpLimite/{id}_{minuto}`; campo `expiraEm` para TTL do Firestore.

### Servidor MCP
- **Purpose**: montar o `McpServer` da requisição conforme o escopo e responder.
- **Location**: `src/server/mcp/servidor.ts`, `src/server/mcp/ferramentas.ts`, `src/server/mcp/instrucoes.ts`
- **Interfaces**: `criarServidor(acesso) → McpServer` com `instructions`; registra só as ferramentas do escopo (UNICO-03). Cada ferramenta chama o serviço de conteúdo e grava auditoria nas de escrita.
- **Dependencies**: `@modelcontextprotocol/server` 2.x (`McpServer`, `WebStandardStreamableHTTPServerTransport`, zod 4).

### Rota MCP
- **Location**: `src/app/api/mcp/route.ts` (`runtime = "nodejs"`, `maxDuration = 60`)
- **Fluxo**: `POST` → corpo > 4 MB? 413 → `autenticar` (401 com `Acesso inválido ou expirado.` / 429) → `criarServidor` → transporte stateless (`sessionIdGenerator: undefined`, `enableJsonResponse: true`) → `handleRequest(req, { authInfo })`. `GET`/`DELETE` → 405. Sem service account → 503.

### Imagem (servidor)
- **Location**: `src/server/imagem.ts`
- **Interfaces**: `subirImagem({ url } | { base64, tipo })`: valida exclusividade, tipo e 3 MB decodificados; manda ao Cloudinary; devolve `{ url, largura, altura, bytes }`.

### Auth do admin (servidor)
- **Location**: `src/server/admin-auth.ts`
- **Interfaces**: `exigirAdmin(req) → uid | Response(401|403)`: `Authorization: Bearer <idToken>`, `verifyIdToken`, compara com `ADMIN_UID`.

### Rotas de gestão
- `src/app/api/admin/mcp/acessos/route.ts`: `GET` lista; `POST` cria (`tipo: "pessoal" | "unico"`); 201 com `{ acesso, segredo, prompt? }`.
- `src/app/api/admin/mcp/acessos/[id]/route.ts`: `DELETE` (409 `ACESSO_ATIVO`, 404).
- `src/app/api/admin/mcp/acessos/[id]/revogar/route.ts`, `.../encerrar/route.ts`: `POST`.
- `src/app/api/admin/mcp/atividade/route.ts`: `GET` 20 últimas.
- Erro em JSON `{ codigo, mensagem, campos? }`; 400 por campo vem do zod.

### Configuração e prompt (puro)
- **Location**: `src/lib/mcp/conexao.ts`
- **Interfaces**: `CLIENTES_MCP` (6), `configuracaoDoCliente(cliente, nome, url, segredo) → string`, `promptDeUsoUnico({ url, segredo, recurso, acoes, tarefa, venceEm }) → string`. Puro para teste e para a tela.

### Tela `/admin/mcp`
- **Location**: `src/app/admin/mcp/page.tsx` + `src/components/admin/mcp/{NovaConexao,ChavePessoalForm,UsoUnicoForm,SegredoDialog,TabelaAcessos,AtividadeRecente,EnderecoMcp,ConfirmarAcao}.tsx` (arquivos planos numa pasta da feature, como o resto de `components/admin`; ver Tech Decisions)
- **Dados**: `src/lib/admin-api/mcp.ts` (fetch com ID token do `auth.currentUser`) → hook `useAcessosMcp` (carregando, erro fiel, recarregar). Componentes visuais recebem dado pronto.
- **Reuses**: shadcn, `EstadoListagem`, `sonner` para toasts.

---

## Data Models

```typescript
// mcpAcessos/{hash}
interface AcessoDoc {
  tipo: "pessoal" | "unico"
  prefixo: string            // "pf_pk_q8Xw"
  nome: string | null        // pessoal
  tarefa: string | null      // único
  escopo: { recurso: Recurso; itemId: string | null; acoes: ("ler" | "criar" | "editar")[] } | null // único
  criadoEm: Timestamp
  expiraEm: Timestamp
  revogadoEm: Timestamp | null
  encerradoEm: Timestamp | null
  ultimoUsoEm: Timestamp | null
}

// mcpAuditoria/{auto}
interface AuditoriaDoc {
  em: Timestamp
  acessoId: string
  prefixo: string
  acao: "chave_criada" | "unico_criado" | "revogado" | "encerrado" | "apagado" | "criar" | "atualizar" | "apagar" | "subir_imagem"
  recurso: Recurso | null
  itemId: string | null
}

// mcpLimite/{acessoId}_{minutoEpoch}
interface LimiteDoc { contagem: number; expiraEm: Timestamp }

type Recurso = "projetos" | "posts" | "livros" | "games" | "figma" | "uses" | "atualmente" | "jogando"
```

`Recurso` mapeia para as coleções atuais (`projects`, `posts`, `books`, `games`, `figma`, `uses`, documento de `currently`, `playing`); o nome em PT é só a face do MCP.

---

## Error Handling Strategy

| Cenário | Tratamento | O que o usuário vê |
| ------- | ---------- | ------------------ |
| Bearer ausente, inexistente, revogado, encerrado, vencido | 401 único | Cliente MCP: `Acesso inválido ou expirado.` |
| 121ª chamada no minuto | 429 | Cliente MCP tenta depois |
| Erro de domínio na ferramenta | `isError: true`, texto `CODIGO: mensagem` (+ campos) | LLM corrige e tenta de novo |
| Firestore/Cloudinary fora | `FALHA_EXTERNA` na ferramenta; 503 na rota de admin | Mensagem própria, sem stack |
| Service account ausente | 503 `Servidor MCP não configurado.` | Tela mostra o erro no bloco |
| Corpo > 4 MB | 413 | LLM orientada a usar `url` |
| Rota de admin sem token / outro uid | 401 / 403 | Tela volta ao login (401) ou mostra o motivo (403) |
| Apagar ativo / 11ª chave | 409 `ACESSO_ATIVO` / `LIMITE_DE_CHAVES` | Toast com a mensagem do servidor |

---

## Risks & Concerns

| Concern | Location | Impact | Mitigation |
| ------- | -------- | ------ | ---------- |
| Regra de gravação dentro dos formulários e das libs cliente | `ProjectForm.tsx:168`, `posts.ts:110-146` | MCP e admin divergem | Abordagem A: extrair para `lib/conteudo`; formulários e libs importam |
| firebase-admin ignora as regras do Firestore | servidor inteiro | Escopo mal checado grava fora do permitido | Escopo aplicado no serviço antes de qualquer leitura/gravação; teste por ação fora do escopo (UNICO-04) |
| `firebase-admin` 14 e Vitest 5 exigem Node 22+ | `package.json` sem `engines` | Build na Vercel quebra em Node 20 | Fixar `engines.node >= 22` e conferir a versão no projeto da Vercel (local é 24) |
| Rate limit gasta 1 transação por chamada | `mcpLimite` | Custo de escrita no Firestore | 120/min é teto de abuso, não de uso; TTL no `expiraEm` (João liga a política no console) |
| Repo sem runner de teste | `package.json` | Sem gate por task | Task 1 instala Vitest + `vite-tsconfig-paths` e script `test` |
| Formulários de figma/uses/jogando/atualmente validam só o título | `src/app/admin/figma/page.tsx:89` etc. | Schema novo pode recusar o que hoje passa | Schemas novos com limites folgados; dados atuais conferidos contra eles na task (leitura) |
| Transporte exige `Accept` com JSON e SSE | SDK, `webStandardStreamableHttp.js:185` | `curl` do prompt recebe 406 | O `curl` do prompt manda os dois `Accept` |
| `tsconfig.tsbuildinfo` e capturas soltas | raiz | Commit sujo | Fora do escopo; não commitar |

---

## Testes

- **Unit (Vitest, node):** definições (`schema`, `deDocumento`/`paraEntrada` ida e volta, `derivados` de posts), `segredo`, `situacao`, `conexao` (configs e prompt), `imagem` (validações), serviço de conteúdo e de acessos com repositório em memória.
- **Integração da rota:** `POST /api/mcp` chamando o `route.ts` com `Request` real e repositórios em memória (injetados por módulo), exercitando initialize, tools/list por escopo, tools/call, 401/405/413/429.
- **Contrato com o Firestore:** um script de teste rodado 1× no fim contra o projeto real (coleção de teste `mcpTeste_*`, apagada ao fim), porque não há emulador (exige Java) e mock escrito à mão não prova o firebase-admin.
- **e2e:** 1× no fim, Playwright em `/admin/mcp` (gerar chave, copiar, revogar) + `claude mcp add` real criando um item.

---

## Tech Decisions

| Decisão | Escolha | Por quê |
| ------- | ------- | ------- |
| SDK MCP | `@modelcontextprotocol/server` 2.x direto, sem `mcp-handler` | Bearer estático não precisa do encanamento OAuth; uma dependência a menos |
| Resposta do transporte | `enableJsonResponse: true` | Stateless e sem streaming: JSON simples, cabe no limite da Vercel |
| ID do acesso | sha256 do segredo como ID do documento | Get direto na autenticação; o hash não autentica ninguém |
| Pastas | `src/lib/conteudo`, `src/server/*`, `src/components/admin/mcp/` | O repo não usa `src/features/`; segue o plano existente (`components/admin`, `lib/*`). `server/` marca o que só roda no servidor (`import "server-only"`) |
| Datas no MCP | `YYYY-MM-DD` na entrada (como o form), ISO na saída | Mesmo formato do formulário; a LLM escreve sem fuso |
| Paginação do `listar` | 50 por página, cursor = id do último | Firestore `startAfter` por snapshot |

> AD a registrar no STATE.md ao aprovar: AD-001 (definição de recurso pura compartilhada entre admin e servidor), AD-002 (`src/server/` + `server-only` para código só de servidor).
