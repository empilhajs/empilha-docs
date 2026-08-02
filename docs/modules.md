---
title: Módulos e fronteiras
description: Componha aplicações sem registry global e controle o que cada módulo expõe.
---

# Módulos e fronteiras

`defineModule()` é a unidade de composição do Empilha. Ele apenas descreve o
grafo; a aplicação só é compilada quando `createApplication()` é chamado.

```ts
import { createApplication, defineModule } from "empilha";

export const BillingModule = defineModule({
  name: "billing",
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
});

export const AppModule = defineModule({
  name: "app",
  imports: [BillingModule],
  controllers: [HealthController],
});

const app = await createApplication(AppModule);
```

## O que cada campo significa

| Campo | Função |
| --- | --- |
| `imports` | incorpora outro módulo ao grafo |
| `controllers` | declara os controllers pertencentes ao módulo |
| `providers` | registra classes, factories ou valores no container do módulo |
| `queries` | associa queries geradas ao módulo |
| `plugins` | instala plugins declarativos durante a compilação |
| `exports` | torna providers ou módulos disponíveis aos módulos consumidores |

Controllers não são descobertos por import de arquivo. O consumidor só usa o
que foi declarado no módulo, e cada aplicação pode compilar um grafo diferente
no mesmo processo.

## Fronteira de providers

Um provider usado somente dentro de um módulo pode permanecer privado:

```ts
const InternalModule = defineModule({
  name: "internal",
  providers: [AuditService],
});
```

Exporte apenas tokens que outro módulo precisa consumir:

```ts
const UsersModule = defineModule({
  name: "users",
  providers: [UserService],
  exports: [UserService],
});
```

Evite exportar controllers. Controllers são borda HTTP do módulo raiz e não
devem virar dependências de outros módulos.

## Grafo acíclico

Imports formam um grafo. Ciclos, controllers duplicados, providers inválidos e
dependências ausentes são diagnosticados antes de o runtime começar.

Para validar o módulo sem abrir servidor:

```ts
import { createDoctorReport, diagnoseApplication } from "empilha";

const diagnostics = diagnoseApplication(AppModule);
const report = createDoctorReport(diagnostics, true);

if (!report.ok) {
  throw new Error("Módulo inválido");
}
```

