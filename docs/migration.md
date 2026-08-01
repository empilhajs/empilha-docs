---
title: Migração e compatibilidade
description: Como adotar mudanças do Empilha sem quebrar aplicações existentes.
---

# Migração e compatibilidade

O caminho recomendado é atualizar uma versão por vez, executar `bun run check` e
validar o bootstrap e as respostas HTTP em `app.test()`.

## `@Produces`

O decorator oficial para definir o media type continua sendo `@Produces()`. Não
use `@ContentType`; esse nome não faz parte da API pública.

## `configure()` e `configureHttp()`

`configureHttp()` continua disponível para políticas HTTP. `configure()` agrupa
HTTP, server, health, plugins, logging e validação em uma única configuração.
As duas formas usam o mesmo núcleo:

```ts
new Empilha().configureHttp({ maxHeaderCount: 100 });

new Empilha().configure({
  http: { maxHeaderCount: 100 },
});
```

## Inferência de schemas

`Infer<typeof Schema>` representa o payload do schema. Para carregar parâmetros
explicitamente, use `Infer<typeof Schema, [id: string]>`.

## Checklist de atualização

- execute `bun run check`;
- confira limites de body, headers, timeout e concorrência;
- confirme que CORS usa origem explícita em produção;
- rode `bun run benchmark:build` após mudanças de imports ou entrypoints;
- verifique o documento OpenAPI e os testes de bootstrap.
