# AGENTS.md

## Projeto

**devroast** — aplicação para avaliar código com sarcasmo.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript 5
- Tailwind CSS 4 (com `@theme` para variáveis)
- tRPC 11 + TanStack Query 5
- Drizzle ORM + PostgreSQL 16
- Fonte: JetBrains Mono (via `next/font/google`)

## Estrutura

```
src/
├── app/                # Rotas e páginas (App Router)
│   ├── layout.tsx      # Root layout com Navbar + TRPCReactProvider
│   ├── page.tsx        # Homepage (code editor + leaderboard preview)
│   ├── globals.css     # @theme com variáveis de cor
│   ├── ui/             # Showcase de componentes (/ui)
│   ├── leaderboard/    # Página de leaderboard (/leaderboard)
│   ├── result/[id]/    # Resultado do roast (/result/:id)
│   └── api/trpc/       # API route tRPC (/api/trpc)
├── components/
│   ├── navbar.tsx      # Navbar (server component)
│   ├── code-editor.tsx # Editor com syntax highlight (client)
│   ├── roast-toggle.tsx# Toggle roast mode (client)
│   ├── stats.tsx       # Stats wrapper (server)
│   ├── stats-client.tsx# Stats com NumberFlow (client)
│   ├── code-submit-section.tsx # Seção de submit (client)
│   └── ui/             # Componentes genéricos (ver AGENTS.md local)
├── db/
│   ├── index.ts        # Conexão Drizzle
│   ├── schema.ts       # Tabelas PostgreSQL
│   ├── queries.ts      # Funções de query
│   └── seed.ts         # Seed de dados fake
├── hooks/
│   ├── use-shiki.ts    # Hook de syntax highlighting
│   └── use-language-detect.ts # Hook de detecção de linguagem
├── lib/
│   └── languages.ts    # Configuração de linguagens suportadas
└── trpc/
    ├── init.ts         # Context e procedures base
    ├── server.ts       # Server-side caller
    ├── client.tsx      # Provider React
    ├── query-client.ts # Configuração QueryClient
    └── routers/
        ├── _app.ts     # Root router
        └── leaderboard.ts # Router de leaderboard
```

## Padrões

### Convenções de Código

- **Named exports** — nunca `export default`
- **Componentes UI** — `forwardRef` + `displayName` (ver `src/components/ui/AGENTS.md`)
- **Props** — estender `HTMLAttributes` nativo, nomear `ComponentNameProps`
- **Tailwind** — classes nativas (`bg-accent-green`), nunca CSS variables (`bg-[--var]`)
- **Tailwind-variants** — passar `className` para `tv()`, não usar `cn()`
- **cn()** — apenas para combinar classes fixas com `className` externo (sem `tv()`)
- **Client components** — `"use client"` apenas quando necessário (useState, useEffect, event handlers)
- **Ícones** — Lucide React
- **Imports** — usar alias `@/` para imports de `src/`
- **Formatação** — Biome com tabs, aspas duplas

### Cores (globals.css @theme)

```
accent-green: #10B981    accent-red: #EF4444    accent-amber: #F59E0B
bg-page: #0C0C0C         bg-surface: #171717    bg-input: #111111
text-primary: #E5E5E5    text-secondary: #A3A3A3  text-tertiary: #737373
border-primary: #1F1F1F  destructive: #FF5C33
```

### Comandos

```bash
npm run dev          # Desenvolvimento
npm run build        # Build
npm run lint         # ESLint
npm run db:generate  # Gerar migrations Drizzle
npm run db:migrate   # Aplicar migrations
npm run db:studio    # Drizzle Studio
npm run db:seed      # Popular banco com dados fake
```

### Documentação por Diretório

- `src/components/ui/AGENTS.md` — Padrões de componentes UI
- `src/app/AGENTS.md` — Padrões de rotas e páginas
- `src/trpc/AGENTS.md` — Padrões de tRPC
- `src/db/AGENTS.md` — Padrões de banco de dados
- `src/hooks/AGENTS.md` — Padrões de hooks
- `src/lib/AGENTS.md` — Padrões de utilitários
