# João Marcos · Portfolio

> Portfolio premium em **Next.js 16**, **Tailwind v4** e **Firebase**.
> Dark-only com 8 cores de destaque trocáveis ao vivo, custom cursor, admin completo pra blog e projetos.

**Live:** [joaomarcos.dev](https://joaomarcos.dev)
**Stack:** Next.js · TypeScript · Tailwind · shadcn/ui · Firebase · Cloudinary · Motion

---

## ✨ Features

- 🎨 **8 accents trocáveis ao vivo** com transição suave 300ms (OKLCH + `@property`)
- 🌑 **Dark-only premium** com 6 backgrounds composáveis (Grid, Orbs, Beams, Particles, Noise, Dots)
- 🖱️ **Custom cursor** com spring physics (ring + dot, 3 estados)
- 🎬 **7 primitivas de animação** (FadeIn, SlideIn, ScrollReveal, Parallax, MagneticButton, TextReveal, PageTransition) — todas respeitam `prefers-reduced-motion`
- 📝 **Admin completo**: CRUD posts/projetos, MarkdownEditor com preview, ImageUploader (Cloudinary), galeria multi-upload, auto-save 30s, validação Zod
- 🔍 **SEO completo**: sitemap dinâmico, robots, JSON-LD (Article, CreativeWork, Person, BreadcrumbList), OG/Twitter cards
- ♿ **Acessibilidade**: skip-to-content, ARIA, contraste WCAG, navegação por teclado
- ⚡ **Performance**: `next/image` AVIF/WebP, headers de segurança, Turbopack, REST API server-side (bypassa GRPC)
- 📱 **Mobile-first**: Sheet nav, drag-and-drop responsivo, touch-friendly

---

## 📦 Stack técnica

| Área | Tech |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** strict (`noUncheckedIndexedAccess`) |
| Styling | **Tailwind CSS v4** com `@theme inline` + OKLCH |
| Components | **shadcn/ui** preset `base-nova` (com `@base-ui/react`) |
| Animation | **Motion v12** (sucessor framer-motion) |
| Backend | **Firebase 12** (Firestore + Auth) — modular SDK |
| Images | **Cloudinary** (free tier, sem cartão) |
| Forms | **react-hook-form** + **Zod** v4 |
| Markdown | **react-markdown** + **remark-gfm** + **`@tailwindcss/typography`** |
| Icons | **lucide-react** + brand SVGs inline |

---

## 🚀 Quick start

### 1. Clone e instale
```bash
git clone <repo-url>
cd portfolio
npm install
```

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com) e crie um projeto novo
2. Habilite os serviços:
   - **Firestore Database** → "Iniciar no modo de teste"
   - **Authentication** → habilitar provedor "E-mail/senha"
3. Adicione um **Web App** (ícone `</>`) e copie o objeto `firebaseConfig`
4. Em **Authentication → Users → Adicionar usuário**, crie sua conta admin com email/senha. Copie o **UID** gerado.

### 3. Configurar Cloudinary

