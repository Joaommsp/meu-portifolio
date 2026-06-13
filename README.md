# João Marcos · Portfolio

> Portfólio pessoal em **Next.js 16**, **Tailwind v4** e **Firebase**.
> Dark-only com 8 cores de destaque trocáveis ao vivo, CMS próprio para blog/projetos/games/livros, integrações em tempo real (GitHub, WakaTime, Spotify) e um foco real em interface, motion e responsividade.

**Live:** [joaomarcos.dev](https://joaomarcos.dev)
**Stack:** Next.js · TypeScript · Tailwind v4 · shadcn/ui (Base UI) · Firebase · Cloudinary · Motion · Recharts

---

## ✨ Destaques

- 🎨 **8 accents trocáveis ao vivo** com transição suave (OKLCH + `@property`)
- 🌑 **Dark-only premium** com 6 backgrounds composáveis (Grid, Orbs, Beams, Particles, Noise, Dots)
- 🎬 **Hero com vídeo scroll-scrub** (frames sincronizados ao scroll) no desktop — desativado no mobile pra poupar banda/bateria
- 🖱️ **Custom cursor** com spring physics e estados de hover
- 🧩 **Seção "Sobre" em carousel** (4 slides) com gráfico interativo de **storytelling de dados** (Recharts: barras/linhas/área + tooltip de variação)
- 🔗 **Prévia de link própria** — chip flutuante no rodapé central no lugar do status bar nativo
- 📝 **CMS completo** no `/admin`: CRUD de posts, projetos, games e livros — MarkdownEditor com preview, ImageUploader (Cloudinary), galeria multi-upload, auto-save e validação Zod
- 📊 **Integrações ao vivo**: contribuições e repositórios do **GitHub**, estatísticas de código do **WakaTime**, faixa tocando agora no **Spotify**
- 💬 **Guestbook** com login Google (Firebase Auth)
- 📅 Páginas **/now**, **/uses** e **/recap/[ano]** (retrospectiva anual)
- ⌨️ **Command palette** (⌘K) e easter egg do Konami
- 🔍 **SEO completo**: sitemap dinâmico, robots, JSON-LD (Article, CreativeWork, Person), OG images dinâmicas por rota
- 📱 **PWA**: manifest + ícones
- ♿ **Acessibilidade**: skip-to-content, ARIA, navegação por teclado, `prefers-reduced-motion` respeitado em todas as animações
- ⚡ **Responsivo de verdade**, mobile-first, validado a partir de 360px

---

## 📦 Stack técnica

| Área | Tech |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Linguagem | **TypeScript** strict (`noUncheckedIndexedAccess`) |
| Estilo | **Tailwind CSS v4** com `@theme inline` + OKLCH |
| Componentes | **shadcn/ui** preset `base-nova` (com `@base-ui/react`) |
| Animação | **Motion v12** (sucessor do framer-motion) + **Lenis** (smooth scroll) |
| Gráficos | **Recharts 3** |
| Backend | **Firebase 12** (Firestore + Auth) — SDK modular |
| Imagens | **Cloudinary** (free tier, sem cartão) |
| Forms | **react-hook-form** + **Zod v4** |
| Markdown | **react-markdown** + **remark-gfm** + **`@tailwindcss/typography`** |
| Ícones | **lucide-react** + brand/tech SVGs inline |

---

## 🚀 Quick start

```bash
git clone <repo-url>
cd portfolio
npm install
cp .env.example .env.local   # preencha as variáveis (abaixo)
npm run dev                  # http://localhost:3001
```

> O dev server roda na **porta 3001** (`next dev -p 3001`).

### Popular com dados de exemplo (opcional)
1. Acesse `/admin/login` e entre com a conta admin (criada no Firebase Auth).
2. Use o botão **"Popular com exemplo"** no onboarding do painel.

---

## 🔧 Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
# Firebase (obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_UID=          # UID da conta admin (Firebase Auth → Users)

# Cloudinary (upload de imagens — obrigatório pro admin)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=   # precisa estar em modo Unsigned
NEXT_PUBLIC_CLOUDINARY_FOLDER=portfolio

# Spotify (opcional — seção "tocando agora")
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

# WakaTime (opcional — estatísticas de código)
WAKATIME_API_KEY=
```

> Integrações opcionais degradam com elegância: se Spotify/WakaTime/GitHub falharem ou não estiverem configurados, as seções simplesmente **não renderizam** (sem quebrar a página).

### Setup rápido dos serviços
- **Firebase**: crie o projeto, habilite **Firestore** e **Authentication** (E-mail/senha + Google p/ o guestbook). Adicione um Web App e copie o config. Crie sua conta admin e use o UID em `NEXT_PUBLIC_ADMIN_UID`.
- **Cloudinary**: free tier (25GB, sem cartão). Crie um **upload preset Unsigned**.
- **Spotify**: registre um app no dashboard, gere o `refresh_token` com escopo `user-read-currently-playing`.
- **WakaTime**: copie a API key do perfil.

---

## 🔒 Firestore Security Rules

As rules em `firestore.rules` garantem:
- ✅ Visitantes anônimos leem só conteúdo público (`published: true`)
- ✅ Admin (UID específico) tem CRUD total
- ✅ Guestbook: qualquer usuário autenticado pode assinar; ninguém edita assinatura alheia
- ❌ Resto negado por padrão (defense in depth)

Troque o UID em `isAdmin()` pelo seu e publique em **Firebase Console → Firestore → Rules**.

---

## 📁 Estrutura

```
src/
├── app/
│   ├── (public)/              ← rotas públicas (Header + Footer + LinkPreview)
│   │   ├── page.tsx           ← home (Hero, Sobre/carousel, Skills, GitHub, WakaTime, Projetos, Blog, Games, Contato)
│   │   ├── sobre/             ← bio + skills + timeline + soft skills
│   │   ├── projetos/          ← lista + [slug]
│   │   ├── blog/              ← lista + [slug]
│   │   ├── games/             ← lista + [slug]
│   │   ├── livros/            ← lista + [slug]
│   │   ├── guestbook/         ← mural com login Google
│   │   ├── now/               ← /now (snapshot do momento)
│   │   ├── uses/              ← setup/ferramentas
│   │   ├── recap/[year]/      ← retrospectiva anual
│   │   └── contato/           ← form Zod + canais diretos
│   ├── admin/                 ← painel protegido (posts, projetos, games, books)
│   ├── api/spotify/           ← login, callback, now-playing
│   ├── layout.tsx · globals.css · sitemap.ts · robots.ts · opengraph-image.tsx
├── components/
│   ├── ui/                    ← shadcn (base-nova)
│   ├── layout/                ← Header, Footer, MobileNav, ThemeColorSwitcher, LinkPreview
│   ├── sections/              ← Hero, About (carousel), Skills, GithubSection, WakatimeStats, etc.
│   ├── charts/                ← DataStoryChart (Recharts)
│   ├── animations/            ← 7 primitivas reutilizáveis
│   ├── backgrounds/           ← 6 backgrounds composáveis
│   ├── admin/ · blog/ · projects/ · games/ · books/ · command/ · markdown/ · icons/
├── lib/
│   ├── firebase/              ← config, auth, posts, projects, games, books, guestbook, rest, seed
│   ├── data/                  ← camada unificada (REST + fallback)
│   ├── github.ts · wakatime.ts · spotify.ts · validations.ts · cloudinary.ts · nav.ts · utils.ts
├── contexts/ · hooks/ · types/
firestore.rules
```

---

## 🧠 Decisões técnicas

- **REST API do Firestore server-side** (`lib/firebase/rest.ts`) — o JS SDK trava em "offline mode" no Node do Next 16 (GRPC), então leituras públicas usam `fetch` direto.
- **Cloudinary no lugar do Firebase Storage** — Storage exige plano Blaze (cartão); Cloudinary tem 25GB grátis sem cartão.
- **Hero vídeo só no desktop** — o scroll-scrubbing e o `.mp4` não carregam no mobile (banda + bateria).
- **OKLCH + `@property`** — interpolação nativa de cor nas transições de accent, sem libs.
- **Degradação graciosa** — integrações externas que falham não derrubam a página.

---

## 📜 Scripts

```bash
npm run dev      # dev server (Turbopack) na porta 3001
npm run build    # build de produção
npm run start    # serve o build (porta 3001)
npm run lint     # ESLint
```

> Durante o desenvolvimento, valide tipos com `npx tsc --noEmit` — rodar `npm run build` com o `dev` ativo pode poluir o cache `.next` do Turbopack.

---

## 🚢 Deploy (Vercel)

1. Push do repo no GitHub → [vercel.com/new](https://vercel.com/new) → importar.
2. Cole as variáveis de ambiente + `NEXT_PUBLIC_SITE_URL=https://seu-dominio`.
3. Após o deploy: adicione o domínio em **Firebase Auth → Authorized domains** e nas **Allowed origins** do Cloudinary.

---

## 📝 Licença e uso

© 2026 João Marcos. **Todos os direitos reservados.**

Este é um projeto pessoal. O código está público para **visualização e como referência** — não é licenciado para cópia, redistribuição ou reuso do projeto (no todo ou em parte) sem autorização. Inspire-se à vontade, mas não clone.

---

Construído com ☕ em Paulo Afonso, BA.
