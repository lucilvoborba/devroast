# Spec: Drizzle ORM + Postgres

## Contexto

Persistência de submissões de código, análises e leaderboard para o devroast. Fase 1: sem autenticação, lógica determinística para roast, código persistido integralmente.

Decisões:
- Submissões anônimas (sem auth na fase 1)
- Score/roast via lógica determinística (sem IA na fase 1)
- Código submetido persistido integralmente
- Postgres 16 via Docker Compose

## Stack

| Tecnologia | Uso |
|---|---|
| **Drizzle ORM** | ORM type-safe, migration management |
| **PostgreSQL 16** | Banco de dados |
| **Docker Compose** | Infra local do Postgres |
| **drizzle-kit** | CLI para migrations e introspect |

## Referência do design (Pencil)

O design possui 3 telas que definem os dados:

**Screen 1 — Code Input**: editor com código, roast toggle, submit button, stats (total roasts, avg score), leaderboard preview (top 3)

**Screen 2 — Roast Results**: score ring (0-10), roast quote, código submetido, detailed analysis (issues com severity), suggested fix (diff block)

**Screen 3 — Shame Leaderboard**: ranking com rank, score, código snippet, linguagem, line count

---

## Schema

### Enums

```sql
-- Severity dos issues encontrados na análise
CREATE TYPE issue_severity AS ENUM ('critical', 'warning', 'good');

-- Status de uma submissão
CREATE TYPE submission_status AS ENUM ('pending', 'analyzed', 'failed');
```

Em Drizzle (via `pgEnum`):

```ts
export const issueSeverityEnum = pgEnum('issue_severity', ['critical', 'warning', 'good']);
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'analyzed', 'failed']);
```

### Tabelas

#### 1. `submissions`

Submissão principal. Representa o código colado pelo usuário e o resultado do roast.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `code` | `text` | NOT NULL | Código submetido integralmente |
| `language` | `varchar(50)` | NOT NULL | Linguagem detectada/selecionada (ex: `javascript`, `python`) |
| `line_count` | `integer` | NOT NULL | Número de linhas do código |
| `roast_mode` | `boolean` | NOT NULL, default `false` | Se o roast mode (sarcasmo máximo) estava ativo |
| `score` | `real` | NULL | Score de 0 a 10 (NULL enquanto não analisado) |
| `roast_message` | `text` | NULL | Mensagem sarcástica gerada pela análise |
| `status` | `submission_status_enum` | NOT NULL, default `'pending'` | Status da submissão |
| `created_at` | `timestamp` | NOT NULL, default `now()` | Data de criação |

#### 2. `analysis_issues`

Issues individuais encontrados na análise detalhada (Screen 2 — "detailed_analysis").

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `submission_id` | `uuid` | FK → `submissions.id`, ON DELETE CASCADE | Submissão pai |
| `severity` | `issue_severity_enum` | NOT NULL | critical, warning ou good |
| `title` | `varchar(200)` | NOT NULL | Título curto do issue (ex: "eval() usage") |
| `description` | `text` | NOT NULL | Descrição detalhada do problema |
| `line_start` | `integer` | NULL | Linha inicial onde o issue ocorre |
| `line_end` | `integer` | NULL | Linha final (para issues que span múltiplas linhas) |
| `position` | `integer` | NOT NULL, default `0` | Ordem de exibição na grid |

#### 3. `suggested_fixes`

Sugestões de correção com diff (Screen 2 — "suggested_fix").

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `submission_id` | `uuid` | FK → `submissions.id`, ON DELETE CASCADE | Submissão pai |
| `original_code` | `text` | NOT NULL | Trecho de código original (problemático) |
| `fixed_code` | `text` | NOT NULL | Código corrigido sugerido |
| `explanation` | `text` | NOT NULL | Explicação da correção |
| `position` | `integer` | NOT NULL, default `0` | Ordem de exibição |

#### 4. `leaderboard_stats`

Estatísticas agregadas exibidas no footer (Screen 1) e header do leaderboard (Screen 3).

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `integer` | PK (singleton, sempre `1`) | Singleton — apenas 1 registro |
| `total_submissions` | `integer` | NOT NULL, default `0` | Total de submissões (ex: "2,847 codes roasted") |
| `avg_score` | `real` | NOT NULL, default `0` | Score médio (ex: "avg score: 4.2/10") |
| `updated_at` | `timestamp` | NOT NULL, default `now()` | Última atualização |

---

## Relacionamentos

```
submissions (1) ──── (N) analysis_issues
submissions (1) ──── (N) suggested_fixes
```

`leaderboard_stats` é uma tabela singleton (1 registro) atualizada via trigger ou aplicação.

---

## Drizzle Schema (referência)

Estrutura de arquivos:

```
src/
└── db/
    ├── schema.ts        # Definição das tabelas e enums
    ├── index.ts         # Conexão com o banco (drizzle())
    └── queries.ts       # Queries reutilizáveis (leaderboard, stats)
drizzle/
    └── migrations/      # Arquivos de migration gerados pelo drizzle-kit
drizzle.config.ts        # Config do drizzle-kit (root do projeto)
```

---

## Docker Compose

```yaml
# docker-compose.yml (root do projeto)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Variáveis de ambiente

Adicionar ao `.env.local` (já no `.gitignore`):

```env
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## To-dos

### Infra

- [ ] Criar `docker-compose.yml` na root com Postgres 16
- [ ] Instalar dependências: `drizzle-orm`, `postgres`, `drizzle-kit`
- [ ] Criar `drizzle.config.ts` na root
- [ ] Adicionar `DATABASE_URL` ao `.env.local`
- [ ] Criar `src/db/schema.ts` com enums e tabelas (submissions, analysis_issues, suggested_fixes, leaderboard_stats)
- [ ] Criar `src/db/index.ts` com conexão drizzle
- [ ] Criar `src/db/queries.ts` com queries de leaderboard e stats

### Migrations

- [ ] Rodar `npx drizzle-kit generate` para gerar migration inicial
- [ ] Rodar `npx drizzle-kit migrate` para aplicar no banco
- [ ] Adicionar scripts no `package.json`: `db:generate`, `db:migrate`, `db:studio`

### Integração

- [ ] Criar API route `POST /api/submit` para receber código e criar submission (status: `pending`)
- [ ] Criar service de análise determinística que popula `analysis_issues`, `suggested_fixes`, score e `roast_message`
- [ ] Atualizar status da submission para `analyzed` após análise
- [ ] Criar API route `GET /api/leaderboard` para buscar ranking (score mais baixo primeiro)
- [ ] Criar API route `GET /api/stats` para total de submissões e score médio
- [ ] Atualizar `leaderboard_stats` após cada análise (incrementar `total_submissions`, recalcular `avg_score`)

### Validação

- [ ] Rodar `npm run lint` e `npm run build` após implementação
- [ ] Testar fluxo completo: submit → análise → leaderboard
