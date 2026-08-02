---
title: Inspeção e integridade
description: Inspecione o grafo e verifique artifacts gerados antes do deploy.
---

# Inspeção e integridade

## Inspecione a aplicação compilada

Depois de criar a aplicação, `inspect()` mostra módulos, providers, queries,
rotas, diagnósticos e rotas elegíveis para o caminho nativo:

```ts
const app = await createApplication(AppModule);
const inspection = app.inspect();

console.log(inspection.modules);
console.log(inspection.routes);
console.log(inspection.queries);
```

Use a inspeção em testes de arquitetura e CI para detectar uma rota ou query
que desapareceu do grafo sem precisar iniciar um servidor.

## Relatório seguro para CI

```ts
import {
  createDoctorReport,
  diagnoseApplication,
  formatDoctorReport,
} from "empilha";

const report = createDoctorReport(diagnoseApplication(AppModule), true);
console.log(formatDoctorReport(report));
if (!report.ok) process.exitCode = 1;
```

O relatório mascara valores sensíveis encontrados em mensagens e pode tratar
warnings como falhas com `strict: true`.

## Manifest de queries

Queries geradas carregam hash do SQL e origem do arquivo. Gere um manifest no
build e verifique-o no CI ou durante `createApplication`:

```ts
import {
  createGeneratedQueryManifest,
  verifyGeneratedQueryManifest,
} from "empilha";

const manifest = createGeneratedQueryManifest([listTasks, createTask]);
const diagnostics = verifyGeneratedQueryManifest(manifest, process.cwd());
if (diagnostics.some((item) => item.severity === "error")) {
  throw new Error("Queries geradas estão desatualizadas");
}

const app = await createApplication(AppModule, {
  queryManifest: manifest,
  verifyQueryManifest: true,
});
```

Se o arquivo SQL, o header da query ou o hash não corresponder ao artifact, a
verificação falha antes de liberar a aplicação.

