# Spec: Editor com Syntax Highlight

## Contexto

Editor de código para a aplicação devroast que permite ao usuário colar/digitar código com syntax highlight automático. O editor deve detectar a linguagem automaticamente e permitir seleção manual. Reutilizável em múltiplos contextos (homepage, review, snippets).

## Referência: Como o ray-so funciona

O ray-so usa uma arquitetura **textarea + overlay**:

- Um `<textarea>` transparente captura a entrada do usuário (digitação, colagem)
- Uma `<div>` com HTML gerado pelo shiki é posicionada por baixo, exibindo o syntax highlight
- O `highlight.js` (`hljs.highlightAuto`) faz a auto-detecção de linguagem no momento do paste/digitação
- O `shiki` faz o highlighting real, gerando HTML com spans inline-styled
- Linguagens são carregadas de forma lazy via `highlighter.loadLanguage()`
- State management com Jotai (atom pattern)

Arquivo de referência: `app/(navigation)/(code)/components/Editor.tsx` e `HighlightedCode.tsx` no repositório ray-so.

---

## Stack recomendada

### 1. Syntax Highlighting: **Shiki**

**Por quê:**
- Mesmo engine do VS Code (TextMate grammars)
- Output com inline styles (sem CSS externo necessário)
- Suporte a temas (github-dark, dracula, nord, etc.)
- Lazy loading de linguagens via WASM
- Usado pelo ray-so, documentação do Next.js, Astro
- API madura: `codeToHtml()`, `codeToHast()`, `getHighlighterCore()`

**Alternativa considerada e descartada:**
- `Prism.js` — mais antigo, requer CSS externo, menos temas, sem suporte nativo a WASM
- `highlight.js` — ray-so usa apenas para detecção de linguagem, não para highlighting (qualidade inferior ao shiki)

### 2. Auto-detecção de linguagem: **highlight.js (`hljs.highlightAuto`)**

**Por quê:**
- Já usado pelo ray-so para exatamente essa função
- Leve e rápido para detecção
- `hljs.highlightAuto(code, languageSubset)` retorna `{ language, relevance }`
- Não precisa de modelo ML, funciona no browser sem overhead
- Fallback simples: se `relevance < 5`, assume plaintext

**Alternativa considerada e descartada:**
- `@vscode/vscode-languagedetection` — usa TensorFlow.js, ~2MB de modelo, overkill para snippets curtos
- `google/guesslang` — similar, modelo pesado para browser

### 3. Editor editável: **Textarea + Overlay (padrão ray-so)**

**Por quê:**
- Padrão comprovado (ray-so, Carbon, CodeSandbox)
- Total controle sobre o visual
- O textarea captura input nativamente (clipboard, keyboard, IME)
- A div overlay permite styling arbitrário do código highlighted
- Sync de scroll entre textarea e overlay
- Sem dependência de editor pesado (Monaco, CodeMirror)

**Componentes do editor:**
```
<div className="editor-container">        ← container relativo
  <textarea                               ← captura input (transparente)
    value={code}
    onChange={handleChange}
    spellCheck={false}
  />
  <div                                    ← exibe código highlighted
    className="highlighted-overlay"
    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
  />
</div>
```

**Alternativa considerada e descartada:**
- `CodeMirror 6` + `@cmshiki/editor` — mais complexo, overkill para o caso de uso (não precisamos de autocomplete, lint, etc.)
- `@uiw/react-codemirror` — já está no projeto como dependência, mas adicionar shiki em cima do CodeMirror tem problemas de performance e sync
- Monaco Editor — pesado demais para browser, melhor para IDEs

### 4. Output do Shiki: **`codeToHtml()` com inline styles**

```ts
const html = highlighter.codeToHtml(code, {
  lang: 'typescript',
  theme: 'github-dark',
  transformers: [
    {
      line(node, line) {
        node.properties['data-line'] = line;
      },
    },
  ],
});
```

