# Specs

Especificações vivem em `specs/`. Antes de implementar uma feature, crie um `.md` aqui.

## Formato

```markdown
# Spec: <nome>

## Contexto
O que a feature resolve. Decisões tomadas antes da implementação.

## Stack
Tabela de tecnologias e o papel de cada uma.

## Referência
Links para design (Pencil), repositórios externos, ou telas de referência.

## Arquitetura / Schema
Estrutura de arquivos, componentes, tabelas, fluxos. Diagramas quando fizer sentido.

## To-dos
- [ ] tarefa 1
- [ ] tarefa 2
```

## Regras

1. Um spec por feature, um arquivo por spec
2. Nome do arquivo: `feature-name.md` (kebab-case)
3. To-dos devem ser executáveis e ordenados por dependência
4. Se houver decisões de design, documentar o "por quê" no Contexto
5. Quando fizer sentido, fazer perguntas ao usuário antes de escrever o spec
