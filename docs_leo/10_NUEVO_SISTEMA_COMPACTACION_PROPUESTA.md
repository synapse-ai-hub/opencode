# Propuesta: Nuevo Sistema de Compaction

> Basado en el análisis del código actual de opencode y la experiencia 
> del sistema de token limit en ProspectingAgent.

---

## Resumen del cambio

Actualmente, cuando la conversación llega al límite de tokens, opencode **automáticamente** 
resume TODO el historial viejo con un template fijo, perdiendo contexto.

**La propuesta**: llegar al límite → **preguntar al usuario** qué hacer, con dos opciones:

| Opción | Qué hace | Beneficio |
|--------|----------|-----------|
| **1. Compactar (CoD)** | Resumen iterativo con Chain of Density | Mucho mejor que el template actual |
| **2. Truncar inicio** | Borra el 30% más viejo de la conversación | No pierde nada del final, progresivo |

---

## Opción 1: Compactar con Chain of Density (CoD)

### Inspiración

El sistema actual en ProspectingAgent (`D:/ProspectingAgent`):

```python
# backend/routes/streaming_helpers_v2.py
TOKEN_LIMIT = 100_000

async def _summarize_conversation_cod(original_document, num_rounds=4):
    for i in range(1, num_rounds + 1):
        prompt = prompt_base.format(
            conversation=conversation_chunk,
            resumen_previo=resumen_previo or '(ninguno)',
            n_iter=i
        )
        result = await agent.retry(f'CoD summary {i}', model=..., prompt=prompt, ...)
        # Cada ronda produce un DenserSummary más denso
```

### Prompts CoD (de ProspectingAgent)

**Ronda iterativa** (`p_cod_summary.md`):
```
## Tarea
Resumí la conversación en un texto más denso (50–80 palabras). 
En cada ronda: agregá 2–4 puntos que falten en el resumen actual 
y reescribí el resumen incorporándolos.

## Formato de salida (JSON)
{ Round, KeyPoints, DenserSummary }

## Datos
Conversación: {conversation}
Resumen previo: {resumen_previo}  (vacío en ronda 1)
Iteración: {n_iter}
```

**Ronda final** (`p_cod_summary_final.md`):
```
## Tarea
Generá el resumen final de la conversación integrando todas las rondas.
Una sola respuesta densa (80–120 palabras) con lo esencial para retomar el contexto.

## Datos
Resúmenes de todas las rondas: {resumen_vector}
```

### Implementación en opencode

Reemplazaría el `buildPrompt()` actual en `packages/core/src/session/compaction.ts`:

```typescript
// Actual (pierde contexto):
const SUMMARY_TEMPLATE = `Output exactly the Markdown structure...
## Goal
## Constraints
## Progress
...

// Nuevo (CoD):
// 1. Llamar al LLM con prompt CoD iterativo (4 rondas)
// 2. Cada ronda produce DenserSummary
// 3. Ronda final consolida todo
```

Y el prompt del agente `compaction` (`agent/prompt/compaction.txt`) se reemplazaría
con algo similar a `p_cod_summary.md`.

---

## Opción 2: Truncar inicio (sliding window) — NUEVO

### El concepto

En vez de resumir, **simplemente borrar el principio** progresivamente:

```
Primera vez que se llena:
┌────────────────────────────────────────────────────┐
│ [AAAA][BBBBB][CCCCC][DDDDD][EEEEE] ← 100% lleno   │
│  ─── 30% ───                                      │
│ Resultado:        [CCCCC][DDDDD][EEEEE] ← 70% libre│
└────────────────────────────────────────────────────┘

