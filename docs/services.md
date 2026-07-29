---
title: Services e injeção
description: Tire a regra de negócio do controller e injete suas dependências.
---

# Services e injeção

Até agora o controller fabricou respostas. Vamos criar um service em memória
para que o controller volte a cuidar somente de HTTP.

## Crie o service

Crie `src/services/task.service.ts`:

```ts
import { Injectable } from "empilha";
import type { CreateTask } from "../schemas/task.schema";

export type TaskRecord = CreateTask & {
  id: number;
  done: boolean;
};

@Injectable({ scope: "singleton" })
export class TaskService {
  private readonly tasks: TaskRecord[] = [];
  private nextId = 1;

  list(): TaskRecord[] {
    return this.tasks;
  }

  find(id: number): TaskRecord | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(input: CreateTask): TaskRecord {
    const task = { id: this.nextId++, ...input, done: false };
    this.tasks.push(task);
    return task;
  }
}
```

## Injete no controller

```ts
import { Controller, Inject } from "empilha";
import { TaskService } from "../services/task.service";

@Controller("/tasks")
export class TaskController {
  constructor(
    @Inject(TaskService)
    private readonly tasks: TaskService,
  ) {}

  // rotas usam this.tasks
}
```

`@Inject(TaskService)` torna a dependência explícita. O Empilha não tenta
adivinhar tipos de parâmetros por reflection.

Registre o provider antes de inicializar:

```ts
const app = new Empilha()
  .provide(TaskService)
  .initialize([TaskController]);
```

Agora as rotas apenas traduzem HTTP:

```ts
@Get("/")
@Returns(t.Array(Task))
list() {
  return this.tasks.list();
}

@Post("/")
@Returns(Task)
create(@Body(CreateTask) input: CreateTaskInput) {
  return this.tasks.create(input);
}
```

## Outras formas de provider

Uma dependência pode vir de uma classe, factory ou valor:

```ts
app
  .provide(TaskService)
  .provide("clock", { useValue: () => new Date() })
  .provide("mailer", {
    useFactory: () => createMailer(process.env.MAIL_URL!),
  });
```

Cada configuração deve usar exatamente uma estratégia: `useClass`,
`useFactory` ou `useValue`.

## Por que isso ajuda

O controller não sabe onde tarefas são guardadas. Quando trocarmos memória por
PostgreSQL, o contrato HTTP poderá continuar igual. Em testes, o provider
também pode ser substituído.

::: warning Dependências de construtor precisam de `@Inject`
Se um parâmetro não tiver token, `initialize()` falha informando a classe e a
posição. O erro aparece no bootstrap, não durante uma requisição.
:::
