---
title: Atualização de aplicações
description: Como atualizar uma aplicação para a arquitetura modular atual.
---

# Atualização de aplicações

O Empilha usa módulos como única fronteira de composição. Execute `bun run check`
e valide o bootstrap e as respostas HTTP em `app.test()`.

## `@Produces`

O decorator oficial para definir o media type continua sendo `@Produces()`. Não
use `@ContentType`; esse nome não faz parte da API pública.

## Configuração da aplicação

`configureHttp()` continua disponível para políticas HTTP. A configuração é
aplicada no callback de `createApplication`, enquanto o módulo declara a
composição da aplicação:

```ts
const AppModule = defineModule({
  name: "app",
  controllers: [TaskController],
});
const app = await createApplication(AppModule, {
  configure: (app) => app.configureHttp({ maxHeaderCount: 100 }),
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
