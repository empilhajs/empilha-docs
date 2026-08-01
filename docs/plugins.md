---
title: Plugins
description: Empacote configuração reutilizável para o Empilha.
prev: false
next: false
---

# Plugins

Um plugin recebe um contexto limitado de configuração durante a fase de
configuração. Use plugins para agrupar integrações e registros reutilizáveis.

## Plugin mínimo

```ts
import { definePlugin, requestLogger } from "empilha";

export const observability = definePlugin((context) => {
  context.useMiddleware(requestLogger());
  context.registerPluginService("telemetry", telemetry);
});
```

Instale com `usePlugin()`:

```ts
const app = new Empilha()
  .usePlugin(observability)
  .initialize([TaskController]);
```

Middleware e plugins têm métodos de registro separados: use
`useMiddleware()` para middleware e `usePlugin()` para plugins.

## Plugin configurável

```ts
type CacheOptions = {
  url: string;
};

export function cache(options: CacheOptions) {
  return definePlugin((context) => {
    const client = createCache(options.url);

    context.registerPluginService("cache", client);
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

O contexto do plugin expõe `configure()`, `configureHttp()`,
`useMiddleware()`, `registerPluginService()`, `registerQuery()` e o adaptador
HTTP. Plugins devem ser instalados antes de `initialize()`.
