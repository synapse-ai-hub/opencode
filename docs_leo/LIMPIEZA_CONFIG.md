# Limpieza de Configuración Global

Ubicación: `C:\Users\Leonardo\.config\opencode\`

---

## `opencode.json`

### Qué SACAR

```json
"agent": {
    "ask": { ... },          // → ya está en el binario
    "build": { "disable": true },  // → build no existe más
    "plan": { "disable": true }    // → plan no existe más
}
```

### Qué AGREGAR

```json
"compaction": {
    "trigger_threshold": 0.85,
    "strategy": "truncate",
    "options": ["cod", "truncate", "original"],
    "truncate_percent": 0.3
}
```

### Qué DEJAR igual

| Sección | Motivo |
|---------|--------|
| `experimental.hooks` | SessionStart y PostToolUse siguien funcionando |
| `experimental.mcp_timeout` | Sigue siendo necesario |
| `mcp` | notebooklm, trello, neon — siguen activos |
| `tools` | notebooklm tools desactivadas — está bien |
| `default_agent: "ask"` | Ahora ask es built-in, el default sigue funcionando |

---

## `agents/` (21 archivos)

**BORRAR TODO.** Todos los agentes ahora están compilados en el binario. La carpeta `agents/` completa puede eliminarse.

---

## `skills/` (87 skills)

| Acción | Skills |
|--------|--------|
| **BORRAR** | `prompt-fidelity/` — ahora se hace por código en `task.ts` |
| **DEJAR** | Las otras 86 skills que uses en tus agentes |

Las skills que tengas permitidas en cada agente (`skill: { "*": "deny", "python-pro": "allow", ... }`) siguen funcionando desde la carpeta `skills/`.

---

## `plugins/` (2 archivos)

| Archivo | Acción |
|---------|--------|
| `opencode-hooks-api.js` | Verificar si aún se necesita |
| `synapse-hooks.js` | Verificar si aún se necesita |

---

## `tools/` (1 archivo)

| Archivo | Acción |
|---------|--------|
| `log_query.js` | Se queda (aunque no se use más) |

---

## Resumen de limpieza

```
BORRAR:
  agents/          → 21 archivos .md (ya están en el binario)
  skills/prompt-fidelity/  → se hace por código ahora
  AGENTS.md        → compilado en session/prompt/rules.txt

AGREGAR en opencode.json:
  compaction: { trigger_threshold, strategy, truncate_percent }

SACAR del opencode.json:
  agent.ask, agent.build, agent.plan

DEJAR:
  skills/ (todo menos prompt-fidelity)
  plugins/
  tools/log_query.js
  mcp (notebooklm, trello, neon)
  experimental.hooks
  default_agent: "ask"
```
