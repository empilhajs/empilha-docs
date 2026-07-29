---
title: Testes
description: Exercite o pipeline HTTP sem abrir uma porta.
---

# Testes

`app.test()` envia requisições ao mesmo adaptador HTTP usado pelo servidor,
sem rede e sem `listen()`.

## Primeiro teste

Crie `tests/task.test.ts`:

```ts
import { afterAll, describe, expect, test } from "bun:test";
import { createTestApp } from "empilha";
import { TaskController } from "../src/controllers/task.controller";
import { TaskService } from "../src/services/task.service";

const app = createTestApp([TaskController], (configured) => {
  configured.provide(TaskService);
});

afterAll(() => app.close());

describe("tasks", () => {
  test("cria uma tarefa", async () => {
    const response = await app.test().post("/tasks", {
      title: "Aprender Empilha",
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      id: 1,
      title: "Aprender Empilha",
      done: false,
    });
  });
});
```

`createTestApp()` configura e inicializa, mas não abre porta.

## Teste o contrato, não a implementação

Um teste útil observa:

- status;
- body;
- headers;
- efeitos visíveis.

Para validação:

```ts
test("rejeita título vazio", async () => {
  const response = await app.test().post("/tasks", { title: "" });

  expect(response.status).toBe(400);
});
```

## Envie autenticação

```ts
const response = await app.test().delete("/tasks/1", undefined, {
  headers: {
    Authorization: "Bearer test-token",
  },
});
```

No setup, use um verificador determinístico:

```ts
configured.auth(async (token) => ({
  valid: token === "test-token",
  roles: ["admin"],
  payload: { sub: "user-1" },
}));
```

## Substitua providers

```ts
const fakeTasks = {
  list: () => [{ id: 1, title: "Fake", done: false }],
};

configured.provide(TaskService, {
  useValue: fakeTasks as TaskService,
});
```

O controller não muda para receber o mock.

## Teste SQL sem banco

```ts
import { testPostgres } from "empilha";

const database = testPostgres([
  { id: 1, title: "Aprender Empilha", done: false },
]);

const app = createTestApp([TaskController], (configured) => {
  configured.postgres(database, {
    sql: "./src/queries",
    healthCheck: false,
  });
});

const response = await app.test().get("/tasks");

expect(response.status).toBe(200);
expect(database.queries[0]).toContain("SELECT");
```

O runner registra SQL e parâmetros. Fixtures por trecho de SQL permitem
respostas diferentes para cada query.

## Requisição crua

Para JSON inválido:

```ts
const response = await app.test().request("POST", "/tasks", {
  headers: { "content-type": "application/json" },
  body: "{ inválido",
});

expect(response.status).toBe(400);
```

::: tip Feche a aplicação
`app.close()` descarta providers, tarefas pendentes e outros recursos
registrados, mesmo quando nenhum servidor foi aberto.
:::
