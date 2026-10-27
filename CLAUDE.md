@AGENTS.md

# Portfolio - site pessoal do João Marcos

Portfólio público (home em pilha, projetos, blog, livros, games, serviços, GitHub,
Behance) com painel `/admin` que publica o conteúdo. Em produção na Vercel
(`*-jmmsp.vercel.app`), repo `Joaommsp/meu-portifolio`.

## Stack
- Next 16.2 (App Router) + React 19.2, Tailwind v4, shadcn sobre `@base-ui/react`.
  Tokens e utilitários próprios (`fundo-pagina`, `folha-conteudo`) em `src/app/globals.css`.
- **Dados:** Firestore + Auth (`src/lib/firebase/`), leitura pública por REST
  (`src/lib/firebase/rest.ts`), imagens no Cloudinary. Admin = `NEXT_PUBLIC_ADMIN_UID`.
- **Movimento:** `motion` + Lenis (`SmoothScrollProvider`, dono da posição de scroll).
- **APIs externas no servidor:** Spotify (`src/app/api/spotify`), WakaTime, GitHub.
- Sem testes automatizados e sem CI.

## Comandos
| Para | Comando |
| --- | --- |
| Dev (porta 3001) | `npm run dev` |
| Typecheck + lint | `npx tsc --noEmit -p . && npx eslint <arquivos tocados>` |
| Cor de accent CSS x TS + contraste | `npm run check:accents` |
| Reencodar o vídeo do hero | `npm run reencode-hero` |

Validação = typecheck + lint (+ `check:accents` se mexeu em cor). Build de verdade é
o da Vercel; não rodar `next build` com o dev de pé.

## Exceções ao global
- **Pastas:** não há `src/features/`. Componentes por domínio em
  `src/components/<dominio>/` (`sections`, `layout`, `projects`, `admin`...), acesso a
  dados em `src/lib/firebase/<recurso>.ts`, conteúdo fixo em `src/lib/*-content.ts`.
  Seguir o que existe; não migrar por conta própria.
- **Carregamento:** esqueleto (`components/ui/skeleton`, `*CardSkeleton`).
- **Branch:** `master`, deploy automático da Vercel. Commit e push só com pedido.

## Regras deste repo
### Mobile e desempenho
- **Nada de efeito por frame em camada grande no toque.** A home empilha 11 camadas
  sticky de milhares de px; `scale`/opacidade animados nelas e `backdrop-blur` fixo
  por cima estouraram a composição do Android (scroll travando, tela sem pintar,
  26/10/2026). No toque (`useToque` / variante `pointer-coarse:`) sai o efeito e
  fica o layout. Cobrada por: item de revisão.
- **Blur só em área pequena.** Overlay de tela cheia com `backdrop-blur` sobre a
  pilha trava no celular. Ainda pendentes: `ui/dialog.tsx` e `CommandPalette`.
- **Rolar por código passa pelo `useRolarPara`.** Com Lenis ativo,
  `window.scrollTo` é desfeito no frame seguinte.
- **`overflow-x: clip`, nunca `hidden`** no html/body: `hidden` quebra o sticky
  da pilha.

### Conteúdo e rotas
- **Rota de conteúdo do admin é `force-dynamic`.** Com `generateStaticParams` sem
  isso, todo slug criado depois do deploy dava 500 na página pública (commit
  `1caaffc`). Cobrada por: item de revisão.
- **Cor de accent mora em dois lugares** (`globals.css` `[data-accent]` e
  `src/lib/accent-colors.ts`). Cobrada por: `npm run check:accents`.
- Segredo só sem `NEXT_PUBLIC_` (Spotify, WakaTime). As chaves do Firebase são
  públicas por natureza; a proteção é `firestore.rules`.

## Firebase compartilhado
O projeto Firebase `meu-portfolio-377aa` é usado por este portfólio e por outros sites
(ex.: o de Kércia Keylla). Publicar as regras (Firestore/Storage) de um sobrescreve as
do outro: antes de `firebase deploy --only firestore:rules`/`storage`, juntar as regras
dos dois sites no mesmo arquivo.

## O que existe fora do repo (não entra em busca-e-troca)
| Nome | Onde | O que quebra ao trocar |
| --- | --- | --- |
| `meu-portfolio-377aa` | projeto Firebase | site perde o banco; regras compartilhadas |
| coleções em `src/lib/firebase/*.ts` | Firestore | conteúdo publicado some do site |
| `portfolio:accent` | localStorage | cor escolhida pelo visitante volta ao padrão |
| variáveis do `.env.example` | Vercel | build/produção sem Firebase, Spotify, WakaTime |

## Estado
Sem `.specs/` ainda. Quando a primeira feature passar pelo /tlc-spec-driven,
decisões e Handoff ficam em `.specs/STATE.md`; retomar = ler só o `## Handoff`.
