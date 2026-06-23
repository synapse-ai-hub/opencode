# Agentes: Arquitectura y Configuración

## ¿Dónde está la implementación?

`packages/opencode/src/agent/agent.ts` — ~461 líneas.

## Tipos de agente

Hay dos modos:

| Modo | Descripción |
|------|-------------|
| `primary` | Agente principal visible al usuario (build, plan) |
| `subagent` | Agente que solo puede ser invocado via Task tool (general, explore) |
| `all` | Ambos (para agentes definidos por el usuario) |

## Agentes built-in

Definidos en `agent.ts` (líneas 140-265):

| Nombre | Modo | Propósito |
|--------|------|-----------|
| `build` | primary | Agente por defecto. Tiene todos los permisos. |
| `plan` | primary | Modo plan: deshabilita tools de edición. |
| `general` | subagent | Multi-step tasks, investigación. |
| `explore` | subagent | Exploración rápida de codebase. Tiene su propio prompt. |
| `compaction` | primary (hidden) | Comprime el historial de la sesión. |
| `title` | primary (hidden) | Genera títulos de conversación. |
| `summary` | primary (hidden) | Genera resúmenes de sesión. |

## Prompts de agente

Los prompts de agente están en `agent/prompt/`:

```
packages/opencode/src/agent/
├── agent.ts              ← definición de agentes
├── generate.txt          ← prompt para generar nuevos agentes
├── prompt/
│   ├── compaction.txt    ← prompt para el agente de compactación
│   ├── explore.txt       ← prompt para el agente de exploración
│   ├── summary.txt       ← prompt para el agente de resumen
│   └── title.txt         ← prompt para el agente de títulos
└── subagent-permissions.ts  ← lógica de permisos para subagentes
```

La importación se hace igual que las tools:

```typescript
import PROMPT_EXPLORE from "./prompt/explore.txt"
```

## Permisos

Cada agente tiene un `permission` array que define qué tools puede usar:

```typescript
permission: Permission.merge(
  defaults,  // permisos base (compartidos por todos)
  Permission.fromConfig({
    "*": "deny",           // denegar todo por defecto
    grep: "allow",         // permitir grep
    read: "allow",         // permitir read
    // ...
  }),
  user,  // permisos del usuario desde opencode.json
),
```

Los valores de acción son: `"allow"`, `"deny"`, `"ask"`.

## Agentes definidos por el usuario

En `opencode.json` se pueden definir agentes personalizados:

```json
{
  "agent": {
    "mi-agente": {
      "description": "Mi agente personalizado",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "Eres un experto en...",
      "mode": "subagent",
      "permission": { "read": "allow", "edit": "deny" }
    }
  }
}
```

Estos se mezclan con los built-in en `agent.ts` (líneas 267-294).

## ¿Cómo se obtiene un agente?

```typescript
// Service principal
export class Service extends Context.Service<Service, Interface>()("@opencode/Agent") {}

// Métodos principales:
get(name)        → Effect<Info>
list()           → Effect<Info[]>
defaultInfo()    → Effect<Info>     // primer agente primario visible
defaultAgent()   → Effect<string>   // nombre del agente por defecto
generate(input)  → genera un nuevo agente vía LLM
```

## Modo plan

El agente `plan` tiene permisos restrictivos:
- `edit: deny` en todos lados, excepto `.opencode/plans/*.md`
- `task: deny` (no puede lanzar subagentes)
- `plan_exit: allow` (puede salir del plan mode)
- `question: allow`
