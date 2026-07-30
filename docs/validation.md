---
title: Validação
description: Valide body e query string com schemas TypeBox.
---

# Validação

`POST /tasks` receberá JSON. O TypeScript protege seu código durante o build;
um schema protege a aplicação durante a requisição.

## Defina o contrato

Crie `src/schemas/task.schema.ts`:

```ts
import { t, type Infer } from "empilha";

export const CreateTask = t.Object({
  title: t.String({ minLength: 1, maxLength: 120 }),
  description: t.Optional(t.String({ maxLength: 2_000 })),
});

export type CreateTask = Infer<typeof CreateTask>;
```

O schema existe em runtime. `Infer` extrai dele o tipo TypeScript.

## Valide e injete o body

```ts
import { Body, Post } from "empilha";
import { CreateTask, type CreateTask as CreateTaskInput } from "../schemas/task.schema";

@Post("/")
create(@Body(CreateTask) input: CreateTaskInput) {
  return {
    id: 1,
    ...input,
    done: false,
  };
}
```

`@Body(CreateTask)` faz duas coisas:

1. valida o JSON;
2. entrega o valor validado ao argumento.

Como o body é JSON, envie o tipo de conteúdo correto:

```http
Content-Type: application/json
```

Um body com outro `Content-Type`, como `text/plain`, recebe `415 Unsupported
Media Type` antes da validação.

Um body inválido recebe `400` antes de o método executar:

```json
{
  "errors": [
    {
      "path": "/title",
      "message": "Expected string"
    }
  ]
}
```

## Valide a query como um objeto

Para paginação, valores relacionados formam um único contrato:

```ts
import { Get, QueryParams, Request, t, type RequestContext } from "empilha";

const TaskFilters = t.Object({
  page: t.Integer({ minimum: 1 }),
  limit: t.Integer({ minimum: 1, maximum: 100 }),
  done: t.Optional(t.Boolean()),
});

@Get("/")
@QueryParams(TaskFilters, { page: 1, limit: 20 })
list(@Request() request: RequestContext) {
  return {
    filters: request.query,
    items: [],
  };
}
```

`@QueryParams` converte números e booleanos, aplica defaults e valida o objeto
completo.

## Body usado sem argumento

Uma rota SQL pode precisar validar o body sem recebê-lo no método:

```ts
@Post("/")
@Body(CreateTask)
@Sql("taskCreate")
create() {}
```

Nesse formato, o body validado fica disponível para bindings como
`:body.title`.

::: warning Schema e tipo devem vir juntos
Não escreva uma interface TypeScript separada que possa divergir do schema.
Infira o tipo com `Infer<typeof Schema>`.
:::
