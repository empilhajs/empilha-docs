---
title: Autenticação
description: Valide bearer tokens, injete identidade e proteja rotas por role.
---

# Autenticação

Vamos permitir que qualquer usuário liste tarefas, mas somente usuários
autenticados criem e alterem dados.

## Configure um verificador

O núcleo do Empilha não impõe formato de token:

```ts
app.auth(async (token) => {
  const user = await verifyToken(token);

  if (!user) return { valid: false };

  return {
    valid: true,
    payload: user,
    roles: user.roles,
  };
});
```

O framework extrai `Authorization: Bearer <token>` e chama essa função quando
uma rota exige autenticação.

## Exija uma identidade

`@Identity()` exige token válido e injeta o payload:

```ts
type UserIdentity = {
  sub: string;
  roles: string[];
};

@Post("/")
create(
  @Identity() user: UserIdentity,
  @Body(CreateTask) input: CreateTaskInput,
) {
  return this.tasks.create(user.sub, input);
}
```

Token ausente ou inválido recebe `401`.

## Exija roles

```ts
@Delete("/:id")
@Roles("admin")
remove(@Param("id", Number) id: number) {
  this.tasks.remove(id);
}
```

Token válido sem a role recebe `403`. Com várias roles, basta possuir uma:

```ts
@Roles("admin", "manager")
```

Um controller inteiro pode exigir autenticação:

```ts
@Controller("/tasks", { auth: true })
```

Ou uma role:

```ts
@Controller("/admin", { auth: "admin" })
```

## Use JWT quando fizer sentido

Instale o plugin oficial:

```sh
bun add @empilha/jwt
```

```ts
import { jwt, type JwtService } from "@empilha/jwt";

const access = jwt<UserIdentity>({
  name: "access",
  secret: process.env.JWT_SECRET!,
  expiresIn: "7d",
  issuer: "tasks-api",
});

const app = new Empilha()
  .use(access.auth())
  .initialize([TaskController]);
```

Emita um token em uma rota de login:

```ts
@Post("/login")
async login(@Inject("access") access: JwtService<UserIdentity>) {
  return {
    token: await access.sign({
      sub: "user-1",
      roles: ["user"],
    }),
  };
}
```

O plugin registra o serviço com o nome configurado e conecta seu verificador
ao `app.auth()`.

## Hierarquia de roles

Sem configuração extra, roles usam correspondência exata. Para herança:

```ts
app.authHierarchy({
  user: 0,
  manager: 1,
  admin: 2,
});
```

Agora `admin` satisfaz uma rota que exige `manager` ou `user`. Uma role fora
do mapa continua exigindo correspondência exata.

## Access e refresh tokens

Crie dois serviços com nomes e segredos diferentes. O helper remove claims
registradas do refresh token antes de emitir um novo access token:

```ts
import { refreshAccessToken } from "@empilha/jwt";

const token = await refreshAccessToken(access, refresh, refreshToken);

if (!token) {
  throw new HttpError(401, "Refresh token inválido");
}
```

## Autorização direta

Para API keys ou webhooks sem roles:

```ts
@Guard((token) => token === process.env.WEBHOOK_TOKEN)
@Post("/webhook")
receive() {}
```

::: warning Configure antes de inicializar
Uma rota com `@Identity` ou `@Roles` sem `app.auth()` faz o bootstrap falhar.
:::
