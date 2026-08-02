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
import { createTestApplication, defineModule } from "empilha";
import { TaskController } from "../src/controllers/task.controller";
import { TaskService } from "../src/services/task.service";

const TestModule = defineModule({
  name: "tasks-test",
  controllers: [TaskController],
  providers: [TaskService],
});

const app = await createTestApplication(TestModule).compile();

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

`createTestApplication(Module).compile()` compila o mesmo módulo de produção,
sem abrir uma porta.

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
const app = await createTestApplication(TestModule, {
  configure: (configured) => configured.auth(async (token) => ({
  valid: token === "test-token",
  roles: ["admin"],
  payload: { sub: "user-1" },
  })),
}).compile();
```

## Substitua providers

```ts
const fakeTasks = {
  list: () => [{ id: 1, title: "Fake", done: false }],
};

const app = await createTestApplication(TestModule)
  .overrideProvider(TaskService)
  .useValue(fakeTasks as TaskService)
  .compile();
```

O controller não muda para receber o mock.

## Teste SQL sem banco

```ts
import { testPostgres } from "empilha";

const database = testPostgres({
  rows: [],
  fixtures: {
    taskList: [
      { id: 1, title: "Aprender Empilha", done: false },
    ],
  },
});

const app = await createTestApplication(TestModule, {
  postgres: database,
  configure: (configured) => configured.configureHttp({ cors: false }),
}).compile();

const response = await app.test().get("/tasks");

expect(response.status).toBe(200);
expect(database.queries[0]).toContain("SELECT");
```

O runner registra SQL e parâmetros. As fixtures de rotas são associadas pelo
nome lógico da query, o mesmo id usado em `@Sql(queryArtifacts.taskList)`.

```ts
fixtures: {
  taskList: [
    { id: 1, title: "Aprender Empilha", done: false },
  ],
}
```

O valor continua sendo um array porque representa as linhas retornadas pelo
PostgreSQL. Para uma query que retorna uma linha, `@Result("one")` seleciona o
primeiro item.

Para chamadas diretas ao runner, uma fixture também pode ser indexada pelo SQL
compilado completo.

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
