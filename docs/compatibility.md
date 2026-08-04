---
title: Compatibilidade
description: Versões suportadas e premissas dos exemplos.
---

# Compatibilidade

Esta documentação acompanha a versão `0.2.2` do Empilha.

## Runtime

| Componente | Requisito |
| --- | --- |
| Bun | `1.3.0` ou superior |
| Sistema de módulos | ESM (`"type": "module"`) |
| TypeScript | `strict: true`, `moduleResolution: "bundler"` |
| Decorators | `experimentalDecorators: true` |

Os exemplos usam APIs Web padrão (`Request`, `Response` e `AbortSignal`) e são
voltados ao runtime Bun. Node.js não é um runtime suportado pelo framework.

## Pacotes opcionais

Integrações são versionadas junto com o core:

```sh
bun add @empilha/jwt@^0.2.2
bun add @empilha/pg@^0.2.2 pg
```

O pacote `@empilha/jwt` requer `jose` 6.x. O pacote `@empilha/pg` requer `pg`
8.x. Use `bun run check` depois de atualizar o Empilha para detectar contratos
ou artefatos incompatíveis.

::: tip
Os exemplos não prometem compatibilidade com APIs de versões anteriores. Ao
migrar uma aplicação, consulte o guia de [atualização](/migration).
:::
