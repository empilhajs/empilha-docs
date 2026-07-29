---
title: Primeiro endpoint
description: Instale o Empilha e coloque uma rota no ar.
---

# Primeiro endpoint

Vamos começar pelo menor programa Empilha possível. Nesta página você instala
o framework, cria uma rota e vê uma resposta no terminal.

::: info Antes de começar
Você precisa do [Bun](https://bun.sh) 1.3 ou mais recente.
:::

## Crie o projeto

Em uma pasta vazia:

```sh
bun init -y
bun add empilha
```

Ative decorators no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "strict": true,
    "noEmit": true,
    "types": ["bun"]
  }
}
```

## Crie uma rota

Crie `src/app.ts`:

```ts
import { Controller, Empilha, Get } from "empilha";

@Controller("/")
class AppController {
  @Get("/")
  index() {
    return { message: "Minha primeira API Empilha" };
  }
}

const app = new Empilha().initialize([AppController]);

await app.run({ port: 4000 });
```

Inicie:

```sh
bun src/app.ts
```

O terminal mostra:

```text
🚀 API: http://localhost:4000
```

Faça uma requisição em outro terminal:

```sh
curl http://localhost:4000
```

```json
{
  "message": "Minha primeira API Empilha"
}
```

## Leia o código em quatro frases

1. `@Controller("/")` dá um prefixo às rotas da classe.
2. `@Get("/")` transforma `index()` em uma rota GET.
3. `initialize([AppController])` entrega o controller ao framework.
4. `run({ port: 4000 })` abre a porta HTTP.

Importar uma classe não registra nada globalmente. A aplicação conhece somente
os controllers passados a `initialize()`.

::: tip Guarde esta forma

```text
descreva com decorators → initialize() → run()
```

Tudo o que você aprender daqui em diante se encaixa antes, dentro ou depois
dessas três partes.
:::
