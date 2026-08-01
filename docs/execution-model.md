---
title: Ordem de execução
description: Referência das fases de bootstrap e requisição.
prev: false
next: false
---

# Ordem de execução

Esta página é uma referência rápida. Para aprender o modelo, leia
[Entenda o Empilha](./mental-model.md).

## Bootstrap

```text
new Empilha()
  → configure recursos
  → validate controllers e dependências
  → initialize metadata, DI, SQL, OpenAPI e rotas
  → listen
  → close
```

No uso comum:

```ts
const app = new Empilha()
  .configure(config)
  .provide(Service)
  .usePlugin(plugin)
  .initialize([Controller]);

await app.run();
```

`initialize()` chama `validate()` automaticamente. Use as fases separadas
somente em integrações avançadas.

Rotas simples, sem middleware global, DI request-scoped ou dependências de
contexto, podem usar um caminho leve sem criar `RequestScope`. Isso não remove
timeout nem cancelamento: o `RequestContext.signal` continua sendo propagado
para o handler.

## Requisição

```text
parse da URL
  → route matching
  → limite de concorrência
  → criação do request scope, quando necessário
  → leitura do body, quando necessário
  → middleware global
  → middleware do controller
  → middleware da rota
  → autenticação e autorização
  → validação do body
  → normalização e validação da query
  → resolução do controller
  → BEGIN, quando transacional
  → @BeforeSql
  → SQL
  → método do controller
  → COMMIT ou ROLLBACK
  → @AfterCommit
  → schema e serialização da resposta
```

`@AfterResponse` é uma variação: o scheduler aceita o trabalho, responde `202`
e executa o método com o mesmo request scope.

## Erros

Uma falha interrompe as próximas etapas e segue:

```text
@Catch do controller
  → app.catch global
  → resposta padrão
```

Exceções de middleware participam do mesmo pipeline.

## Resumo por recurso

| Recurso | Momento |
| --- | --- |
| `@Body`, `@QueryParams` | antes do controller e do SQL |
| `@Use` | antes de autenticação e validação |
| `@Identity`, `@Roles`, `@Guard` | antes de validação e SQL |
| `@Sql` | antes do método do controller |
| `@Transaction` | envolve SQL e controller |
| `@AfterCommit` | depois de commit bem-sucedido |
| `@Returns` | ao produzir a resposta |
| `@AfterResponse` | depois que a tarefa é aceita, sem bloquear o HTTP |
