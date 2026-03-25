# Padrões de Hooks

## Convenções

- **Client only** — todos os hooks precisam de `"use client"` no início do arquivo
- **Named export** — exportar como função nomeada
- **Retorno** — retornar objeto com funções/valores, nunca array como `useState`
- **Nomenclatura** — prefixo `use-` em kebab-case

## Estrutura

```
src/hooks/
├── use-shiki.ts           # Hook de syntax highlighting (client)
└── use-language-detect.ts # Hook de detecção de linguagem (client)
```

## Template de Hook

```tsx
"use client";

import { useCallback, useState } from "react";

export function useExample() {
  const [value, setValue] = useState<string>("");

  const doSomething = useCallback((input: string) => {
    setValue(input);
  }, []);

  return { value, doSomething };
}
```

## Hooks Existentes

### useShiki

Syntax highlighting client-side com Shiki. Lazy loading de linguagens.

```tsx
import { escapeHtml, useShiki } from "@/hooks/use-shiki";

function MyComponent() {
  const { highlight, isReady } = useShiki();

  useEffect(() => {
    if (!code || !isReady) return;
    highlight(code, language).then(setHighlightedHtml);
  }, [code, language, highlight, isReady]);
}
```

### useLanguageDetect

Detecção automática de linguagem usando highlight.js.

```tsx
import { useLanguageDetect } from "@/hooks/use-language-detect";

function MyComponent() {
  const { detect } = useLanguageDetect();

  const handlePaste = (text: string) => {
    const detected = detect(text);
    if (detected !== "plaintext") {
      setLanguage(detected);
    }
  };
}
```

## Regras

1. **use client** — obrigatório no início de todo arquivo de hook
2. **Retorno** — usar objeto `{ fn1, fn2, value }` em vez de array
3. **useCallback** — envolver funções retornadas em `useCallback` para estabilidade de referência
4. **Dependencies** — sempre declarar dependências corretas nos hooks do React