Gera HTML com `<span style="color: #...">` — sem CSS externo necessário.

---

## Arquitetura proposta

### Estrutura de arquivos

```
src/
├── components/
│   └── code-editor.tsx        # Componente principal (client)
├── hooks/
│   └── use-shiki.ts           # Hook para inicialização do highlighter
│   └── use-language-detect.ts # Hook para auto-detecção de linguagem
└── lib/
    └── languages.ts           # Mapa de linguagens suportadas (lazy imports)
```

### Fluxo

```
Usuário digita/cola código
  → onChange atualiza state do código
  → hljs.highlightAuto() detecta linguagem (debounced)
  → shiki.codeToHtml() gera HTML highlighted
  → overlay renderiza HTML
  → (Opcional) usuário muda linguagem manualmente via dropdown
```

### Hook `useShiki`

```ts
// Inicializa o highlighter uma vez
const highlighter = await getHighlighterCore({
  themes: [githubDark, githubLight],
  langs: [], // vazio — carrega sob demanda
  loadWasm: getWasm,
});

// Carrega linguagem sob demanda
async function highlight(code: string, lang: string) {
  if (!highlighter.getLoadedLanguages().includes(lang)) {
    await highlighter.loadLanguage(import(`shiki/langs/${lang}.mjs`));
  }
  return highlighter.codeToHtml(code, { lang, theme: 'github-dark' });
}
```

### Hook `useLanguageDetect`

```ts
function detectLanguage(code: string): string {
  const result = hljs.highlightAuto(code, Object.keys(LANGUAGES));
  // relevance < 5 = não confiável, fallback para plaintext
  if (result.relevance < 5) return 'plaintext';
  return result.language;
}
```

### Componente `CodeEditor`

Props (extending `HTMLAttributes<HTMLDivElement>` conforme padrão do projeto):

```ts
interface CodeEditorProps extends HTMLAttributes<HTMLDivElement> {
  code?: string;
  language?: string;          // linguagem forçada (null = auto-detect)
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (lang: string) => void;
  theme?: 'github-dark' | 'github-light';
  showLanguageSelector?: boolean;
  showLineNumbers?: boolean;
  placeholder?: string;
}
```

---

## Dependências novas necessárias

| Pacote | Uso | Tamanho |
|--------|-----|---------|
| `shiki` | Syntax highlighting | ~1.2MB (WASM + temas + linguagens, lazy loaded) |
| `highlight.js` | Auto-detecção de linguagem | ~90KB (min + gz) |

**Nota:** O projeto já tem `@uiw/react-codemirror` como dependência. Pode ser removido se não for usado em nenhum outro lugar.

---

## Linguagens suportadas (inicial)

Começar com as mais comuns e expandir sob demanda:

JavaScript, TypeScript, TSX, JSX, Python, Go, Rust, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Dart, SQL, HTML, CSS, JSON, YAML, Markdown, Bash, Dockerfile

---

## To-dos

- [ ] Decidir: remover `@uiw/react-codemirror` do projeto ou manter paralelamente?
- [ ] Criar `src/lib/languages.ts` com mapa de linguagens suportadas e lazy imports
- [ ] Criar hook `useShiki` para inicialização e highlighting
- [ ] Criar hook `useLanguageDetect` com `highlight.js`
- [ ] Criar componente `CodeEditor` com textarea + overlay
- [ ] Implementar sync de scroll entre textarea e overlay
- [ ] Implementar dropdown de seleção manual de linguagem
- [ ] Implementar tab indent / auto-close brackets no textarea
- [ ] Estilizar com Tailwind conforme variáveis do `globals.css` (`bg-input`, `text-primary`, etc.)
- [ ] Testar colagem de código de diferentes fontes (GitHub, IDEs, terminais)
- [ ] Testar performance com arquivos grandes (>500 linhas)
- [ ] Criar página de showcase em `src/app/ui/` para demonstrar o componente
- [ ] Rodar `npm run lint` e `npm run build` após implementação
