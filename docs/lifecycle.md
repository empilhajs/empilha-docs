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

Ao menos um check registra `GET /health`. Se qualquer check falhar, a rota
responde `503`.

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

## Hooks de bootstrap

Plugins e integrações podem participar das fases:

```ts
app
  .onBeforeValidate((controllers) => {})
  .onAfterInitialize((controllers) => {})
  .onStart(async () => {})
  .onClose(async () => {});
```

Na maioria das aplicações, `configure → initialize → run` é suficiente.

::: info Você chegou ao fim da trilha
Você começou com uma rota e terminou com contratos validados, DI, SQL,
autenticação, testes e shutdown. As páginas de referência abaixo servem para
consulta, não como continuação obrigatória.
:::
