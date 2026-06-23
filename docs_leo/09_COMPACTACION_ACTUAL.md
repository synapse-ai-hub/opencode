# Sistema de Compaction Actual (opencode v1.17.9)

> ⚠️ **Advertencia**: El sistema actual es uno de los puntos más criticados. 
> El resumen que genera el agente `compaction` pierde contexto valioso.

---

## ¿Qué es el compaction?

Cuando una conversación en opencode crece demasiado y se acerca al límite de tokens del modelo, el sistema **compacta** automáticamente: resume la parte más vieja del historial para hacer espacio, manteniendo los últimos turns intactos.

---

## ¿Dónde está el código?

| Archivo | Propósito |
|---------|-----------|
| `packages/opencode/src/session/compaction.ts` | Servicio principal: create, process, select, prune |
| `packages/opencode/src/session/overflow.ts` | Detección de cuándo se alcanza el límite |
| `packages/opencode/src/session/prompt.ts` (líneas 1214-1221) | Trigger automático en el loop principal |
| `packages/opencode/src/session/message-v2.ts` (filterCompacted) | Reordenamiento post-compaction |
| `packages/core/src/session/compaction.ts` | buildPrompt + lógica core del resumen |
| `packages/opencode/src/agent/prompt/compaction.txt` | System prompt del agente `compaction` |
| `packages/opencode/src/agent/agent.ts` (líneas 219-233) | Definición del agente `compaction` |

---

## Flujo completo

### 1. Trigger: ¿Cuándo se dispara?

En `prompt.ts`, dentro del `runLoop()`:

```typescript
// Líneas 1214-1221
if (
  lastFinished &&
  lastFinished.summary !== true &&
  (yield* compaction.isOverflow({ tokens: lastFinished.tokens, model }))
) {
  yield* compaction.create({ sessionID, agent: lastUser.agent, model: lastUser.model, auto: true })
  continue
}
```

### 2. Detección de overflow

En `overflow.ts`:

```typescript
const COMPACTION_BUFFER = 20_000

export function isOverflow(input) {
  if (input.cfg.compaction?.auto === false) return false
  const count = tokens.total || tokens.input + tokens.output + ...
  return count >= usable(input)
}

export function usable(input) {
  const context = input.model.limit.context
  const reserved = cfg.compaction?.reserved ?? Math.min(COMPACTION_BUFFER, maxOutputTokens)
  return input.model.limit.input
    ? Math.max(0, input.model.limit.input - reserved)
    : Math.max(0, context - maxOutputTokens)
}
```

**Traducción**: Cuando `total_tokens_usados >= context_del_modelo - 20_000`, se activa.

Ejemplo con Claude Sonnet (200k contexto):
- Límite: 200k
- Buffer: 20k
- Se dispara cuando se usan ~180k tokens

### 3. Creación del mensaje de compaction

`compaction.create()` (líneas 554-585):
- Crea un nuevo `user message` con una `part` de tipo `"compaction"`
- Este mensaje se encola como "tarea" en el loop

### 4. Procesamiento del compaction

`compaction.process()` (líneas 299-552):

```
a. select() → divide la conversación en:
   ┌────────────────────────────────────────────────────────┐
   │  HEAD (para resumir)           │ TAIL (para mantener)  │
   │  Todo lo que no entra          │ Últimos 2 turns       │
   │  en el budget                  │ (default tail_turns)  │
   └────────────────────────────────────────────────────────┘
   
b. buildPrompt() → construye el prompt de resumen:
   - Si hay resumen previo: "Actualizá este resumen..."
   - Template fijo con secciones: Goal, Constraints, Progress, etc.
   
c. Se llama al agente "compaction" que genera un resumen
   
d. El resumen se guarda como assistant message con summary: true
```

### 5. Reordenamiento post-compaction

`filterCompacted()` en `message-v2.ts` reordena los mensajes para el modelo:

```
Orden original: [A][B][C][D][E]...[Z]
                              ↑ compaction aquí

Después de filterCompacted:
[Resumen][TAIL (Z-2 turns)][Continue...]
```

El modelo ve:
1. El resumen del compaction (de todo lo anterior)
2. Los últimos 2 turns verbatim
3. El mensaje de "continue"

---

## El template del resumen (el problema)

En `packages/core/src/session/compaction.ts`, `SUMMARY_TEMPLATE`:

```markdown
## Goal
- [single-sentence task summary]

## Constraints & Preferences
- [...]

## Progress
### Done
- [...]
### In Progress
- [...]
### Blocked
- [...]

## Key Decisions
- [...]

## Next Steps
- [...]

## Critical Context
- [...]

## Relevant Files
- [...]
```

**Problema**: es un template **fijo y genérico**. No importa si la conversación
era sobre debugging de Python, arquitectura de microservicios, o configuración
de DevOps — siempre forza la misma estructura. El resumen pierde:
- Matices específicos del dominio
- Contexto técnico detallado
- Hilos de conversación secundarios importantes
- Historia de decisiones y por qué se tomaron

---

## Configuración disponible

En `opencode.json` se puede configurar:

```json
{
  "compaction": {
    "auto": false,              // Desactivar auto-compaction
    "prune": false,             // Desactivar pruning de tool outputs
    "reserved": 40000,          // Buffer de tokens antes de compactar (default: 20000)
    "tail_turns": 5,            // Turns a mantener verbatim (default: 2)
    "preserve_recent_tokens": 8000  // Budget para tail (default: min(8000, 25%))
  }
}
```

---

## Prune (limpieza de tool outputs)

Además del compaction, hay un `prune()` (líneas 253-297) que:
- Va hacia atrás desde el final
- Busca tool outputs grandes
- Los marca como `compacted` para liberar tokens
- Solo se activa si `cfg.compaction?.prune !== false`
- No toca las tools protegidas: `["skill"]`
- Mínimo para activarse: 20_000 tokens liberables
