---
title: Resultados e transações
description: Escolha o formato do resultado, trate vazios e controle commits.
---

# Resultados e transações

Uma query retorna linhas. A rota precisa declarar como essas linhas viram uma
resposta e quando a operação exige transação.

## Formato do resultado

```ts
@Result("many") // todas as linhas: []
@Result("one")  // primeira linha: objeto | undefined
@Result("none") // ignora as linhas
```

`many` é o padrão.

Uma busca por ID normalmente combina:

```ts
import { queryArtifacts } from "../queries/query-artifacts";

@Get("/:id")
@Sql(queryArtifacts.taskFind)
@Result("one")
@NotFoundWhenEmpty()
@Returns(Task)
find() {}
```

Sem linha, `@NotFoundWhenEmpty()` produz `404`.

## Controller pode transformar o resultado

Se o método retorna algo, esse valor vence o resultado automático:

```ts
@Get("/:id/summary")
@Sql(queryArtifacts.taskFind)
@Result("one")
summary(@Request() request: RequestContext) {
  const task = request.result as TaskRecord;
  return {
    id: task.id,
    label: task.done ? `✓ ${task.title}` : task.title,
  };
}
```

O SQL executa antes do método e fica em `request.result`.

## Transação de escrita

```ts
@Post("/")
@Transaction("write")
@Sql(queryArtifacts.taskCreate)
@Result("one")
create() {}
```

Ordem:

```text
BEGIN → query → controller → COMMIT
```

Se a query ou o controller falha:

```text
BEGIN → falha → ROLLBACK
```

Para leitura consistente:

```ts
@Transaction("read")
```

O framework executa `SET TRANSACTION READ ONLY`.

## Queries adicionais na mesma transação

Durante a rota:

```ts
const client = requestContext().transaction!;

await client.query(
  "INSERT INTO audit_log (action) VALUES ($1)",
  ["task-created"],
);
```

Essa query participa do mesmo commit ou rollback.

## Depois do commit

Algumas tarefas só devem ser executadas depois que a transação for confirmada:

```ts
@Post("/")
@Transaction("write")
@Sql(queryArtifacts.taskCreate)
@AfterCommit("notifyCreated")
create() {}

async notifyCreated(@Request() request: RequestContext) {
  await events.publish("task.created", request.result);
}
```

`@AfterCommit` sem `@Transaction` falha no bootstrap.

::: info Transação precisa de conexão dedicada
O runner PostgreSQL deve expor `connect()`. A integração oficial faz isso.
:::