1. Cadastre-se em [cloudinary.com](https://cloudinary.com) (free tier 25GB, **sem cartão**)
2. Copie o **Cloud name** do dashboard
3. Vá em **Settings → Upload → Add upload preset**
   - Nome: `portfolio_unsigned`
   - **Signing Mode: Unsigned** ⚠️ (crítico)
   - Folder (opcional): `portfolio`

### 4. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=meu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=meu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=meu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef
NEXT_PUBLIC_ADMIN_UID=<UID-DA-CONTA-ADMIN>

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
NEXT_PUBLIC_CLOUDINARY_FOLDER=portfolio
```

### 5. Rodar local

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 6. Popular com dados de exemplo (opcional)

1. Acesse [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Entre com email/senha cadastrados
3. Click no botão **"Popular com exemplo"** no card de onboarding
4. Cria 3 posts + 3 projetos de exemplo

---

## 🔒 Firestore Security Rules

Por padrão o Firestore vem em **modo teste** (libera tudo até 30 dias). Antes de ir pra produção, atualize as rules:

1. Abra `firestore.rules` na raiz do repo
2. Substitua o UID na função `isAdmin()` pelo seu (mesmo de `NEXT_PUBLIC_ADMIN_UID`)
3. Cole o conteúdo em **Firebase Console → Firestore → Rules → Publish**

As rules garantem:
- ✅ Visitantes anônimos veem apenas posts com `published: true` e todos os projetos
- ✅ Admin (autenticado com UID específico) tem CRUD total
- ❌ Qualquer outro usuário é negado por default (defense in depth)

---

## 🚢 Deploy na Vercel

1. Push do repo pro GitHub
2. [vercel.com/new](https://vercel.com/new) → import o repo
3. Em **Environment Variables**, cole as 10 vars do `.env.local`
4. Adicione **`NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app`**
5. Deploy → segundos

### Configurações adicionais (após deploy)

- **Firebase Console → Authentication → Settings → Authorized domains**: adicione `<seu-dominio>.vercel.app` (e seu domínio custom se tiver)
- **Cloudinary → Upload preset → Allowed origins**: adicione seu domínio Vercel

---

## 📁 Estrutura

```
src/
├── app/
│   ├── (public)/              ← rotas públicas com Header + Footer
│   │   ├── page.tsx           ← home (Hero, About, Skills, Projects, Posts, CTA)
│   │   ├── sobre/             ← bio + skills + timeline + soft skills
│   │   ├── projetos/          ← lista + [slug] (SSR + JSON-LD)
│   │   ├── blog/              ← idem
│   │   └── contato/           ← form Zod + canais diretos
│   ├── admin/                 ← painel protegido (AuthGuard + Sidebar)
│   │   ├── posts/             ← CRUD posts
│   │   └── projetos/          ← CRUD projetos
│   ├── layout.tsx             ← root: providers + JSON-LD raiz
│   ├── globals.css            ← OKLCH + 8 accents + @property
│   ├── sitemap.ts             ← dinâmico
│   └── robots.ts
├── components/
│   ├── ui/                    ← shadcn (base-nova)
│   ├── layout/                ← Header, Footer, MobileNav, ThemeColorSwitcher, CustomCursor
│   ├── sections/              ← Hero, About, Skills, FeaturedProjects, etc.
│   ├── animations/            ← 7 primitivas reutilizáveis
│   ├── backgrounds/           ← 6 backgrounds composáveis
│   ├── admin/                 ← AuthGuard, AdminSidebar, *Form, ImageUploader, MarkdownEditor
│   ├── blog/                  ← PostCard, ShareButtons, BackToTop
│   ├── projects/              ← ProjectCard (com tilt 3D)
│   ├── markdown/              ← MarkdownContent
│   └── icons/                 ← brand-icons.tsx (5 socials) + tech-icons.tsx (12 techs)
├── lib/
│   ├── firebase/              ← config, auth, posts, projects, storage, rest, seed
│   ├── data/                  ← camada unificada (REST + mocks fallback)
│   ├── mocks/                 ← sample-data.ts pra dev sem Firestore
│   ├── utils.ts               ← cn, slugify, truncate
│   ├── nav.ts                 ← NAV_ITEMS, SOCIAL_LINKS
│   ├── validations.ts         ← schemas Zod (post, project, contact, login)
│   └── cloudinary.ts          ← upload XHR com progress
├── contexts/                  ← AuthContext, ThemeColorContext
├── hooks/                     ← useAuth, useThemeColor, usePrefersReducedMotion
├── types/                     ← Post, Project, PostInput, ProjectInput
└── styles/
firestore.rules                ← copy-paste no Firebase Console
```

---

## 🎨 Customização

### Trocar accent default
`src/contexts/ThemeColorContext.tsx`:
```ts
export const DEFAULT_ACCENT: Accent = "green"  // ← muda aqui
```

### Adicionar uma cor nova
1. Adicione em `ACCENTS` em `src/contexts/ThemeColorContext.tsx`
2. Defina o bloco `[data-accent="..."]` em `src/app/globals.css`
3. Adicione metadata em `src/components/layout/ThemeColorSwitcher.tsx`

### Trocar fontes
`src/app/layout.tsx` — substitua `Geist` por outra de `next/font/google`. Atualize as CSS vars em `globals.css` se renomear.

### Editar bio / sobre
- **Home About**: `src/components/sections/About.tsx`
- **Página Sobre**: `src/app/(public)/sobre/page.tsx` (timeline + skills + soft skills inline)

### Trocar foto de perfil
Substitua `https://github.com/Joaommsp.png` pelo URL da sua foto em:
- `src/components/sections/About.tsx`
- `src/app/(public)/sobre/page.tsx`

### Adicionar CV
Coloque seu PDF em `public/cv-joaomarcos.pdf` (ou ajuste o `href` do botão "Baixar CV" em `sobre/page.tsx`).

---

## 📜 Scripts

```bash
npm run dev      # dev server com Turbopack
npm run build    # build de produção
npm run start    # serve build de produção
npm run lint     # ESLint
```

---

## 🧠 Decisões técnicas

- **Next.js 16 + Turbopack** em vez de Next 15 — versão mais nova com estabilidade comparável; ganhamos build cache mais rápido e otimizações automáticas.
- **shadcn `base-nova`** (Base UI) em vez de Radix — preset novo que evita o overhead histórico do Radix; alguns componentes usam `render` prop em vez de `asChild`.
- **REST API do Firestore server-side** (`src/lib/firebase/rest.ts`) — o JS SDK trava em "offline mode" em Node.js do Next 16 (GRPC issue), então leituras públicas usam fetch direto.
- **Cloudinary em vez de Firebase Storage** — Storage agora exige plano Blaze (cartão obrigatório); Cloudinary tem 25GB grátis sem cartão.
- **Auto-slug + auto-save 30s** nos forms admin — pra perder zero rascunho mesmo se fechar a aba.
- **OKLCH + `@property`** — interpolação nativa de cor em transições, sem libs.

---

## 🛠️ Troubleshooting

### "Firebase não configurado" no admin
- Confira que todas as 7 vars `NEXT_PUBLIC_FIREBASE_*` + `NEXT_PUBLIC_ADMIN_UID` estão preenchidas
- Reinicie o dev server (env vars só carregam no boot)

### Login falha com "auth/invalid-credential"
- Confira o email/senha no Firebase Console → Authentication → Users
- Use **Reset password** no console se necessário

### Upload retorna "Cloudinary não configurado"
- Confira `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` e `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- O preset DEVE estar em modo **Unsigned**

### Posts criados mas /blog/<slug> dá 404
- O post precisa ter `published: true`
- Aguarde a página revalidar (server component) ou force F5

### Hydration mismatch warnings
- Se usou um theme switcher externo, pode estar mexendo em `data-accent` antes da hydratação
- Adicione `suppressHydrationWarning` se necessário

---

## 📝 License

MIT — fork e adapte. Crédito ao João Marcos é apreciado mas não exigido.

---

Construído com ☕ em Paulo Afonso, BA · 2026
