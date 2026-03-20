# Padrões de Componentes UI

## Dependências

```bash
npm install clsx tailwind-merge tailwind-variants lucide-react @base-ui/react shiki
```

## Estrutura de Arquivos

```
src/components/ui/
├── AGENTS.md        # Este arquivo - padrões de documentação
├── utils.ts         # cn() com clsx + tailwind-merge
├── button.tsx       # Botão com tv()
├── toggle.tsx       # Toggle com base-ui Switch (client)
├── badge.tsx        # Badge de status com variantes
├── card.tsx         # Card genérico com slots
├── code-block.tsx   # Code block com shiki (server component)
├── diff-line.tsx    # Linha de diff (added/removed/context)
├── table-row.tsx    # Linha de leaderboard
├── score-ring.tsx   # Anel circular com score (SVG)
└── index.ts         # Named exports
```

## utils.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Variáveis de Tema (globals.css)

Todas as variáveis de cor são definidas em `src/app/globals.css` dentro de `@theme`. Usar classes Tailwind nativas (`bg-accent-green`, `text-text-primary`) em vez de CSS variables (`bg-[--variable]`).

```css
@theme {
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;

  /* Accent */
  --color-accent-green: #10B981;
  --color-accent-red: #EF4444;
  --color-accent-amber: #F59E0B;

  /* Backgrounds */
  --color-bg-page: #0C0C0C;
  --color-bg-surface: #171717;
  --color-bg-input: #111111;
  --color-bg-elevated: #1A1A1A;

  /* Borders */
  --color-border-primary: #1F1F1F;

  /* Text */
  --color-text-primary: #E5E5E5;
  --color-text-secondary: #A3A3A3;
  --color-text-tertiary: #737373;
  --color-text-muted: #525252;

  /* Semantic */
  --color-foreground: #FFFFFF;
  --color-secondary: #2E2E2E;
  --color-muted: #2E2E2E;
  --color-border: #2E2E2E;
  --color-destructive: #FF5C33;
}
```

## Template de Componente (Client com tv)

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
}

const component = tv({
  base: "classes-base",
  variants: {
    variant: {
      default: "bg-accent-green text-black",
      secondary: "bg-secondary text-foreground",
      destructive: "bg-destructive text-white",
      outline: "border border-border bg-transparent",
      ghost: "bg-transparent",
      link: "text-foreground underline",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-11 px-6 py-2.5 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div ref={ref} className={component({ variant, size, className })} {...props} />
  )
);

Component.displayName = "Component";

export { Component, type ComponentProps };
```

## Template de Componente (Client com tv + classes fixas)

Usar `cn()` quando precisar combinar classes fixas com `className` externo.

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { cn } from "./utils";

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  // props
}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 font-mono text-xs", className)}
      {...props}
    />
  )
);

Component.displayName = "Component";

export { Component, type ComponentProps };
```

## Template de Componente (Server com shiki)

```tsx
import { type HTMLAttributes } from "react";
import { codeToHtml } from "shiki";
import { cn } from "./utils";

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  fileName?: string;
}

async function highlight(code: string, language: string) {
  return codeToHtml(code, { lang: language, theme: "vesper" });
}

async function CodeBlock({
  code,
  language = "javascript",
  fileName,
  className,
  ...props
}: CodeBlockProps) {
  const highlighted = await highlight(code, language);

  return (
    <div className={cn("rounded-lg border border-border-primary", className)} {...props}>
      {/* dangerouslySetInnerHTML com output do shiki */}
    </div>
  );
}

export { CodeBlock, type CodeBlockProps };
```

## Template de Componente (Client com base-ui)

```tsx
"use client";

import { Switch } from "@base-ui/react/switch";
import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { cn } from "./utils";

export interface ToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const track = tv({
  base: "relative w-10 h-[22px] rounded-full p-[3px] transition-colors cursor-pointer",
  variants: {
    checked: { true: "bg-accent-green", false: "bg-border-primary" },
    disabled: { true: "opacity-50 cursor-not-allowed" },
  },
});

const thumb = tv({
  base: "block w-4 h-4 rounded-full bg-white transition-transform duration-150",
  variants: {
    checked: { true: "translate-x-[18px]", false: "translate-x-0" },
  },
});

const Toggle = forwardRef<HTMLDivElement, ToggleProps>(
  ({ checked, onCheckedChange, label, disabled, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={track({ checked, disabled })}
      >
        <Switch.Thumb className={thumb({ checked })} />
      </Switch.Root>
      <span className="font-mono text-xs">{label}</span>
    </div>
  )
);

Toggle.displayName = "Toggle";

export { Toggle, type ToggleProps };
```

## Template de Componente (SVG)

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "./utils";

export interface ScoreRingProps extends HTMLAttributes<HTMLDivElement> {
  score: number;
  maxScore?: number;
}

const ScoreRing = forwardRef<HTMLDivElement, ScoreRingProps>(
  ({ score, maxScore = 10, className, ...props }, ref) => (
    <div ref={ref} className={cn("relative w-[180px] h-[180px]", className)} {...props}>
      <svg width={180} height={180} viewBox="0 0 180 180" className="absolute inset-0">
        {/* SVG content */}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[48px] font-bold text-text-primary">{score}</span>
        <span className="font-mono text-[16px] text-text-tertiary">/{maxScore}</span>
      </div>
    </div>
  )
);

ScoreRing.displayName = "ScoreRing";

export { ScoreRing, type ScoreRingProps };
```

## Regras

1. **Named exports** - Nunca usar default exports
2. **Interface de Props** - Nomear como `ComponentNameProps`
3. **Estender atributos nativos** - Usar `HTMLAttributes`, `ButtonHTMLAttributes`, etc.
4. **Tailwind-variants** - Passar `className` diretamente para `tv()`, não usar `cn()`
5. **cn()** - Usar `cn()` apenas para combinar classes fixas com `className` externo (quando não usa `tv()`)
6. **forwardRef** - Usar para permitir ref forwarding
7. **displayName** - Definir para debugging
8. **Icons** - Usar Lucide React para ícones
9. **Propriedades comuns**:
   - `variant` - Variante visual
   - `size` - Tamanho
   - `loading` - Estado de carregamento
   - `disabled` - Estado desabilitado
   - `leftIcon` / `rightIcon` - Ícones laterais
10. **Componentes com comportamento** - Usar primitivos de `@base-ui/react`
11. **Server Components** - Usar `async` function + `shiki` para syntax highlighting
12. **Client Components** - Adicionar `"use client"` directive apenas quando necessário (useState, useEffect, etc.)
13. **Variáveis de Tema** - Definir cores em `globals.css` via `@theme` e usar classes Tailwind nativas (`bg-accent-green`, `text-text-primary`), nunca CSS variables (`bg-[--variable]`)
14. **Fontes** - Usar `font-mono` do Tailwind para texto monospaced
