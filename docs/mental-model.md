---
title: Entenda o Empilha
description: Separe configuração, preparação e execução de requisições.
---

# Entenda o `Empilha`

Antes de criar mais endpoints, vale entender quando cada parte da aplicação
executa. O Empilha trabalha em duas linhas do tempo.

| Linha do tempo | Frequência | Exemplo |
| --- | --- | --- |
| Bootstrap | uma vez por processo | configurar, validar e registrar rotas |
| Requisição | uma vez por chamada | validar entrada, chamar controller e responder |

## Bootstrap

Uma aplicação maior tem esta forma:

```ts
const app = new Empilha()
  .configure(config)
  .postgres(pool, { sql: "./src/queries" })
  .provide(TaskService)
  .auth(verifyToken)
  .useMiddleware(logger)
  .initialize([TaskController]);

await app.run();
```

Leia de cima para baixo:

```text
configurar recursos
    ↓
initialize(): validar e compilar controllers
    ↓
run(): começar a atender
```

Tudo que uma rota precisa deve existir antes de `initialize()`. Assim, uma
query ausente ou uma dependência impossível derruba o processo no bootstrap,
em vez de surpreender o primeiro usuário.

## O que `initialize()` faz

`initialize()`:

- valida o grafo de dependências;
- cria ou prepara os controllers;
- combina prefixos e caminhos;
- compila leitura e validação de argumentos;
- confere queries e bindings SQL;
- registra as rotas no adaptador HTTP.

Ele não abre uma porta. Isso acontece somente em `listen()` ou `run()`.

## Requisição

Depois do bootstrap, uma requisição percorre um pipeline fixo:

```text
rota
  → middleware
  → autenticação
  → validação
  → SQL, quando houver
  → controller
  → serialização da resposta
```

Se uma etapa falha, as seguintes não executam. Um body inválido não chega ao
controller. Uma autorização negada não executa SQL.

## Decorators descrevem

Um decorator guarda metadata. Ele não executa a rota ao importar o arquivo:

```ts
@Get("/:id")
find(@Param("id", Number) id: number) {
  return { id };
}
```

Aqui os decorators dizem:

- aceite `GET /:id`;
- leia `id` do caminho;
- converta o valor para número.

`initialize()` transforma essa descrição em código de execução.

::: warning A ordem que importa
Configure recursos antes de `initialize()` e chame `run()` por último. A ordem
visual dos decorators no mesmo método não altera o pipeline.
:::
