# Padrões de Banco de Dados

## Stack

- Drizzle ORM + PostgreSQL 16
- postgres.js como driver
- snake_case para colunas

## Estrutura

```
src/db/
├── index.ts        # Conexão Drizzle
├── schema.ts       # Tabelas e enums
├── queries.ts      # Funções de query
└── seed.ts         # Seed de dados fake
```

## Conexão (`index.ts`)

```tsx
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle({
  client,
  casing: "snake_case",
  schema,
});
```

## Schema (`schema.ts`)

Padrão para definir tabelas:

```tsx
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "active", "inactive"]);

export const tableName = pgTable("table_name", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 200 }).notNull(),
  description: text(),
  status: statusEnum().notNull().default("pending"),
  createdAt: timestamp().notNull().defaultNow(),
});
```

## Queries (`queries.ts`)

Funções de query exportadas como named exports:

```tsx
import { asc, avg, count, eq } from "drizzle-orm";
import { db } from "./index";
import { tableName } from "./schema";

export async function getRecords(limit = 10) {
  return db
    .select()
    .from(tableName)
    .orderBy(asc(tableName.createdAt))
    .limit(limit);
}

export async function createRecord(data: { name: string }) {
  const [row] = await db
    .insert(tableName)
    .values(data)
    .returning({ id: tableName.id });
  return row;
}
```

## Seed (`seed.ts`)

Usar `@faker-js/faker` para dados fake:

```tsx
import { faker } from "@faker-js/faker";
import { db } from "./index";
import { tableName } from "./schema";

async function seed() {
  console.log("seeding database...");
  
  await db.transaction(async (tx) => {
    for (let i = 0; i < 100; i++) {
      await tx.insert(tableName).values({
        name: faker.lorem.words(3),
        // ...
      });
    }
  });
  
  console.log("seed complete");
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
```

## Comandos

```bash
npm run db:generate  # Gerar migrations a partir das mudanças no schema
npm run db:migrate   # Aplicar migrations pendentes
npm run db:studio    # Abrir Drizzle Studio (GUI)
npm run db:seed      # Popular banco com dados fake
```

## Docker

PostgreSQL 16 via docker-compose:

```bash
docker compose up -d    # Iniciar PostgreSQL
docker compose down     # Parar PostgreSQL
```

Credenciais padrão: `devroast/devroast` na porta `5432`.

## Regras

1. **Nomenclatura** — tabelas em snake_case, colunas em snake_case via `casing: "snake_case"`
2. **IDs** — usar `uuid().primaryKey().defaultRandom()` para IDs
3. **Timestamps** — sempre incluir `createdAt` com `defaultNow()`
4. **Foreign keys** — usar `.references(() => otherTable.id, { onDelete: "cascade" })`
5. **Enums** — definir com `pgEnum()` antes das tabelas que os usam
6. **Queries** — exportar como funções async em `queries.ts`
7. **Transações** — usar `db.transaction()` para operações múltiplas
8. **Seed** — usar `faker` para gerar dados realistas de teste
