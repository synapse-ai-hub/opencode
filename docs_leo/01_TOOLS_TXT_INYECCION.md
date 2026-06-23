# Tools: Inyección de archivos `.txt`

## Resumen

Cada tool tiene un archivo `.txt` y un archivo `.ts` con el mismo nombre base.
El `.txt` contiene la **descripción en lenguaje natural** que el LLM ve cuando la tool
se le presenta como disponible. El `.ts` contiene la **implementación** (parámetros, lógica de ejecución).

## ¿Dónde están?

```
packages/opencode/src/tool/
├── read.txt          → descripción de la tool "read"
├── read.ts           → implementación de la tool "read"
├── write.txt
├── write.ts
├── grep.txt
├── grep.ts
├── glob.txt
├── glob.ts
├── edit.txt
├── edit.ts
├── task.txt
├── task.ts
├── webfetch.txt
├── webfetch.ts
├── websearch.txt
├── websearch.ts
├── bash.txt (shell.txt)
├── bash.ts (shell.ts)
├── question.txt
├── question.ts
├── skill.txt
├── skill.ts
├── apply_patch.txt
├── apply_patch.ts
├── lsp.txt
├── lsp.ts
├── todowrite.txt
├── todo.ts
├── plan-enter.txt
├── plan-exit.txt
├── plan.ts
└── ...
```

## ¿Cómo se inyectan?

Usando `import` con Bun. Bun soporta importar archivos `.txt` como strings:

```typescript
// En read.ts, línea 7:
import DESCRIPTION from "./read.txt"

// Luego se usa como description de la tool:
return {
  description: DESCRIPTION,   // ← el contenido del .txt
  parameters: Parameters,
  execute: (params, ctx) => ...
}
```

## ¿Cuándo se usa esa descripción?

El flujo es:

1. **Registro**: `registry.ts` → `Tool.init(tool)` lee `info.init()` que devuelve `{ description, parameters, execute }`
2. **Exposición**: `ToolRegistry.tools(model)` filtra las tools y devuelve un array con `{ id, description, parameters, jsonSchema, execute }`
3. **Envío al LLM**: En `session/llm/request.ts`, las tools se convierten al formato `ai.tool()` donde la `description` es el texto del `.txt`
4. **El LLM ve esa descripción** cuando decide qué tool llamar

## ¿Qué tools tienen `.txt`?

Todas las tools built-in tienen su `.txt`. La excepción son:
- `invalid.ts` — no tiene `.txt`, es una tool de relleno
- `schema.ts` — helpers de schema
- `registry.ts` — orquestación, no una tool en sí
- `truncate.ts` / `truncation-dir.ts` — utilidades de truncado
- `external-directory.ts` — validación de directorios externos

## ¿Cómo modificar una descripción de tool?

Simplemente editar el archivo `.txt`. No tocar el `.ts` a menos que se quiera cambiar
la implementación o los parámetros. El cambio en el `.txt` se refleja automáticamente
porque Bun lo importa como string en tiempo de compilación.

## Caso especial: task.txt

El `task.ts` combina el `DESCRIPTION` del `.txt` con `BACKGROUND_DESCRIPTION`
si la flag `experimentalBackgroundSubagents` está activa:

```typescript
description: flags.experimentalBackgroundSubagents
  ? [DESCRIPTION, BACKGROUND_DESCRIPTION].join("\n\n")
  : DESCRIPTION,
```

## Mecanismo interno (tool.ts)

El archivo `tool.ts` define:
- `Tool.define(id, init)` — crea una tool con ID y función de inicialización
- `Tool.init(info)` — ejecuta `info.init()` para obtener `{ description, parameters, execute }`
- `Tool.Def` — tipo que describe una tool completa (id + description + parameters + execute + jsonSchema)
- `Tool.Context` — contexto de ejecución (sessionID, messageID, agent, abort signal, etc.)
- `Tool.ExecuteResult` — resultado de ejecución (title, metadata, output, attachments)
- `InvalidArgumentsError` — error cuando el LLM pasa argumentos inválidos

El wrapping en `Tool.define` también añade:
1. **Decodificación de parámetros** con `Schema.decodeUnknownEffect`
2. **Truncado de output** automático
3. **Manejo de errores** con `Effect.orDie`
