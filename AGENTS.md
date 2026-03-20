# AGENTS.md

## Projeto

**devroast** — aplicação para avaliar código com sarcasmo.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript 5
- Tailwind CSS 4 (com `@theme` para variáveis)
- Fonte: JetBrains Mono (via `next/font/google`)

## Estrutura

```
src/
├── app/
│   ├── layout.tsx       # Navbar + body styling
│   ├── page.tsx         # Homepage
│   ├── globals.css      # @theme com variáveis de cor
│   └── ui/              # Showcase de componentes
├── components/
│   ├── navbar.tsx       # Navbar (layout global)
│   ├── code-editor.tsx  # CodeMirror (client)
│   ├── roast-toggle.tsx # Toggle roast mode (client)
│   └── ui/              # Componentes genéricos
```

## Padrões

### Convenções de Código

- **Named exports** — nunca `export default`
- **Componentes** — `forwardRef` + `displayName`
- **Props** — estender `HTMLAttributes` nativo, nomear `ComponentNameProps`
- **Tailwind** — classes nativas (`bg-accent-green`), nunca CSS variables (`bg-[--var]`)
- **Tailwind-variants** — passar `className` para `tv()`, não usar `cn()`
- **cn()** — apenas para combinar classes fixas com `className` externo (sem `tv()`)
- **Client components** — `"use client"` apenas quando necessário
- **Ícones** — Lucide React

### Componentes UI (`src/components/ui/`)

Padrão de composição com exports flat:

| Componente | Sub-componentes |
|---|---|
| Badge | `BadgeRoot`, `BadgeDot`, `BadgeLabel` |
| Button | `Button` (simples) |
| Card | `CardRoot`, `CardHeader`, `CardBody`, `CardFooter` |
| CodeBlock | `CodeBlockRoot`, `CodeBlockHeader`, `CodeBlockFileName`, `CodeBlockBody`, `CodeBlockLineNumbers`, `CodeBlockContent` |
| DiffLine | `DiffLine` (simples) |
| ScoreRing | `ScoreRing` (simples) |
| TableRow | `TableRowRoot`, `TableRowRank`, `TableRowScore`, `TableRowCode`, `TableRowLanguage` |
| Toggle | `Toggle` (simples) |

### Dependências de Componentes

- **Comportamento** → `@base-ui/react`
- **Syntax highlighting** → `shiki` (server) / `@uiw/react-codemirror` (client)
- **Estilização** → `tailwind-variants`

### Cores (globals.css @theme)

```
accent-green: #10B981    accent-red: #EF4444    accent-amber: #F59E0B
bg-page: #0C0C0C         bg-surface: #171717    bg-input: #111111
text-primary: #E5E5E5    text-secondary: #A3A3A3  text-tertiary: #737373
border-primary: #1F1F1F  destructive: #FF5C33
```

### Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build
npm run lint     # ESLint
```
