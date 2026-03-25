# Padrões de Rotas e Páginas

## Convenções Gerais

- **Layout** — Root layout (`layout.tsx`) envolve toda app com `TRPCReactProvider` + `Navbar`
- **Server Components** — páginas são server components por padrão, usar `"use client"` apenas quando necessário
- **Metadata** — exportar `metadata` ou `generateMetadata` para SEO
- **Estilização** — container principal com `main`, sections com `max-w-5xl`, gap-10 entre seções

## Estrutura de Rotas

```
src/app/
├── layout.tsx              # Root layout (Navbar + Providers)
├── page.tsx                # / — Homepage
├── globals.css             # Variáveis de tema @theme
├── ui/
│   └── page.tsx            # /ui — Showcase de componentes
├── leaderboard/
│   └── page.tsx            # /leaderboard — Página de ranking
├── result/
│   └── [id]/
│       └── page.tsx        # /result/:id — Resultado do roast
└── api/
    └── trpc/
        └── [trpc]/
            └── route.ts    # /api/trpc — API route do tRPC
```

## Template de Página

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "page title — devroast",
  description: "page description",
};

export default function PageName() {
  return (
    <main className="flex flex-col items-center px-20 py-10 gap-10">
      {/* sections with max-w-5xl */}
    </main>
  );
}
```

## Layout Root (`layout.tsx`)

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "devroast",
  description: "paste your code. get roasted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased bg-bg-page text-text-primary min-h-screen`}
      >
        <TRPCReactProvider>
          <Navbar />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

## Página com Dados Dinâmicos

Quando a página precisa buscar dados do servidor, usar Server Components com tRPC caller:

```tsx
import { caller } from "@/trpc/server";

export default async function PageName() {
  const data = await caller.routerName.procedureName();
  // renderizar com data
}
```

## Página com Parâmetros Dinâmicos

```tsx
export default async function PageName({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // usar id para buscar dados
}
```

## Componentes de Página

Componentes complexos em páginas podem ser divididos em componentes client separados:

```
src/app/example/
├── page.tsx        # Server component - busca dados
└── example-client.tsx  # Client component - interatividade
```

## Estilização de Páginas

- **Container principal**: `<main className="flex flex-col items-center px-20 py-10 gap-10">`
- **Seções**: `className="w-full max-w-5xl flex flex-col gap-6"`
- **Dividers**: `<div className="w-full max-w-5xl h-px bg-border-primary" />`
- **Títulos de seção**: `<h2 className="font-mono text-sm font-bold"><span className="text-accent-green">{"//"}</span> section_name</h2>`

## Convenções de Nomenclatura

- **Páginas**: nome em kebab-case no diretório (`leaderboard/page.tsx`)
- **Parâmetros dinâmicos**: `[param]` no nome do diretório
- **Metadata**: sempre exportar para SEO
- **Componentes de página**: nome do arquivo com sufixo `-section` ou `-client` quando separado

## Suspense + Loading States

Usar `<Suspense>` com skeletons para streaming de Server Components:

```tsx
import { Suspense } from "react";

<Suspense fallback={<LeaderboardSkeleton />}>
  <LeaderboardPreview />
</Suspense>
```

**Regra:** componente assíncrono dentro de `<Suspense>` precisa ser importado diretamente (não passado como prop/children de outro componente não-assíncrono).

## Queries em Paralelo com Promise.all

Quando um Server Component precisa de múltiplas queries, usar `Promise.all` para executar em paralelo e evitar waterfall:

```tsx
import { caller } from "@/trpc/server";

export async function MyComponent() {
  const [entries, stats] = await Promise.all([
    caller.leaderboard.getLeaderboard(),
    caller.leaderboard.stats(),
  ]);

  return (
    <>
      {/* renderizar entries */}
      {/* renderizar stats */}
    </>
  );
}
```

**Por que:** chamadas `await` sequenciais causam waterfall (cada uma espera a anterior terminar). `Promise.all` executa todas simultaneamente, reduzindo o tempo total de resposta.

**Quando usar:** sempre que um componente precisar de 2+ queries que não dependem uma da outra.
