# Padrões de tRPC

## Stack

- tRPC 11 + TanStack Query 5
- Server-side caller para SSR
- HTTP batch link para client

## Estrutura

```
src/trpc/
├── init.ts         # Context e procedures base
├── server.ts       # Server-side caller e proxy
├── client.tsx      # Provider React (client component)
├── query-client.ts # Configuração QueryClient
└── routers/
    ├── _app.ts     # Root router (combina todos)
    └── leaderboard.ts # Router de leaderboard
```

## init.ts — Context e Procedures

```tsx
import { initTRPC } from "@trpc/server";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
```

## Criar um Novo Router

```tsx
// src/trpc/routers/example.ts
import { baseProcedure, createTRPCRouter } from "../init";

export const exampleRouter = createTRPCRouter({
  getOne: baseProcedure.query(async () => {
    // lógica de busca
    return data;
  }),
  
  create: baseProcedure.mutation(async ({ input }) => {
    // lógica de criação
    return result;
  }),
});
```

## Registrar Router no Root

```tsx
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../init";
import { exampleRouter } from "./example";
import { leaderboardRouter } from "./leaderboard";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
```

## server.ts — Server-side Caller

Para usar em Server Components (SSR):

```tsx
import "server-only";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export const caller = appRouter.createCaller(createTRPCContext);
```

## Uso em Server Components

```tsx
import { caller } from "@/trpc/server";

export async function MyServerComponent() {
  const stats = await caller.leaderboard.stats();
  return <div>{stats.total}</div>;
}
```

## Uso em Client Components

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function MyClientComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.leaderboard.stats.queryOptions());
  
  return <div>{data?.total}</div>;
}
```

## Regras

1. **Procedures** — usar `baseProcedure` para todas as procedures
2. **Routers** — um arquivo por domínio (ex: `leaderboard.ts`)
3. **Root router** — combinar todos os routers em `_app.ts`
4. **Type export** — sempre exportar `AppRouter` type do root
5. **Server-only** — `trpc/server.ts` importa `server-only` para evitar uso em client
6. **QueryClient** — usar `cache()` para singleton no server, lazy init no client