Segunda vez que se llena:
┌────────────────────────────────────────────────────┐
│ [CCCCC][DDDDD][EEEEE][FFFFF][GGGGG] ← 100% lleno  │
│  ─── 30% ───                                       │
│ Resultado:              [EEEEE][FFFFF][GGGGG] ← 70%│
└────────────────────────────────────────────────────┘
```

**Ventajas**:
- El final **siempre está intacto** (no se resume, no se pierde)
- Es progresivo: cada vez corta otro 30% del inicio
- No necesita llamar al LLM para resumir (instantáneo)
- El usuario puede seguir exactamente donde estaba

### Implementación

#### Archivos a modificar:

| Archivo | Cambio |
|---------|--------|
| `packages/opencode/src/session/compaction.ts` | Nueva función `truncate()` |
| `packages/opencode/src/session/message-v2.ts` | Modificar `filterCompacted()` para soportar truncate |
| `packages/opencode/src/session/prompt.ts` | Modificar el loop para preguntar al usuario antes de compactar |
| `packages/opencode/src/session/overflow.ts` | Ajustar constantes |

#### Lógica de truncate():

```typescript
function truncate(messages: WithParts[], percentaje: number = 0.3) {
  // 1. Calcular 30% de los mensajes (o tokens)
  const totalTokens = estimateTokens(messages)
  const targetTokens = totalTokens * percentaje
  
  // 2. Encontrar el punto de corte
  let accumulated = 0
  let cutIndex = 0
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].info.role !== "user") continue
    const tokens = estimateTokens(messages[i])
    accumulated += tokens
    if (accumulated >= targetTokens) {
      cutIndex = i
      break
    }
  }
  
  // 3. El tail_start_id apunta al primer mensaje después del corte
  const tail_start_id = messages[cutIndex + 1]?.info.id ?? messages[0].info.id
  
  // 4. filterCompacted() usa tail_start_id para ignorar lo anterior
  return { tail_start_id, freed_tokens: accumulated }
}
```

Esto es muy similar al `select()` que ya existe en `compaction.ts`, pero en vez de
"cuánto puedo mantener del final" es "cuánto puedo cortar del principio".

#### Integración con filterCompacted():

El `filterCompacted()` ya soporta `tail_start_id`. Cuando existe, los mensajes
anteriores a `tail_start_id` se descartan. El truncate solo necesita:
1. Calcular `tail_start_id` al 30%
2. Marcar el mensaje de compaction con ese `tail_start_id`
3. `filterCompacted()` hace el resto automáticamente

---

## Flujo completo propuesto

```
1. Se llega al límite de tokens (overflow)
        │
        ▼
2. SE PREGUNTA AL USUARIO:
   "La conversación está llegando al límite de contexto.
    ¿Qué querés hacer?
    
    [1] Compactar → Resumir con CoD (mejor, pero tarda)  
    [2] Truncar   → Borrar el 30% más viejo (rápido, sin pérdida del final)"
        │
        ├── [1] Compactar → CoD (4 rondas) → como resumen actual pero mejor
        │
        └── [2] Truncar → Calcular 30% inicial → marcarlo como descartado
                          → filterCompacted() lo ignora → 70% libre
```

---

## Configuración propuesta

En `opencode.json`:

```json
{
  "compaction": {
    "auto": false,              // 👈 CAMBIO: default false, ahora pregunta
    "strategy": "ask",          // "ask" | "compact" | "truncate"
    "truncate_percent": 0.3,    // Qué porcentaje cortar del inicio
    "reserved": 40000,          // Buffer ANTES de preguntar (default: 40000)
    "tail_turns": 3,            // Turns a mantener en compact mode
    "preserve_recent_tokens": 12000,
    "cod_rounds": 4,            // Iteraciones de CoD
    "prune": true               // Seguir prunteando tool outputs
  }
}
```

---

## Archivos a crear/modificar (resumen)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `packages/opencode/src/session/overflow.ts` | Modificar | Subir COMPACTION_BUFFER a 40000 |
| `packages/opencode/src/session/compaction.ts` | Modificar | Agregar `truncate()`, modificar `process()` |
| `packages/opencode/src/session/prompt.ts` | Modificar | Loop: en vez de auto-create, preguntar |
| `packages/opencode/src/session/message-v2.ts` | Modificar/Verificar | filterCompacted() ya soporta tail_start_id |
| `packages/core/src/session/compaction.ts` | Modificar | Reemplazar buildPrompt() con CoD |
| `packages/opencode/src/agent/prompt/compaction.txt` | Modificar | Reemplazar con prompt CoD (como p_cod_summary.md) |
| `packages/opencode/src/session/tools.ts` | Verificar | Si se usa Question tool para preguntar |
