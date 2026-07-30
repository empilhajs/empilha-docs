---
title: Ciclo de vida
description: Inicie, execute trabalho em background e encerre a aplicação com segurança.
next: false
---

# Ciclo de vida

Uma aplicação não termina quando responde HTTP. Ela também precisa drenar
requisições, concluir tarefas aceitas e fechar recursos.

## `run()` para o caso comum

```ts
await app.run({ port: 4000 });
```

`run()`:

- inicia o servidor;
- registra shutdown para `SIGINT` e `SIGTERM`;
- imprime URLs da API, docs e health check quando disponíveis.

Use `listen(port)` quando outro código controlar sinais e encerramento.

## Trabalho depois da resposta

Para uma notificação que não precisa atrasar o cliente:

```ts
@Post("/:id/notify")
@AfterResponse()
async notify(@Param("id", Number) id: number) {
  await mailer.sendTaskReminder(id);
}
```

A rota responde `202` e o método continua com o mesmo contexto de requisição.

Configure limites:

```ts
app.backgroundJobs({
  concurrency: 8,
  queueLimit: 100,
});
```

Com worker e fila ocupados, uma nova tarefa recebe `503`.

Capture falhas:

```ts
app.onBackgroundError((error, route) => {
  logger.error({ error, route });
});
```

Esse scheduler é em memória. Não oferece persistência, retry ou recuperação
depois que o processo morre.

## Health checks próprios

```ts
app.healthCheck("mailer", async () => {
  return mailer.ping();
});
```

Ao menos um check registra dois endpoints:

- `GET /health/live` confirma que o processo HTTP está vivo. Ele não consulta
  dependências e deve ser usado pela sonda de liveness.
- `GET /health/ready` verifica todas as dependências registradas e deve ser
  usado pela sonda de readiness ou pelo load balancer.

Os checks de readiness são executados em paralelo. Se qualquer um falhar ou
exceder o timeout, `/health/ready` responde `503` com status `degraded`.

Configure o prazo individual dos checks e quantas requisições de readiness
podem executar ao mesmo tempo:

```ts
app.configureHealthChecks({
  timeout: 2_000,
  maxConcurrentRequests: 8,
});
```

Use `null` em qualquer opção para remover o respectivo limite.

## Registre recursos próprios

```ts
app.onClose(async () => {
  await client.disconnect();
});
```

Providers também podem declarar descarte:

```ts
app.provide("mailer", {
  useFactory: () => createMailer(),
  onDispose: (mailer) => mailer.close(),
});
```

## Shutdown ordenado

`app.close()`:

1. para de aceitar novas conexões;
2. aguarda requisições e tarefas aceitas;
3. descarta scopes de requisição;
4. executa hooks e fecha providers raiz.

`shutdownTimeout` limita a espera. Quando vence, os `AbortSignal` ativos são
abortados e conexões restantes são fechadas.

Promessas que ignoram o signal não podem ser interrompidas à força pelo
JavaScript.

### Cancelar I/O em timeout e shutdown

Na maioria das rotas, não é preciso fazer nada. Um caso comum é consultar a
API de uma transportadora para acompanhar uma entrega. Passe `context.signal`
ao `fetch` para cancelar essa chamada se a rota exceder o timeout ou a
aplicação receber um sinal de encerramento:

```ts
@Get("/orders/:id/tracking")
async tracking(
  @Param("id") orderId: string, 
  @Context() context: RequestScope
) {
  const response = await fetch(
    `https://api.carrier.example/orders/${orderId}/tracking`,
    {
      headers: { 
        Authorization: `Bearer ${process.env.CARRIER_TOKEN}` 
      },
      signal: context.signal,
    },
  );

  return response.json();
}
```

Se a operação não aceitar `AbortSignal`, ela pode continuar até terminar mesmo
depois de o cliente receber `504`. Nesse caso, o framework não consegue parar
o trabalho por conta própria.

Se o shutdown exceder `shutdownTimeout`, `app.close()` rejeita e os recursos
são fechados quando as requisições em andamento terminarem.

## Hooks de bootstrap

Plugins e integrações podem participar das fases:

```ts
app
  .onBeforeValidate((controllers) => {})
  .onAfterInitialize((controllers) => {})
  .onStart(async () => {})
  .onClose(async () => {});
```

Registre `onBeforeValidate()` e `onAfterInitialize()` durante a configuração.
`onStart()` pode ser registrado até antes de `listen()` ou `run()`; depois que
o servidor inicia, o framework rejeita o registro porque o hook não teria mais
como executar. `onClose()` deve ser registrado antes de `app.close()` concluir.

Na maioria das aplicações, `configure → initialize → run` é suficiente.

::: info Você chegou ao fim da trilha
Você começou com uma rota e terminou com contratos validados, DI, SQL,
autenticação, testes e shutdown. As páginas de referência abaixo servem para
consulta, não como continuação obrigatória.
:::
