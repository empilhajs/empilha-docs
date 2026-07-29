---
title: PostgreSQL
description: Conecte pool, migrations, health check e shutdown.
---

# PostgreSQL

O Empilha aceita um runner compatível com PostgreSQL. O pacote `@empilha/pg`
integra o driver `pg` e administra o pool no ciclo de vida da aplicação.

## Instale

```sh
bun add @empilha/pg pg
bun add -d @types/pg
```

## Configure

```ts
import { Empilha } from "empilha";
import { postgres } from "@empilha/pg";

const database = postgres({
  url: process.env.DATABASE_URL!,
  sql: "./src/queries",
  healthCheck: "postgres",
});

const app = new Empilha()
  .use(database)
  .initialize([TaskController]);

await app.run({ port: 4000 });
```

O plugin:

- cria um `pg.Pool`;
- carrega os arquivos SQL;
- habilita queries e transações;
- registra um check do banco;
- encerra o pool em `app.close()`.

## Use um pool existente

Se a aplicação já cria o pool:

```ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = new Empilha()
  .postgres(pool, {
    sql: "./src/queries",
    healthCheck: "postgres",
  })
  .initialize([TaskController]);
```

## Execute migrations

Adicione:

```json
{
  "scripts": {
    "migrate": "bun node_modules/empilha/scripts/migrate.ts"
  }
}
```

Execute:

```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tasks \
  bun run migrate
```

Arquivos em `src/database` rodam em ordem lexicográfica. O histórico fica em
`empilha_migrations`; alterar o conteúdo de uma migration já aplicada causa
erro de checksum.

## Verifique a saúde

Com health check configurado:

```sh
curl http://localhost:4000/health
```

```json
{
  "status": "ok",
  "checks": {
    "postgres": "up"
  }
}
```

Uma falha em qualquer check responde `503` com status `degraded`.

## Timeout

```ts
app.postgres(pool, {
  timeout: 5_000,
  sql: "./src/queries",
});
```

O timeout gera `504` e envia um `AbortSignal` ao runner. Configure também
`statement_timeout` e `lock_timeout` no PostgreSQL; o limite da aplicação não
substitui limites do banco.

## Outro driver

Para integrar outro driver, implemente o contrato mínimo:

```ts
type PostgresQueryRunner = {
  query(
    sql: string,
    params?: unknown[],
    options?: { signal?: AbortSignal },
  ): Promise<{ rows: unknown[] }>;

  connect?(): Promise<{
    query: PostgresQueryRunner["query"];
    release(): void;
  }>;
};
```

Passe o runner a `app.postgres(runner)`. Transações exigem `connect()`.

::: tip Banco é um recurso da aplicação
Deixe criação, health check e fechamento próximos do bootstrap. Controllers
devem conhecer queries, não o ciclo de vida do pool.
:::
