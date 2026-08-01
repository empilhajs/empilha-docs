---
title: Queries nomeadas
description: Mantenha SQL em arquivos e associe cada query a uma rota.
---

# Queries nomeadas

A versão em memória cumpriu seu papel. Agora tarefas serão persistidas em
PostgreSQL sem esconder o SQL dentro de um ORM ou espalhá-lo pelos controllers.

## Crie a tabela

Crie `src/database/001_tasks.sql`:

```sql
CREATE TABLE tasks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id text NOT NULL,
  title text NOT NULL,
  description text,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Migrations criam estrutura. Queries da aplicação ficam em outro diretório.

## Dê nome às queries

Crie `src/queries/tasks.sql`:

```sql
-- @query taskList
SELECT id, title, description, done, created_at
FROM tasks
ORDER BY created_at DESC;

-- @query taskFind
SELECT id, title, description, done, created_at
FROM tasks
WHERE id = :param.id;
```

Uma linha `-- @query nome` inicia uma nova query. O restante continua sendo SQL
normal, legível por editores e pelo PostgreSQL. Comentários comuns continuam
sendo comentários e não são interpretados pelo loader.

## Carregue antes dos controllers

```ts
const app = new Empilha()
  .postgres(pool, { sql: "./src/queries" })
  .initialize([TaskController]);
```

O diretório é percorrido recursivamente. Nomes duplicados ou ausentes falham no
bootstrap.

## Associe query e rota

```ts
import { Get, Result, Sql } from "empilha";

@Get("/")
@Sql("taskList")
@Result("many")
list() {}
```

Quando o método retorna `undefined`, o resultado SQL vira a resposta. Para uma
rota declarativa, o método pode ficar vazio.

```ts
@Get("/:id")
@Sql("taskFind")
@Result("one")
find() {}
```

O binding `:param.id` é lido diretamente do caminho. `@Param("id")` só é
necessário se o método também precisar do valor.

## Gere nomes tipados

Strings soltas podem conter erros. O script oficial gera constantes a partir
dos arquivos:

```sh
bun node_modules/empilha/scripts/generate-query-types.ts \
  ./src/queries \
  ./src/queries/query-names.ts \
  queryNames
```

No `package.json`:

```json
{
  "scripts": {
    "generate:queries": "bun node_modules/empilha/scripts/generate-query-types.ts ./src/queries ./src/queries/query-names.ts queryNames"
  }
}
```

Depois:

```ts
import { queryNames } from "../queries/query-names";

@Sql(queryNames.taskList)
```

Para testes ou uma query criada em código:

```ts
app.registerQuery("taskCount", "SELECT count(*)::integer AS total FROM tasks");
```

::: tip SQL é parte do contrato
O framework prepara a query no bootstrap e executa somente quando a rota é
chamada.
:::
