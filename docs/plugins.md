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
import { createApplication, defineDeclarativePlugin, defineModule } from "empilha";

export const observability = defineDeclarativePlugin({
  name: "observability",
  version: "1.0.0",
  register(context) {
    context.provider({ provide: "telemetry", useValue: telemetry });
  },
});
```

Declare o plugin no módulo:

```ts
const AppModule = defineModule({
  name: "app",
  controllers: [TaskController],
  plugins: [observability],
});
const app = await createApplication(AppModule);
```

Middleware global pode ser aplicado no callback `configure`; plugins declarativos
ficam no campo `plugins` do módulo.

## Plugin configurável

```ts
type CacheOptions = {
  url: string;
};

export function cache(options: CacheOptions) {
  return defineDeclarativePlugin({
    name: "cache",
    version: "1.0.0",
    register(context) {
      const client = createCache(options.url);
      context.provider({ provide: "cache", useValue: client });
    },
  });
}
```

## Serviço injetável em rota

Plugins como `@empilha/jwt` registram um serviço com um token próprio:

```ts
context.provider({ provide: "access", useValue: service });
```

No controller, injete-o com:

```ts
login(@Inject("access") access: JwtService) {}
```

No JWT oficial, prefira o token exportado pelo serviço: `@Inject(access.token)`.

O registro por token é voltado a integrações de plugin. Para dependências
normais de construtor, prefira `provide()`.

## Hooks disponíveis

| Hook | Momento |
| --- | --- |
| `register` | durante a compilação do módulo |
| `ready` | depois que todos os plugins foram registrados |
| `onClose` | durante o fechamento |

O contexto do plugin expõe registros declarativos para providers, autenticação,
PostgreSQL e queries. O módulo é compilado antes de a aplicação começar a
atender requisições.
