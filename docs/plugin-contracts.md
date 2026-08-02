---
title: Plugins declarativos
description: Publique capabilities e valide contratos entre integrações.
---

# Plugins declarativos

Plugins declarativos descrevem sua identidade, versão, capabilities e registro
de recursos. A aplicação resolve esses contratos antes de executar o plugin.

```ts
import { defineDeclarativePlugin } from "empilha";

export const metrics = defineDeclarativePlugin({
  name: "acme/metrics",
  version: "1.2.0",
  provides: [{ name: "telemetry", version: "1.0.0" }],
  register(context) {
    context.provider({ provide: "metrics", useValue: createMetrics() });
    context.provideCapability("telemetry", { record: () => {} });
  },
});
```

Um plugin consumidor declara o que exige:

```ts
const audit = defineDeclarativePlugin({
  name: "acme/audit",
  version: "1.0.0",
  requires: [{ name: "telemetry", version: "^1.0.0" }],
  optional: ["tracing"],
  register(context) {
    context.provider({ provide: AuditService, useClass: AuditService });
  },
});
```

Instale as mesmas instâncias no módulo raiz:

```ts
const AppModule = defineModule({
  name: "app",
  plugins: [metrics, audit],
});
```

## Contratos e falhas

- `provides` anuncia capabilities oferecidas;
- `requires` torna uma capability obrigatória;
- `optional` permite integração quando a capability existir;
- `^1.0.0` exige o mesmo major;
- `~1.0.0` exige o mesmo major e minor;
- uma versão exata exige correspondência exata.

Uma capability obrigatória ausente, duplicada ou incompatível impede a
compilação e aponta o plugin responsável. Isso evita que a ordem de imports
decida silenciosamente qual integração será usada.

Plugins também podem registrar providers, autenticação, PostgreSQL, health
checks e hooks de fechamento pelo `DeclarativePluginContext`.

