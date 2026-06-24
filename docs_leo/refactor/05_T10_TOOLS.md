# T10: Revisión de Tools

## Estructura actual

`packages/opencode/src/tool/` contiene:

### Tools activas (16)
read, write, edit, grep, glob, task, webfetch, websearch,
shell, question, skill, apply_patch, lsp, todowrite, plan, invalid

Cada una tiene: `{nombre}.ts` (implementación) + `{nombre}.txt` (descripción LLM)
Las descripciones `.txt` se importan como strings via Bun.

### Archivos de soporte
- `registry.ts` - registro e inicialización de todas las tools
- `tool.ts` - tipos base (Def, Context, ExecuteResult)
- `schema.ts` - schemas compartidos
- `json-schema.ts` - conversión a JSON Schema
- `truncate.ts` - truncado de outputs grandes
- `external-directory.ts` - validación de directorios externos
- `invalid.ts` - tool de relleno para errores

### Observaciones
- `plan.ts` + `plan-enter.txt` + `plan-exit.txt` están relacionados al Plan Mode
  que ya no existe. Probablemente muertos.
- `mcp-websearch.ts` es experimental.
- El patrón de importación de `.txt` es consistente en todas las tools.

## Pendiente
- Discutir si se quieren eliminar/modificar plan-related tools.
