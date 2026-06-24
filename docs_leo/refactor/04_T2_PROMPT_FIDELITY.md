# T2: Prompt Fidelity Gate

## Estado: Pendiente

Requiere agregar Provider/LLM services como dependencia en `task.ts`.

## Diseño propuesto

En `packages/opencode/src/tool/task.ts`, antes de delegar al subagente:

1. Extraer mensaje original del usuario de `ctx.messages`
2. Llamar a un LLM para verificar: "El prompt delegado coincide con lo que pidió el usuario?"
3. Si hay match → proceder normal
4. Si no → usar `Question.Service` para preguntar al usuario, ajustar prompt según respuesta

## Dependencias necesarias
- `Provider.Service` para obtener el modelo
- `LLM.Service` o equivalente para la llamada de verificación
