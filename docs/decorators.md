---
title: Decorators
description: Referência rápida dos decorators públicos do Empilha.
prev: false
next: false
---

# Decorators

Use esta página para consulta. Os capítulos do guia apresentam cada decorator
no contexto em que ele se torna necessário.

## Controller e rotas

| Decorator | Aplicação | Efeito |
| --- | --- | --- |
| `@Controller(prefix, options?)` | classe | prefixo, tags, middleware e auth compartilhados |
| `@Get(path)` | método | rota GET |
| `@Post(path)` | método | rota POST |
| `@Put(path)` | método | rota PUT |
| `@Patch(path)` | método | rota PATCH |
| `@Delete(path)` | método | rota DELETE |
| `@Use(...middlewares)` | classe ou método | middleware no alcance declarado |

Opções de controller:

```ts
type ControllerOptions = {
  tags?: readonly string[];
  middlewares?: readonly MiddlewareFn[];
  auth?: true | string | readonly string[];
};
```

## Entrada

| Decorator | Aplicação | Efeito |
| --- | --- | --- |
| `@Param(name, typeOrSchema?)` | parâmetro | lê um segmento da rota |
| `@Query(name, typeOrSchema?)` | parâmetro | lê um item da query string |
| `@Header(name, typeOrSchema?)` | parâmetro | lê um header |
| `@Body(schema)` | parâmetro ou método | valida JSON e opcionalmente injeta |
| `@QueryParams(schema, defaults?)` | método | normaliza e valida a query inteira |
| `@Request()` | parâmetro | injeta `RequestContext` |
| `@Context()` | parâmetro | injeta `RequestScope` |
| `@Identity()` | parâmetro | exige auth e injeta o payload |
| `@Inject(token)` | construtor ou parâmetro de rota | injeta DI ou serviço de plugin |

`Param`, `Query` e `Header` aceitam `Number`, `Boolean` ou schema TypeBox como
segundo argumento.

## Resposta

| Decorator | Efeito |
| --- | --- |
| `@Status(code)` | sobrescreve o status de sucesso |
| `@Returns(schema)` | valida, serializa e documenta JSON |
| `@Produces(contentType)` | define o content type; `text/*` produz texto |

## Segurança

| Decorator | Efeito |
| --- | --- |
| `@Identity()` | token válido, sem role obrigatória |
| `@Roles(...roles)` | token válido com uma das roles |
| `@Guard(handler)` | valida diretamente o bearer token |

`defineRoles()` está disponível em `empilha/decorators` para criar helpers de
role tipados.

## SQL

| Decorator | Efeito |
| --- | --- |
| `@Sql(name, options?)` | associa uma query registrada |
| `@Result("many" \| "one" \| "none")` | escolhe o valor extraído das linhas |
| `@NotFoundWhenEmpty()` | transforma zero linhas em `404` |
| `@Transaction("read" \| "write")` | envolve rota em transação |
| `@BeforeSql(method?)` | executa preparação antes da query |
| `@AfterCommit(method)` | executa hook depois do commit |

## Ciclo de vida e erros

| Decorator | Efeito |
| --- | --- |
| `@AfterResponse()` | responde `202` e agenda o método |
| `@Catch(...ErrorTypes)` | trata tipos de erro no controller |

## Imports

Todos os decorators principais são exportados por:

```ts
import { Controller, Get, Body, Returns } from "empilha";
```

Também podem ser agrupados:

```ts
import { Controller, Get, Body, Returns } from "empilha/decorators";
```

Schemas:

```ts
import { t, type Infer } from "empilha";
```
