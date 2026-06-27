<p align="center">
  <img src="https://github.com/synapse-ai-hub/sources/raw/main/logo.png" alt="Logo" width="150">
</p>
<h3 align="center">Plan de Corrección — Bugs de truncate (compaction strategy)</h3>

---

## Bugs a corregir

### Bug 1 — CRÍTICO: `filterCompacted()` nunca excluye el compaction message del resultado

**Archivo**: `packages/opencode/src/session/message-v2.ts` — función `filterCompacted()` (líneas 535-598)

**Problema**: `stream()` retorna mensajes newest-first. `filterCompacted()` pushea el compaction message (`c1`, el más nuevo) a `result`, setea `retain` con `tail_start_id`, y rompe al encontrar el mensaje target. Pero `c1` ya está en `result`. El `reverse()` + `slice(tailIndex)` nunca lo excluye porque `c1` queda al final del array.

**Efecto**: `latest()` encuentra el `CompactionPart` de `c1` como tarea en cada iteración → loop infinito.

---

### Bug 2 — CRÍTICO: `truncate()` guardia `firstKept.role !== "user"` aborta sin feedback

**Archivo**: `packages/opencode/src/session/compaction.ts` — línea 332

**Problema**: Después del fix (se eliminó el filtro de role del loop), `cutIndex` puede apuntar a un mensaje `assistant` o `tool`. La guardia `if (!firstKept || firstKept.info.role !== "user")` corta y retorna `{ tail_start_id: undefined }`. El compaction part nunca se actualiza, `filterCompacted` nunca filtra (requiere `tail_start_id !== undefined`), y el loop es infinito.

---

### Bug 3 — CRÍTICO: `processCompaction()` usa `parentID` incorrecto

**Archivo**: `packages/opencode/src/session/prompt.ts` — línea 1206 + `compaction.ts` — línea 360

**Problema**: `parentID: lastUser.id` usa el último user message del array filtrado, no el compaction message. Si hay un user message posterior al compaction message, `compactionPart` en `processCompaction()` queda `undefined` (línea 360), y `tail_start_id` nunca se persiste (línea 397). El compaction task se procesa sin mutar estado → loop infinito.

---

### Bug 4 — ALTO: Modelo fake sin `model.api` en `estimate()`

**Archivo**: `packages/opencode/src/session/compaction.ts` — líneas 311, 320

**Problema**: `estimate()` pasa `{ limit: { context: 999_999_999 } } as any` como modelo. `toModelMessagesEffect()` accede a `model.api.npm` (message-v2.ts línea 162) y `model.api.id` (línea 169). Si hay tool parts con media attachments, `model.api` es `undefined` → `TypeError: Cannot read properties of undefined (reading 'npm')`.

---

### Bug 5 — ALTO: `processCompaction()` usa `input.messages` en lugar de `messages`

**Archivo**: `packages/opencode/src/session/compaction.ts` — línea 392

**Problema**: El resto de `processCompaction()` usa la variable local `messages` (que puede ser modificada por overflow, línea 375). El truncate path usa `input.messages`, ignorando la modificación por overflow.

---

### Bug 6 — MEDIO: `cutIndex` off-by-one

**Archivo**: `packages/opencode/src/session/compaction.ts` — líneas 322-329

**Problema**: Si `targetTokens` se alcanza en el último mensaje, `cutIndex = i + 1 = input.messages.length`, lo que activa el guard `cutIndex >= input.messages.length` y retorna sin truncar, perdiendo la oportunidad de mantener el último mensaje.

---

## Orden de corrección

1. Bug 1 — `filterCompacted()` (message-v2.ts)
2. Bug 3 — `parentID` incorrecto (prompt.ts + compaction.ts)
3. Bug 2 — guardia `firstKept.role !== "user"` (compaction.ts)
4. Bug 4 — modelo fake sin `model.api` (compaction.ts)
5. Bug 5 — `input.messages` vs `messages` (compaction.ts)
6. Bug 6 — `cutIndex` off-by-one (compaction.ts)

---

