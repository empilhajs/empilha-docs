---
title: Escopos e contexto
description: Escolha o ciclo de vida de providers e acesse dados da requisição atual.
---

# Escopos e contexto

Um provider não precisa viver pelo mesmo tempo que outro. O escopo define
quando uma instância é criada e reutilizada.

## Escolha pelo estado

| Escopo | Uma instância… | Use para |
| --- | --- | --- |
| `singleton` | por aplicação | serviços sem estado de requisição, caches, clientes |
| `request` | por requisição | tenant, unidade de trabalho, dados do usuário |
| `transient` | por resolução | objetos descartáveis e baratos |

Declare o escopo na classe:

```ts
@Injectable({ scope: "request" })
class RequestAudit {
  readonly events: string[] = [];
}
```

Ou no provider:

```ts
app.provide(RequestAudit, {
  useClass: RequestAudit,
  scope: "request",
});
```

Um singleton não pode depender de um provider `request`. O framework detecta
essa relação inválida durante o bootstrap.

## O controller acompanha suas dependências

Se um controller depende de `RequestAudit`, ele também é resolvido por
requisição. Sem dependências request-scoped, o controller é singleton.

Você não precisa administrar essa escolha manualmente.

## Contexto da requisição

Dados que já pertencem ao pipeline ficam no `RequestScope`:

```ts
import { Context, type RequestScope } from "empilha";

@Get("/debug")
debug(@Context() context: RequestScope) {
  return {
    requestId: context.requestId,
    method: context.request.method,
  };
}
```

Em um service chamado pela rota, acesse o mesmo objeto com
`requestContext()`:

```ts
import { requestContext } from "empilha";

const { requestId, signal, user } = requestContext();
```

Fora de uma requisição, `requestContext()` lança um erro.

## Cancelamento

O `signal` é abortado em timeout ou shutdown:

```ts
const response = await fetch(remoteUrl, {
  signal: requestContext().signal,
});
```

O cancelamento é cooperativo. A biblioteca chamada precisa aceitar
`AbortSignal`.

## Trabalho associado à requisição

`waitUntil()` permite responder sem destruir o scope antes de uma tarefa
terminar:

```ts
const context = requestContext();
context.waitUntil(audit.flush());
```

O shutdown aguarda essas tarefas. Para jobs duráveis, use uma fila externa.

::: tip Regra prática
Comece com `singleton`. Use `request` somente quando a instância realmente
guardar estado de uma chamada.
:::
