# Skills: Descubrimiento, Carga y Formato

## ¿Dónde está la implementación?

- `packages/opencode/src/skill/index.ts` — servicio principal (~366 líneas)
- `packages/opencode/src/skill/discovery.ts` — descubrimiento y descarga (~109 líneas)

## ¿Qué es una Skill?

Una skill es un archivo `SKILL.md` con frontmatter que proporciona instrucciones
especializadas al LLM. El formato es:

```markdown
---
name: mi-skill
description: Use this when doing X
---

# Instrucciones detalladas
...
```

## ¿Dónde se buscan las skills?

El descubrimiento en `skill/index.ts` busca en estos directorios:

| Origen | Patrón | Descripción |
|--------|--------|-------------|
| Global `~/.claude/skills/**/SKILL.md` | `skills/**/SKILL.md` | Skills de Claude Code |
| Global `~/.agents/skills/**/SKILL.md` | `skills/**/SKILL.md` | Skills de Agentes externos |
| Subida desde `cwd` hasta `worktree` | `skills/**/SKILL.md` | Skills de proyecto (`.claude/` y `.agents/`) |
| Directorios de configuración | `{skill,skills}/**/SKILL.md` | Skills de `opencode.json` -> `directories` |
| Paths adicionales de `opencode.json` | `**/SKILL.md` | `skills.paths` |
| URLs remotas | `**/SKILL.md` | `skills.urls` → se descargan via discovery.ts |

## Skill built-in

Hay una skill built-in llamada `customize-opencode` que se registra SIEMPRE primero
(líneas 32-35, 278-283):

```typescript
const CUSTOMIZE_OPENCODE_SKILL_NAME = "customize-opencode"
const CUSTOMIZE_OPENCODE_SKILL_BODY = SkillPlugin.CustomizeOpencodeContent
// ...
s.skills[CUSTOMIZE_OPENCODE_SKILL_NAME] = {
  name: CUSTOMIZE_OPENCODE_SKILL_NAME,
  description: CUSTOMIZE_OPENCODE_SKILL_DESCRIPTION,
  location: "<built-in>",
  content: CUSTOMIZE_OPENCODE_SKILL_BODY,
}
```

Las skills del disco pueden sobrescribir las built-in si tienen el mismo nombre.

## Estructura de datos

```typescript
const Info = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  location: Schema.String,     // ruta al archivo SKILL.md
  content: Schema.String,      // contenido del markdown (sin frontmatter)
})
```

## ¿Cómo se cargan?

1. **Scan**: `discoverSkills()` busca archivos `SKILL.md` en todos los directorios configurados
2. **Parse**: Cada archivo se parsea con `ConfigMarkdown.parse(match)` que extrae frontmatter + content
3. **Add**: Se valida el frontmatter (debe tener `name`, opcionalmente `description`) y se guarda en `state.skills[name]`
4. **Deduplication**: Si hay duplicados, se logea una advertencia

## ¿Cómo se usan?

En `session/system.ts` → `sys.skills(agent)`:

```typescript
skills: Effect.fn("SystemPrompt.skills")(function* (agent: Agent.Info) {
  if (Permission.disabled(["skill"], agent.permission).has("skill")) return
  const list = yield* skill.available(agent)
  return [
    "Skills provide specialized instructions and workflows for specific tasks.",
    "Use the skill tool to load a skill when a task matches its description.",
    Skill.fmt(list, { verbose: true }),  // formato XML
  ].join("\n")
})
```

El formato verbose genera XML como:

```xml
<available_skills>
  <skill>
    <name>python-pro</name>
    <description>Use when building Python 3.11+ applications...</description>
    <location>file:///path/to/SKILL.md</location>
  </skill>
</available_skills>
```

## Filtrado por permisos

`s.available(agent)` filtra skills según los permisos del agente:

```typescript
return list.filter((skill) =>
  Permission.evaluate("skill", skill.name, agent.permission).action !== "deny"
)
```

## Discovery de URLs remotas

En `discovery.ts`, las skills pueden descargarse desde URLs:

1. Se descarga `{url}/index.json` que lista skills
2. Para cada skill, se descargan los archivos listados
3. Se cachean en `~/.cache/opencode/skills/`
