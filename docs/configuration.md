---
title: Configuração
description: Centralize porta, HTTP, plugins e banco em um arquivo tipado.
---

# Configuração

O bootstrap já acumulou banco, autenticação e políticas HTTP. Vamos mover
opções para um arquivo tipado e manter `app.ts` legível.

## Crie `empilha.config.ts`

Na raiz do projeto:

```ts
import { defineConfig } from "empilha";
import { postgres } from "@empilha/pg";
import { jwt } from "@empilha/jwt";

const logger = console;

const access = jwt({
  name: "access",
  secret: process.env.JWT_SECRET!,
  expiresIn: "7d",
  issuer: "tasks-api",
});

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 4000,
  },
  http: {
    cors: process.env.CORS_ORIGIN || false,
    maxBodyBytes: 1024 * 1024,
    bodyTimeout: 10_000,
    handlerTimeout: 30_000,
    maxConcurrentRequests: 500,
    shutdownTimeout: 15_000,
  },
  health: {
    timeout: 2_000,
    maxConcurrentRequests: 8,
  },
  openapi: {
    title: "Tasks API",
    version: "1.0.0",
  },
  plugins: [
    access.auth(),
    postgres({
      url: process.env.DATABASE_URL!,
      sql: "./src/queries",
      healthCheck: "postgres",
    }),
  ],
  logging: {
    logger,
  },
});
```

`defineConfig()` mantém autocomplete e verificação de tipos. Segredos continuam
no ambiente.

## Aplique no bootstrap

```ts
import { Empilha } from "empilha";
import config from "../empilha.config";
import { TaskController } from "./controllers/task.controller";

const app = new Empilha()
  .configure(config)
  .initialize([TaskController]);

await app.run();
```

`server.port` permite chamar `run()` sem argumento.

## Limites HTTP

| Opção | Protege contra | Padrão |
| --- | --- | --- |
| `maxBodyBytes` | body excessivo em memória; responde `413` quando excedido | 1 MiB |
| `bodyTimeout` | cliente lento enviando body | desativado |
| `handlerTimeout` | handler que não termina | 30 s |
| `maxConcurrentRequests` | saturação por concorrência | ilimitado |
| `shutdownTimeout` | drenagem que não termina | 15 s |
| `disposalTimeout` | fechamento de recursos que não termina | 15 s |

Passe `null` aos timeouts que aceitam essa opção para desabilitá-los.

## Health checks

Ao registrar ao menos um health check, a aplicação expõe `/health/live` e
`/health/ready`. O primeiro verifica somente se o processo está respondendo;
o segundo verifica se as dependências estão prontas para atender tráfego.

| Opção | Protege contra | Padrão |
| --- | --- | --- |
| `health.timeout` | dependência travada durante um check | 2 s |
| `health.maxConcurrentRequests` | excesso de probes consultando dependências | 8 |

Os checks de readiness são executados em paralelo. Use `null` em `timeout` ou
`maxConcurrentRequests` para remover o limite correspondente.

## CORS

CORS começa desativado:

```ts
http: {
  cors: "https://app.example.com",
}
```

Use uma origem explícita em produção. `false` mantém CORS desligado.

Para credenciais, cache de preflight e métodos/headers explícitos:

```ts
http: {
  cors: {
    origin: "https://app.example.com",
    methods: "GET, POST, HEAD",
    headers: "Content-Type, Authorization",
    credentials: true,
    maxAge: 600,
  },
}
```

O framework valida o preflight e envia `Vary: Origin`. Com `credentials: true`,
a origem não pode ser `*`.

## Configuração fluente continua disponível

O objeto centralizado é conveniente, não obrigatório:

```ts
const app = new Empilha()
  .configureHttp({ handlerTimeout: 20_000 })
  .openapi({ title: "Tasks API", version: "1.0.0" })
  .use(access.auth())
  .initialize([TaskController]);
```

Escolha um estilo principal para o projeto. Evite espalhar a mesma política
entre vários arquivos.

## Validação de respostas

Schemas de `@Returns` validam em runtime quando
`NODE_ENV !== "production"`. Para controlar explicitamente:

```ts
app.validateResponseSchemas(true);
```

Mesmo com validação desligada, a serialização pelo schema continua removendo
campos não declarados.

::: warning Configure antes de `initialize()`
Depois da preparação dos controllers, a aplicação não aceita mudanças que
alterariam o contrato das rotas.
:::
