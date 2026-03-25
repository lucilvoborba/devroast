# Padrões de Utilitários

## Convenções

- **Funções puras** — utilitários devem ser funções puras sem efeitos colaterais
- **Named exports** — exportar funções e constantes individualmente
- **Tipagem** — exportar interfaces e types relevantes
- **Re-exportes** — usar barrel exports se houver muitos arquivos

## Estrutura

```
src/lib/
└── languages.ts    # Configuração de linguagens suportadas
```

## languages.ts

Configuração centralizada de linguagens para syntax highlighting:

```tsx
export interface Language {
  name: string;
  id: string;
  shikiLang: string;
  src: () => Promise<any>;
}

export const LANGUAGES: Record<string, Language> = {
  javascript: {
    name: "JavaScript",
    id: "javascript",
    shikiLang: "javascript",
    src: () => import("shiki/langs/javascript.mjs"),
  },
  // ...
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
export const HLJS_LANG_MAP: Record<string, string> = { /* ... */ };
export function mapHljsToShiki(hljsLang: string | undefined): string { /* ... */ }
```

## Regras

1. **Server e Client** — utilitários em `lib/` podem ser usados tanto no server quanto no client
2. **Sem dependências de React** — hooks ficam em `src/hooks/`, não em `lib/`
3. **Lazy loading** — usar dynamic imports para linguagens/configurações pesadas
4. **Constantes** — exportar arrays/records auxiliares além das funções principais
