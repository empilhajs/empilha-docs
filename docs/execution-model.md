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
defineModule(...)
  → createApplication()
  → validar grafo e compilar metadata, DI, SQL, OpenAPI e rotas
  → listen
  → close
```

No uso comum:

```ts
const AppModule = defineModule({
  name: "app",
  controllers: [Controller],
  providers: [Service],
  plugins: [plugin],
});
const app = await createApplication(AppModule, { runtime: config });

await app.run();
```

`createApplication()` valida o grafo antes de ativar o runtime. Não há fases
públicas separadas para registrar controllers.

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

`@BeforeSql()` sem nome é uma exceção importante: o próprio método do
controller é usado como hook, executa antes do SQL e não volta a executar
depois. Com `@BeforeSql("nomeDoHook")`, o hook nomeado roda antes do SQL e o
método da rota roda normalmente depois da query.

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
