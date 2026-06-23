# Flujo Completo: Desde el usuario hasta el LLM

Este documento traza el camino desde que el usuario escribe un mensaje
hasta que opencode envía el request al LLM.

```
Usuario escribe mensaje
        │
        ▼
┌─────────────────────────────────────┐
│  session/prompt.ts                  │
│  → createUserMessage(input)        │
│    - Resuelve parts (archivos,      │
│      agents, MCP resources, etc.)   │
│    - Crea SessionV1.User en DB      │
│    - Publica eventos                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  session/prompt.ts                  │
│  → loop(sessionID)                  │
│    → runLoop(sessionID)            │
│                                     │
│  Por cada step:                     │
│  1. Obtiene mensajes de la DB       │
│  2. Verifica finish condition       │
│  3. Maneja subtasks/compaction      │
│  4. Prepara LLM call:               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Resolución de Tools                │
│  → SessionTools.resolve(...)       │
│    - Filtra tools por permisos      │
│    - Obtiene definiciones del       │
│      ToolRegistry                   │
│    - Convierte a formato AI SDK     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Ensamblado del System Prompt       │
│                                     │
│  1. sys.environment(model)          │
│     → model info, cwd, git, etc.    │
│                                     │
│  2. instruction.system()            │
│     → instrucciones de config       │
│                                     │
│  3. sys.skills(agent)               │
│     → lista de skills en XML        │
│                                     │
│  Result: system = [...env,          │
│             ...instructions,        │
│             ...skills]              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  session/llm/request.ts             │
│  → prepare(input)                   │
│                                     │
│  System prompt final:               │
│  [agent.prompt ? agent.prompt       │
│   : SystemPrompt.provider(model)]   │
│  + [system]  (env + instr + skills) │
│  + [user.system]                    │
│                                     │
│  Tools: convertidas a ai.tool()     │
│  Messages: convertidas a ModelMessage│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  LLM.Service (llm.ts)               │
│  → Decide runtime:                  │
│    - Nativo (si experimental)       │
│    - AI SDK (default)               │
│                                     │
│  → streamText() o LLMClient        │
│    con system, messages, tools      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Procesamiento de respuesta         │
│  → session/processor (handle)      │
│  → tool calls → ejecución          │
│  → loop continúa hasta finish       │
└─────────────────────────────────────┘
```

## Resumen de archivos .txt involucrados

| Tipo | Archivo | Propósito |
|------|---------|-----------|
| Tool descriptions | `src/tool/*.txt` | Descripción de cada tool para el LLM |
| System prompts | `src/session/prompt/*.txt` | Personalidad/base del modelo |
| Agent prompts | `src/agent/*.txt` | Prompts específicos de subagentes |
| Agent sub-prompts | `src/agent/prompt/*.txt` | Prompts de agentes auxiliares |
| Skills | `**/SKILL.md` | Instrucciones dinámicas para el LLM |

## Timeline de inyección

1. **Compile time** (Bun): Los `.txt` se importan como strings via `import X from "./x.txt"`
2. **Init time** (ToolRegistry): `Tool.init()` ejecuta `info.init()` que devuelve `{ description: DESCRIPTION, ... }`
3. **Request time** (SessionPrompt): Se ensambla el system prompt completo
4. **Request time** (LLMRequest): Se combina agent prompt + system prompt + tools
5. **Runtime**: El LLM ve las descripciones y el system prompt, y responde con tool calls o texto
