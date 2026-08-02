---
title: OpenAPI
description: Gere contrato OpenAPI e Swagger UI a partir das rotas.
---

# OpenAPI

Os schemas e decorators já descrevem a API. O Empilha usa essas mesmas
declarações para gerar OpenAPI 3.1.

## Ative

```ts
const AppModule = defineModule({
  name: "app",
  controllers: [TaskController],
});
const app = await createApplication(AppModule, {
  configure: (app) => app.openapi({
    title: "Tasks API",
    version: "1.0.0",
  }),
});
```

Ou configure em `empilha.config.ts`, como no capítulo anterior.

Dois endpoints aparecem:

| Endpoint | Conteúdo |
| --- | --- |
| `GET /openapi.json` | documento OpenAPI 3.1 |
| `GET /docs` | Swagger UI |

## O documento vem do contrato

| Declaração | OpenAPI |
| --- | --- |
| `@Controller`, `@Get`, `@Post`… | path e método |
| `@Param`, `@Query`, `@Header` | parâmetros |
| `@QueryParams` | parâmetros, tipos e defaults |
| `@Body` | request body |
| `@Returns` | schema de sucesso |
| `@Status` | status de sucesso |
| `@Identity`, `@Roles`, `@Guard` | segurança bearer |
| `@NotFoundWhenEmpty` | resposta `404` |

O endpoint de criação já é documentável:

```ts
@Post("/")
@Body(CreateTask)
@Returns(Task)
@Roles("user")
@Sql("taskCreate")
@Result("one")
create() {}
```

Declare `@Returns(Schema)` sempre que possível. Sem esse decorator, a rota
continua funcionando, mas o OpenAPI só consegue descrever a resposta como
`Successful response`, sem um schema de conteúdo.

Exemplos definidos no schema TypeBox também aparecem no Swagger UI:

```ts
const Url = t.String({ examples: ["https://example.com"] });
```

Não existe um segundo arquivo descrevendo body e resposta.

## Agrupe por tags

```ts
@Controller("/tasks", { tags: ["Tasks"] })
export class TaskController {}
```

Sem tags explícitas, o nome do controller é usado.

## Erros

Todas as rotas incluem respostas padronizadas `400` e `500`. Rotas protegidas
incluem `401` e `403`; `@NotFoundWhenEmpty` adiciona `404`.

## Swagger UI e internet

`/openapi.json` é servido localmente. A interface `/docs` carrega assets do
Swagger UI pelo jsDelivr e precisa de internet no navegador.

::: tip O schema é a fonte
Se a documentação estiver errada, corrija o decorator ou schema da rota. Não
mantenha uma descrição paralela.
:::
