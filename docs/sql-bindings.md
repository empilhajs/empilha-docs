---
title: Bindings SQL
description: Ligue dados validados da requisição aos parâmetros PostgreSQL.
---

# Bindings SQL

Bindings conectam a requisição à query sem concatenar valores no SQL. O
framework os converte para parâmetros posicionais como `$1` e `$2`.

## Crie uma tarefa

Adicione a `src/queries/tasks.sql`:

```sql
-- @query taskCreate
INSERT INTO tasks (owner_id, title, description)
VALUES (:auth.sub, :body.title, :body.description)
RETURNING id, title, description, done, created_at;
```

Na rota:

```ts
@Post("/")
@Body(CreateTask)
@Roles("user")
@Sql("taskCreate")
@Result("one")
@Returns(Task)
create() {}
```

O fluxo é:

```text
token → payload autenticado
body → schema CreateTask
bindings → parâmetros PostgreSQL
query → uma linha Task
```

## Fontes disponíveis

| Binding | Fonte |
| --- | --- |
| `:param.id` | segmento `:id` do caminho |
| `:query.limit` | query string |
| `:header.x-tenant-id` | header |
| `:body.title` | JSON recebido |
| `:auth.sub` | payload de `app.auth()` |
| `:identity.sub` | identidade normalizada, com fallback para o payload |

Bindings de autenticação só são aceitos em rotas protegidas.

## Validação no bootstrap

Quando existe `@Body(schema)`, o Empilha compara bindings `:body.*` com o
schema. Este erro:

```sql
VALUES (:body.titel)
```

é encontrado ao iniciar e pode sugerir `body.title`.

## Casts continuam sendo PostgreSQL

```sql
WHERE done = :query.done::boolean
LIMIT :query.limit::integer;
```

O parser distingue o binding do cast `::`.

## Campo ausente ou `null`

Em atualizações parciais, o sufixo `?` informa se o campo foi enviado:

```sql
-- @query taskUpdate
UPDATE tasks
SET
  title = CASE
    WHEN :body.title? THEN :body.title
    ELSE title
  END,
  description = CASE
    WHEN :body.description? THEN :body.description
    ELSE description
  END
WHERE id = :param.id
RETURNING id, title, description, done, created_at;
```

Isso diferencia “não alterar” de “alterar para `null`”.

## Bindings explícitos

Queries nomeadas normalmente carregam seus próprios bindings. Para SQL
posicional ou compatibilidade:

```ts
@Sql("taskFind", { params: ["param.id"] })
```

Prefira bindings dentro do arquivo: eles deixam o contrato visível ao ler a
query.

## Prepare dados antes do SQL

Quando um valor precisa ser normalizado antes dos bindings:

```ts
@Patch("/:id")
@BeforeSql()
@Sql("taskUpdate")
update(@Body(UpdateTask) input: UpdateTaskInput) {
  input.title = input.title?.trim();
}
```

Com `@BeforeSql()` sem nome, o próprio método executa antes da query e não
executa novamente depois dela. Para separar o hook:

```ts
@BeforeSql("normalizeUpdate")
```

::: warning Nunca concatene entrada no SQL
Bindings são enviados separadamente ao driver. Interpolação de strings perde
essa proteção.
:::
