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

Quando a rota tem muitos filtros, você pode validar a query inteira com
`@QueryParams`:

```ts
const Filters = t.Object({
  page: t.Integer({ minimum: 1 }),
  done: t.Optional(t.Boolean()),
});

@Get("/")
@QueryParams(Filters, { page: 1 })
list() {}
```

Deixe schemas e validações detalhadas para o próximo capítulo. Aqui, a regra
simples é: poucos valores usam `@Query`; muitos filtros usam `@QueryParams`.

## Headers

```ts
import { Header } from "empilha";

@Get("/")
list(@Header("x-tenant-id") tenantId: string) {
  return { tenantId, items: [] };
}
```

Nomes de headers são normalizados para minúsculas.

::: info Até aqui, tudo veio da URL
O próximo capítulo trata de JSON e schemas. Body exige validação porque é dado
estruturado enviado pelo cliente.
:::
