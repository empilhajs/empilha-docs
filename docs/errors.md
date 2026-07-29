---
title: Erros
description: Modele falhas de domínio e transforme-as em respostas HTTP.
---

# Erros

`TaskService.find()` pode não encontrar uma tarefa. Essa é uma falha esperada,
então ela deve ter um contrato HTTP previsível.

## Erros HTTP diretos

Para um caso simples:

```ts
import { NotFoundError } from "empilha";

@Get("/:id")
find(@Param("id", Number) id: number) {
  const task = this.tasks.find(id);
  if (!task) throw new NotFoundError("Tarefa não encontrada");
  return task;
}
```

O cliente recebe:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "error": "Tarefa não encontrada"
}
```

Use `HttpError` para outro status:

```ts
throw new HttpError(409, "A tarefa já foi concluída");
```

## Erros de domínio

Um service reutilizável não precisa importar conceitos HTTP:

```ts
export class TaskNotFoundError extends Error {}

class TaskService {
  get(id: number) {
    const task = this.find(id);
    if (!task) throw new TaskNotFoundError();
    return task;
  }
}
```

Converta esse erro no controller:

```ts
import { Catch } from "empilha";

@Catch(TaskNotFoundError)
handleTaskNotFound() {
  return {
    status: 404,
    body: { error: "Tarefa não encontrada" },
  };
}
```

`@Catch` vale para as rotas daquele controller.

## Regra global

Se o mesmo erro aparece em vários controllers:

```ts
app.catch(TaskNotFoundError, () => ({
  status: 404,
  body: { error: "Tarefa não encontrada" },
}));
```

A resolução segue:

```text
@Catch do controller → app.catch global → resposta padrão
```

Handlers do tipo mais específico têm prioridade dentro do controller.

## O que acontece com erros inesperados

Uma exceção sem tratamento responde:

```json
{
  "error": "Internal server error"
}
```

com status `500`. Detalhes internos não são expostos ao cliente.

Erros de validação são tratados pelo framework como `400` e mantêm a lista
estruturada de problemas.

::: warning Não transforme falha em sucesso
Um catcher deve preservar um status HTTP coerente. Retornar apenas um objeto
com mensagem de erro não o transforma automaticamente em resposta `4xx`.
:::
