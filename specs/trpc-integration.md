# Spec: tRPC Integration

## Contexto

Camada de API type-safe para substituir chamadas HTTP manuais. tRPC + TanStack React Query integrado com SSR do Next.js App Router.

Decisões:
- Usar `@trpc/tanstack-react-query` (novo client, não o classic)
- Sem `superjson` — não temos tipos complexos (Date, Map, etc) que precisem de transformação
- SSR via `prefetch` em server components + `HydrationBoundary`
- Router organizado por domínio (submissions, leaderboard)
- Caller direto para server components que precisam do dado sem hydration

## Stack

| Pacote | Uso |
|---|---|
| `@trpc/server` | Router, procedures, context |
| `@trpc/client` | Cliente HTTP (batch link) |
| `@trpc/tanstack-react-query` | Integração React Query (useTRPC, createTRPCOptionsProxy) |
| `@tanstack/react-query` | Cache e estado do cliente |
| `zod` | Validação de input nas procedures |
| `server-only` | Garante que módulos de servidor não sejam importados no client |

## Estrutura de arquivos

```
src/
├── trpc/
│   ├── init.ts              # initTRPC, context, baseProcedure
│   ├── query-client.ts      # makeQueryClient factory
│   ├── client.tsx           # TRPCReactProvider (client component)
│   ├── server.ts            # getQueryClient, trpc proxy, HydrateClient, prefetch, caller
│   └── routers/
│       ├── _app.ts          # appRouter (merge dos routers)
│       ├── submission.ts    # submissionRouter
│       └── leaderboard.ts   # leaderboardRouter
├── app/
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts # fetchRequestHandler (GET + POST)
│   └── layout.tsx           # TRPCReactProvider no root layout
```

## Procedures

### submissionRouter

| Procedure | Tipo | Input | Output | Descrição |
|---|---|---|---|---|
| `create` | mutation | `{ code, language, lineCount, roastMode }` | `{ id }` | Cria submissão |
| `get` | query | `{ id: uuid }` | submission + issues + fixes | Resultado completo |
| `getIssues` | query | `{ id: uuid }` | issues[] | Apenas issues |
| `getFixes` | query | `{ id: uuid }` | fixes[] | Apenas fixes |

### leaderboardRouter

| Procedure | Tipo | Input | Output | Descrição |
|---|---|---|---|---|
| `list` | query | `{ limit? }` | submissions[] | Ranking por score |
| `stats` | query | — | `{ totalSubmissions, avgScore }` | Estatísticas agregadas |

## Padrão de SSR

### Server component (prefetch)

```tsx
// app/leaderboard/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import { LeaderboardClient } from './leaderboard-client';

export default async function LeaderboardPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.leaderboard.list.queryOptions({ limit: 20 }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeaderboardClient />
    </HydrationBoundary>
  );
}
```

### Client component (consume)

```tsx
// app/leaderboard/leaderboard-client.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function LeaderboardClient() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.leaderboard.list.queryOptions({ limit: 20 }));
  // data está type-safe e hidratada do servidor
}
```

### Server component (caller direto, sem hydration)

```tsx
// app/result/[id]/page.tsx
import { caller } from '@/trpc/server';

export default async function ResultPage({ params }) {
  const { id } = await params;
  const submission = await caller.submission.get({ id });
  // renderiza diretamente no server, sem client component necessário
}
```

## Provider no layout

```tsx
// src/app/layout.tsx
import { TRPCReactProvider } from '@/trpc/client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

## API route

```tsx
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

## To-dos

### Setup

- [ ] Instalar: `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `server-only`, `client-only`
- [ ] Criar `src/trpc/init.ts` com `initTRPC`, `createTRPCContext`, `baseProcedure`
- [ ] Criar `src/trpc/query-client.ts` com `makeQueryClient`
- [ ] Criar `src/trpc/client.tsx` com `TRPCReactProvider`
- [ ] Criar `src/trpc/server.ts` com `getQueryClient`, `trpc`, `HydrateClient`, `prefetch`, `caller`
- [ ] Criar `src/app/api/trpc/[trpc]/route.ts` com fetch adapter

### Routers

- [ ] Criar `src/trpc/routers/submission.ts` com procedures `create`, `get`, `getIssues`, `getFixes`
- [ ] Criar `src/trpc/routers/leaderboard.ts` com procedures `list`, `stats`
- [ ] Criar `src/trpc/routers/_app.ts` com merge dos routers

### Integração

- [ ] Adicionar `TRPCReactProvider` no `src/app/layout.tsx`
- [ ] Refatorar `src/app/page.tsx` para usar tRPC (submit mutation, stats query)
- [ ] Refatorar `src/app/leaderboard/page.tsx` para prefetch + hydration
- [ ] Refatorar `src/app/result/[id]/page.tsx` para usar caller direto

### Validação

- [ ] Rodar `npm run lint` e `npm run build`
