---
title: Middleware
description: Aplique políticas antes e depois das rotas.
---

# Middleware

Middleware é adequado para comportamento que atravessa várias rotas: log,
correlação, rate limit e auditoria. Regra de tarefa continua no service.

## A forma de um middleware

```ts
import type { MiddlewareFn } from "empilha";

const timing: MiddlewareFn = async (request, next) => {
  const startedAt = performance.now();

  const response = await next();

  console.log({
    method: request.method,
    path: request.pathname,
    status: response.status,
    durationMs: performance.now() - startedAt,
  });

  return response;
};
```

O código antes de `next()` executa na ida. O código depois executa na volta,
com acesso à resposta.

## Três alcances

Global:

```ts
app.use(timing);
```

Controller:

```ts
@Use(timing)
@Controller("/tasks")
class TaskController {}
```

Rota:

```ts
@Use(rateLimit)
@Post("/")
create() {}
```

A ordem é:

```text
global → controller → rota → autorização → validação → controller
```

## Interrompa a cadeia

Um middleware pode responder sem chamar `next()`:

```ts
const maintenance: MiddlewareFn = async (_request, _next) => ({
  status: 503,
  body: JSON.stringify({ error: "Em manutenção" }),
});
```

Nesse caso, autorização, validação, SQL e controller não executam.

`next()` pode ser chamado uma única vez.

## Logger pronto

Para o caso comum:

```ts
import { requestLogger } from "empilha";

app.use(requestLogger());
```

Ou direcione os registros:

```ts
app.use(requestLogger((entry) => logger.info(entry)));
```

Cada entrada contém nível, `requestId`, método, path, status e duração:

```ts
{
  level: "info",
  requestId: "c2d8...",
  method: "GET",
  pathname: "/tasks",
  status: 200,
  durationMs: 4,
}
```

O `requestId` é único por requisição e permite agrupar logs da mesma execução.
Ele também é enviado automaticamente ao cliente no header `X-Request-Id`.

## Logger da aplicação

O Empilha usa `console` como fallback, mas você pode configurar um logger por
aplicação para encaminhar eventos do framework ao seu provedor de observabilidade:

```ts
app.logger({
  info: (details, message) => logger.info(details, message),
  warn: (details, message) => logger.warn(details, message),
  error: (details, message) => logger.error(details, message),
});
```

Também é possível informar o logger na configuração centralizada, em
`logging.logger`. O logger deve ser definido durante a configuração da app.

## Parâmetros crus em middleware

Middlewares e plugins que precisam da URL original usam `rawParams` e
`rawQuery`. Esses campos preservam texto (e arrays de texto em queries
repetidas), enquanto `query` é o valor de trabalho da rota e pode ser
normalizado por `@QueryParams()`.

```ts
// GET /tasks/42?limit=10
request.rawParams.id // "42"
request.rawQuery.limit // "10"
request.query.limit // 10, após @QueryParams(t.Object({ limit: t.Integer() }))
```

## Modifique a resposta

```ts
import { requestContext } from "empilha";

const requestIdHeader: MiddlewareFn = async (_request, next) => {
  const response = await next();
  response.headers = {
    ...response.headers,
    "x-request-id": requestContext().requestId,
  };
  return response;
};
```

::: tip Escolha o menor alcance
Se uma política vale para uma rota, use `@Use` nela. Promova para controller
ou global somente quando a regra realmente for compartilhada.
:::
