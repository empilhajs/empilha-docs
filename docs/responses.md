---
title: Respostas
description: Controle status, serialização e contrato de saída.
---

# Respostas

Retornar um objeto já produz JSON. Nesta página tornamos status e formato de
saída explícitos.

## Status padrão

Sem `@Status`, o Empilha usa:

| Método | Status padrão |
| --- | --- |
| `GET`, `PUT`, `PATCH` | `200` |
| `POST` | `201` |
| `DELETE` | `204` |

Use `@Status` quando o endpoint foge do padrão:

```ts
import { Post, Status } from "empilha";

@Post("/preview")
@Status(200)
preview() {
  return { title: "Prévia" };
}
```

## Schema de resposta

Complete `src/schemas/task.schema.ts`:

```ts
import { t } from "empilha";

export const Task = t.Object({
  id: t.Integer(),
  title: t.String(),
  description: t.Optional(t.String()),
  done: t.Boolean(),
});
```

Use o schema na rota:

```ts
import { Returns } from "empilha";
import { Task } from "../schemas/task.schema";

@Post("/")
@Returns(Task)
create(@Body(CreateTask) input: CreateTaskInput) {
  return { id: 1, ...input, done: false, internal: "não vaza" };
}
```

`@Returns(Task)`:

- documenta a resposta no OpenAPI;
- valida o retorno fora de produção por padrão;
- serializa somente os campos do schema.

O campo `internal` não aparece no JSON.

## Listas

O schema deve descrever o corpo inteiro:

```ts
@Get("/")
@Returns(t.Array(Task))
list() {
  return [];
}
```

## Texto

Strings são serializadas como JSON por padrão. Para texto simples:

```ts
import { Produces } from "empilha";

@Get("/status")
@Produces("text/plain")
status() {
  return "ok";
}
```

::: tip Entrada e saída agora têm contrato
O controller já sabe receber e responder. No próximo capítulo, a regra de
negócio sai dele e vai para um service.
:::
