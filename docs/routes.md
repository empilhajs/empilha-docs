---
title: Controllers e rotas
description: Agrupe endpoints e componha seus caminhos.
---

# Controllers e rotas

Um controller agrupa endpoints que pertencem ao mesmo recurso. Para tarefas,
o prefixo comum é `/tasks`.

## O caminho é composto

```ts
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from "empilha";

@Controller("/tasks")
export class TaskController {
  @Get("/")
  list() {}

  @Get("/:id")
  find() {}

  @Post("/")
  create() {}

  @Patch("/:id")
  update() {}

  @Delete("/:id")
  remove() {}
}
```

O framework combina o prefixo da classe com o caminho do método:

| Controller | Rota | Endpoint final |
| --- | --- | --- |
| `/tasks` | `/` | `GET /tasks` |
| `/tasks` | `/:id` | `GET /tasks/:id` |
| `/tasks` | `/:id` | `PATCH /tasks/:id` |

Os caminhos são normalizados. Você não precisa administrar barras duplicadas.

## Um método, uma rota

Cada método de controller pode ter somente um decorator HTTP. Se o mesmo
método receber `@Get` e `@Post`, o bootstrap falha.

Os métodos disponíveis são:

```ts
@Get(path)
@Post(path)
@Put(path)
@Patch(path)
@Delete(path)
```

## Registre controllers explicitamente

O bootstrap continua mostrando todos os pontos de entrada:

```ts
const app = new Empilha().initialize([
  TaskController,
  UserController,
]);
```

Isso permite criar duas aplicações no mesmo processo com conjuntos diferentes
de controllers. Não existe um registry global alimentado por imports.

## Opções compartilhadas

O segundo argumento de `@Controller` define padrões para todas as rotas:

```ts
@Controller("/tasks", {
  tags: ["Tasks"],
  middlewares: [audit],
  auth: "user",
})
export class TaskController {}
```

Você ainda não precisa dessas opções. Elas reaparecerão nos capítulos de
middleware, autenticação e OpenAPI.

::: tip Responsabilidade do controller
O controller traduz HTTP para chamadas da aplicação. Regras de negócio irão
para services no capítulo 8.
:::
