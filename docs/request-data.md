---
title: Dados da requisição
description: Leia path, query string e headers nos argumentos da rota.
---

# Dados da requisição

Agora a API precisa encontrar uma tarefa e filtrar a listagem. Em vez de
analisar URLs manualmente, declare de onde vem cada argumento.

## Parâmetros do caminho

```ts
import { Get, Param } from "empilha";

@Get("/:id")
find(@Param("id", Number) id: number) {
  return { id, title: "Aprender Empilha" };
}
```

Para `GET /tasks/42`, `id` recebe o número `42`.

Sem o segundo argumento, valores de path são strings:

```ts
find(@Param("id") id: string) {}
```

`Number` e `Boolean` fazem conversões simples. Schemas, vistos na próxima
página, também podem validar parâmetros.

## Query string

```ts
import { Query, QueryParams, t } from "empilha";

@Get("/")
list(
  @Query("done", Boolean) done?: boolean,
  @Query("page", Number) page = 1,
) {
  return { filters: { done, page }, items: [] };
}
```

Uma chamada a `/tasks?done=true&page=2` entrega `true` e `2` ao método.
Defaults do TypeScript continuam funcionando quando o parâmetro não existe.

Parâmetros repetidos são preservados como arrays:

```text
/tasks?tag=backend&tag=typescript
```

Com `@Request()`, o valor será:

```ts
{ tag: ["backend", "typescript"] }
```

Para validar e converter uma lista, declare um array no schema:

```ts
const Filters = t.Object({
  tag: t.Array(t.String()),
});
```

## Headers

```ts
import { Header } from "empilha";

@Get("/")
list(@Header("x-tenant-id") tenantId: string) {
  return { tenantId, items: [] };
}
```

Nomes de headers são normalizados para minúsculas.

## Quando precisar do conjunto inteiro

`@Request()` injeta a requisição normalizada:

```ts
import { Request, type RequestContext } from "empilha";

@Get("/debug")
debug(@Request() request: RequestContext) {
  return {
    method: request.method,
    path: request.pathname,
    signal: request.signal,
    query: request.query,
    headers: request.headers,
  };
}
```

### Valores originais e valores tratados

O `RequestContext` oferece quatro objetos para parâmetros. Todos são somente
leitura:

| Propriedade | Conteúdo |
| --- | --- |
| `rawParams` | parâmetros do caminho, sempre como texto |
| `params` | parâmetros do caminho disponíveis para a rota |
| `rawQuery` | query string original, antes de conversões e defaults |
| `query` | query string usada pela rota, possivelmente normalizada |

Na prática, você raramente precisa acessá-los diretamente. Use `@Param`,
`@Query` e `@Header` quando a rota usa poucos valores; assim o contrato fica
visível na assinatura.

Use `@QueryParams(Schema)` quando quiser validar e normalizar a query inteira:

```ts
const Filters = t.Object({
  page: t.Integer({ minimum: 1 }),
  done: t.Optional(t.Boolean()),
});

@Get("/")
@QueryParams(Filters, { page: 1 })
list() {}
```

Nesse caso, `query` recebe os defaults e conversões definidos pelo schema, mas
`rawQuery` continua representando exatamente os valores recebidos na URL.
O framework cria um novo objeto para `query`; não altere nenhuma dessas
propriedades manualmente.

Use `@Request()` somente quando precisar de várias informações da requisição
ao mesmo tempo. Em services, `requestContext()` só funciona quando existe um
`RequestScope` ativo. Rotas leves podem não criar esse escopo; nesses casos,
`@Context()`, DI com escopo de request e `requestContext()` não ficam
disponíveis automaticamente.

`request.signal` é abortado quando o cliente desconecta ou quando o timeout da
requisição vence. Passe-o para operações cooperativas, como `fetch`:

```ts
@Get("/remote")
async remote(@Request() request: RequestContext) {
  const response = await fetch("https://api.example.com/data", {
    signal: request.signal,
  });

  return response.json();
}
```

O `signal` continua disponível no `RequestContext` mesmo em uma rota leve.

::: info Até aqui, tudo veio da URL
O próximo capítulo trata de JSON e schemas. Body exige validação porque é dado
estruturado enviado pelo cliente.
:::
