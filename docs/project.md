---
title: Organize o projeto
description: Separe o bootstrap do controller antes de a aplicação crescer.
---

# Organize o projeto

O primeiro endpoint cabia em um arquivo. Antes de adicionar regras, vamos
separar o ponto de entrada da borda HTTP e escolher a API que construiremos
durante o guia.

## A aplicação do guia

Vamos construir uma API de tarefas:

```text
GET    /tasks
GET    /tasks/:id
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```

Ela começa em memória. Mais adiante, os mesmos endpoints serão ligados ao
PostgreSQL, protegidos com JWT e testados sem servidor.

## Estrutura inicial

```text
.
├─ src/
│  ├─ controllers/
│  │  └─ task.controller.ts
│  └─ app.ts
├─ tests/
├─ package.json
└─ tsconfig.json
```

Crie `src/controllers/task.controller.ts`:

```ts
import { Controller, Get } from "empilha";

@Controller("/tasks")
export class TaskController {
  @Get("/")
  list() {
    return [];
  }
}
```

Agora deixe `src/app.ts` responsável apenas pelo bootstrap:

```ts
import { createApplication, defineModule } from "empilha";
import { TaskController } from "./controllers/task.controller";

const AppModule = defineModule({
  name: "app",
  controllers: [TaskController],
});
const app = await createApplication(AppModule);

await app.run({ port: 4000 });
```

Teste:

```sh
curl http://localhost:4000/tasks
# []
```

## Por que separar agora

O controller descreve HTTP. `app.ts` monta a aplicação. Essa fronteira evita
que configuração de servidor, banco ou plugins se espalhe pelas rotas.

Adicione scripts úteis ao `package.json`:

```json
{
  "scripts": {
    "dev": "bun --watch src/app.ts",
    "start": "bun src/app.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  }
}
```

Durante o desenvolvimento:

```sh
bun run dev
```

::: tip O scaffold oficial
O repositório do Empilha também fornece um scaffold com configuração,
PostgreSQL e testes. O guia começa manualmente para que nenhuma parte pareça
mágica.
:::
