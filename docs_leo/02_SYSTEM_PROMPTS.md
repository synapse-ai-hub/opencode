# System Prompts: Cómo se ensambla el prompt del sistema

## Archivos de system prompts

Están en `packages/opencode/src/session/prompt/`:

| Archivo | Para qué modelo |
|---------|----------------|
| `default.txt` | Modelo por defecto / fallback |
| `anthropic.txt` | Claude (claude-*) |
| `beast.txt` | GPT-4, o1, o3 |
| `gpt.txt` | Otros GPT (gpt-*) |
| `codex.txt` | Codex (gpt-*-codex) |
| `gemini.txt` | Gemini (gemini-*) |
| `kimi.txt` | Kimi |
| `trinity.txt` | Trinity |
| `plan-mode.txt` | Modo plan |
| `plan.txt` | Planificación |
| `plan-reminder-anthropic.txt` | Recordatorio para plan mode en Anthropic |
| `build-switch.txt` | Switch entre build/plan |

## ¿Cómo se selecciona?

En `session/system.ts`, la función `provider(model)` determina qué prompt usar:

```typescript
export function provider(model: Provider.Model) {
  if (model.api.id.includes("gpt-4") || model.api.id.includes("o1") || model.api.id.includes("o3"))
    return [PROMPT_BEAST]
  if (model.api.id.includes("gpt")) {
    if (model.api.id.includes("codex")) return [PROMPT_CODEX]
    return [PROMPT_GPT]
  }
  if (model.api.id.includes("gemini-")) return [PROMPT_GEMINI]
  if (model.api.id.includes("claude")) return [PROMPT_ANTHROPIC]
  if (model.api.id.toLowerCase().includes("trinity")) return [PROMPT_TRINITY]
  if (model.api.id.toLowerCase().includes("kimi")) return [PROMPT_KIMI]
  return [PROMPT_DEFAULT]
}
```

## ¿Cómo se ensambla el system prompt final?

En `session/llm/request.ts`, línea 58-66:

```typescript
const system = [
  [
    // Si el agente tiene un prompt personalizado, se usa ESE.
    // Si no, se usa el del modelo (SystemPrompt.provider(model)).
    ...(input.agent.prompt ? [input.agent.prompt] : SystemPrompt.provider(input.model)),
    ...input.system,     // ← esto viene de prompt.ts: env + instructions + skills
    ...(input.user.system ? [input.user.system] : []),  // ← system prompt del usuario
  ]
    .filter((x) => x)
    .join("\n"),
]
```

Donde `input.system` se construye en `session/prompt.ts` (líneas 1309-1315):

```typescript
const [skills, env, instructions, modelMsgs] = yield* Effect.all([
  sys.skills(agent),        // Lista de skills disponibles (formato XML)
  sys.environment(model),   // Info del entorno (modelo, directorio, git, etc.)
  instruction.system(),     // Instrucciones del usuario desde opencode.json
  MessageV2.toModelMessagesEffect(msgs, model),
])
const system = [...env, ...instructions, ...(skills ? [skills] : [])]
```

## Estructura final del system prompt

```
[AGENT PROMPT o MODEL PROMPT]  ← del .txt (anthropic, default, gpt, etc.)
[ENVIRONMENT INFO]              ← modelo, working directory, git, platform, date
[INSTRUCTIONS]                  ← de opencode.json
[SKILLS]                        ← lista de skills disponibles (XML)
[USER SYSTEM PROMPT]            ← si el usuario lo especificó
```

## ¿Dónde se usan los prompts de agente?

Cada agente built-in puede tener su propio `prompt` que sobrescribe el del modelo:

| Agente | Prompt file |
|--------|-------------|
| `explore` | `agent/prompt/explore.txt` |
| `compaction` | `agent/prompt/compaction.txt` |
| `title` | `agent/prompt/title.txt` |
| `summary` | `agent/prompt/summary.txt` |
| `generate` (generación de agentes) | `agent/generate.txt` |

Si el agente tiene `agent.prompt`, se usa ESE en lugar de `SystemPrompt.provider(model)`.
Si no, se usa el prompt del modelo (anthropic.txt, etc.).
