---
title: Plugins
description: Empacote configuração reutilizável para o Empilha.
prev: false
next: false
---

# Plugins

Um plugin recebe a instância do `Empilha` durante a fase de configuração.
Use plugins para agrupar integração, providers, hooks e rotas auxiliares que
serão reutilizados em mais de uma aplicação.

## Plugin mínimo

```ts
import { definePlugin, requestLogger } from "empilha";

export const observability = definePlugin((app) => {
  app.use(requestLogger());
  app.healthCheck("telemetry", () => telemetry.ready());
  app.onClose(() => telemetry.close());
});
```

Instale com `use()`:

```ts
const app = new Empilha()
  .use(observability)
  .initialize([TaskController]);
```

`use()` distingue um plugin de uma função de middleware.

## Plugin configurável

```ts
type CacheOptions = {
  url: string;
};

export function cache(options: CacheOptions) {
  return definePlugin((app) => {
    const client = createCache(options.url);

    app.provide("cache", { useValue: client });
    app.healthCheck("cache", () => client.ping());
    app.onClose(() => client.close());
  });
}
```

## Serviço injetável em rota

Plugins como `@empilha/jwt` registram um serviço nomeado:

```ts
app.registerPluginService("access", service);
```

No controller, injete-o com:

```ts
login(@Inject("access") access: JwtService) {}
```

`registerPluginService` é voltado a integrações de plugin. Para dependências
normais de construtor, prefira `provide()`.

## Hooks disponíveis

| Hook | Momento |
| --- | --- |
| `onBeforeValidate` | antes de validar controllers |
| `onAfterInitialize` | depois de registrar controllers |
| `onStart` | quando o servidor inicia |
| `onClose` | durante o fechamento |

Plugins devem ser instalados antes de `initialize()`.
