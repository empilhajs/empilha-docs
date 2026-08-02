---
title: Segurança operacional
description: Limites, cancelamento e políticas recomendadas para produção.
---

# Segurança operacional

O Empilha fornece limites HTTP seguros por padrão, mas políticas de borda como
rate limiting, WAF e proteção distribuída continuam responsabilidade da
infraestrutura da aplicação.

## Limites recomendados

```ts
const AppModule = defineModule({ name: "app", controllers: [TaskController] });
const app = await createApplication(AppModule, {
  configure: (app) => app.configureHttp({
    maxBodyBytes: 1024 * 1024,
    maxHeaderCount: 100,
    bodyTimeout: 10_000,
    handlerTimeout: 30_000,
    maxConcurrentRequests: 500,
  }),
});
```

| Opção | Proteção | Resposta quando excede |
| --- | --- | --- |
| `maxBodyBytes` | materialização de body muito grande | `413` |
| `maxHeaderCount` | quantidade excessiva de campos de header | `431` |
| `bodyTimeout` | cliente lento durante o upload | `408` |
| `handlerTimeout` | handler ou middleware que não termina | `504` |
| `maxConcurrentRequests` | saturação do processo | `503` |

Mantenha os limites finitos em produção. `null` desativa os limites que aceitam
essa opção e só deve ser usado quando a camada anterior já aplica uma política
equivalente.

## Cancelamento cooperativo

`RequestContext.signal` é abortado quando o cliente desconecta, o timeout vence
ou o processo entra em shutdown. Handlers, queries e streams precisam observar
esse sinal para interromper trabalho. O framework não pode parar uma Promise
arbitrária que ignora o `AbortSignal`.

## CORS e autenticação

Use uma origem CORS explícita e não combine `credentials: true` com `origin: "*"`.
Para autenticação bearer, prefira o plugin JWT oficial ou um verificador que
valide assinatura, expiração, issuer, audience e finalidade do token.

## Rate limiting

Rate limiting não faz parte do core porque produção normalmente precisa de um
contador distribuído. Adicione-o no middleware, no reverse proxy ou em um plugin
com armazenamento compartilhado. O limite de concorrência do Empilha protege o
processo, mas não substitui rate limiting por cliente.
