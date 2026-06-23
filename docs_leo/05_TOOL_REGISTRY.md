# Tool Registry: Cómo se registran y exponen las tools

## ¿Dónde está?

`packages/opencode/src/tool/registry.ts` — ~440 líneas.

## Arquitectura

El `ToolRegistry` es un servicio Effect que gestiona:
1. **Tools built-in**: las que vienen con opencode
2. **Tools custom**: las que vienen de plugins o de archivos `{tool,tools}/*.{js,ts}` del proyecto

## Inicialización de tools

En `registry.ts`, el state se construye con `InstanceState.make` (líneas 110-241):

```typescript
const state = yield* InstanceState.make<State>(
  Effect.fn("ToolRegistry.state")(function* (ctx) {
    // 1. Tools custom desde archivos del proyecto
    const matches = dirs.flatMap((dir) =>
      Glob.scanSync("{tool,tools}/*.{js,ts}", { cwd: dir, absolute: true, ... })
    )
    for (const match of matches) {
      const mod = yield* Effect.promise(() => import(pathToFileURL(match).href))
      for (const [id, def] of Object.entries(mod)) {
        if (!isPluginTool(def)) continue
        custom.push(fromPlugin(id === "default" ? namespace : `${namespace}_${id}`, def))
      }
    }

    // 2. Tools custom desde plugins
    for (const p of plugins) {
      for (const [id, def] of Object.entries(p.tool ?? {})) {
        custom.push(fromPlugin(id, def))
      }
    }

    // 3. Tools built-in inicializadas con Tool.init()
    const tool = yield* Effect.all({
      invalid: Tool.init(invalid),
      shell: Tool.init(shell),
      read: Tool.init(read),
      glob: Tool.init(globtool),
      grep: Tool.init(greptool),
      edit: Tool.init(edit),
      write: Tool.init(writetool),
      task: Tool.init(task),
      fetch: Tool.init(webfetch),
      todo: Tool.init(todo),
      search: Tool.init(websearch),
      skill: Tool.init(skilltool),
      patch: Tool.init(patchtool),
      question: Tool.init(question),
      lsp: Tool.init(lsptool),
      plan: Tool.init(plan),
    })

    return {
      custom,
      builtin: [
        tool.invalid,
        ...(questionEnabled ? [tool.question] : []),
        tool.shell, tool.read, tool.glob, tool.grep,
        tool.edit, tool.write, tool.task, tool.fetch,
        tool.todo, tool.search, tool.skill, tool.patch,
        ...(flags.experimentalLspTool ? [tool.lsp] : []),
        ...(flags.experimentalPlanMode && flags.client === "cli" ? [tool.plan] : []),
      ],
      task: tool.task,
      read: tool.read,
    }
  }),
)
```

## Filtrado por modelo (`tools()` method)

El método `tools(input)` filtra qué tools están disponibles según:
- **Provider ID**: `websearch` solo si el provider es opencode o tiene flags exa/parallel
- **Model ID**: `apply_patch` solo para GPTs (no GPT-4, no oss); `edit`/`write` se excluyen si se usa patch
- **Permissions**: todas pasan por `plugin.trigger("tool.definition", ...)`

## Tools condicionales

| Tool | Condición para activarse |
|------|--------------------------|
| `question` | Solo en app/cli/desktop, o con `enableQuestionTool` |
| `lsp` | Solo con `experimentalLspTool` |
| `plan` | Solo con `experimentalPlanMode` y `client === "cli"` |
| `websearch` | Solo con provider opencode, o flags exa/parallel |
| `apply_patch` | Solo para GPT (no GPT-4, no oss) |

## Dynamic description (task tool)

La descripción de `task` se enriquece dinámicamente con la lista de agentes disponibles:

```typescript
const describeTask = Effect.fn("ToolRegistry.describeTask")(function* (agent: Agent.Info) {
  const items = (yield* agents.list()).filter((item) => item.mode !== "primary")
  const filtered = items.filter(
    (item) => Permission.evaluate("task", item.name, agent.permission).action !== "deny",
  )
  return ["Available agent types and the tools they have access to:", description].join("\n")
})
```

## Tool Context

Cuando se ejecuta una tool, recibe un contexto (`Tool.Context`) con:

```typescript
type Context = {
  sessionID: SessionID
  messageID: MessageID
  agent: string
  abort: AbortSignal
  callID?: string
  extra?: { [key: string]: unknown }
  messages: SessionV1.WithParts[]
  metadata(input: { title?: string; metadata?: M }): Effect.Effect<void>
  ask(input: PermissionV1.Request): Effect.Effect<void>
}
```

## Plugin tools

Las tools de plugins se envuelven con `fromPlugin()` que:
1. Normaliza los args (Zod → JSON Schema)
2. Crea un bridge Effect para `ask()`
3. Ejecuta el plugin y trunca el output
4. Pasa el contexto del plugin (directory, worktree, etc.)

## JSON Schema

Las tools exponen su schema en dos formatos:
- `parameters`: Schema de Effect (para validación interna)
- `jsonSchema`: JSON Schema (para enviar al LLM via AI SDK)

La generación de JSON Schema soporta Zod (para plugins legacy) y anotaciones de Schema.
