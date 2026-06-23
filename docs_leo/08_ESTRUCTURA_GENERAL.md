# Estructura General del Repositorio

## Root

```
D:\opencode/
├── packages/              ← Todos los packages del monorepo
│   ├── opencode/          ← El core: CLI, TUI, tools, agents, session
│   ├── core/              ← Base de datos, schemas, utilidades compartidas
│   ├── app/               ← Web UI embebida
│   ├── cli/               ← CLI (posiblemente obsoleto, funciones en opencode)
│   ├── console/           ← Consola de administración
│   ├── desktop/           ← App de escritorio
│   ├── docs/              ← Documentación
│   ├── llm/               ← Cliente LLM nativo
│   ├── plugin/            ← Sistema de plugins
│   ├── sdk/               ← SDK para desarrolladores
│   ├── server/            ← Servidor HTTP
│   ├── tui/               ← Terminal UI components
│   ├── ui/                ← UI components compartidos
│   ├── web/               ← Web app
│   └── ...                ← otros packages
├── specs/                 ← Especificaciones técnicas
├── script/                ← Scripts de build/CI
├── infra/                 ← Infraestructura
├── github/                ← GitHub Actions workflows
└── ...
```

## Packages clave para modificar comportamiento

### Tools (lo que el LLM puede llamar)

```
packages/opencode/src/tool/
├── *.txt              ← DESCRIPCIONES (lo que ve el LLM)
├── *.ts               ← IMPLEMENTACIONES (lógica)
├── registry.ts        ← Registro de todas las tools
├── tool.ts            ← Tipos base (Def, Context, ExecuteResult)
├── schema.ts          ← Schemas compartidos
└── json-schema.ts     ← Conversión a JSON Schema
```

### System Prompts (personalidad del modelo)

```
packages/opencode/src/session/prompt/
├── default.txt        ← Fallback
├── anthropic.txt      ← Para Claude
├── beast.txt          ← Para GPT-4, o1, o3
├── gpt.txt            ← Para otros GPT
├── gemini.txt         ← Para Gemini
├── kimi.txt           ← Para Kimi
├── trinity.txt        ← Para Trinity
├── codex.txt          ← Para Codex
├── plan-mode.txt      ← Modo plan
├── plan.txt
└── build-switch.txt
```

### Agentes

```
packages/opencode/src/agent/
├── agent.ts           ← Definiciones de agentes
├── generate.txt       ← Prompt para generar agentes
├── prompt/            ← Prompts de agentes específicos
│   ├── compaction.txt
│   ├── explore.txt
│   ├── summary.txt
│   └── title.txt
└── subagent-permissions.ts
```

### Skills

```
packages/opencode/src/skill/
├── index.ts           ← Servicio principal
└── discovery.ts       ← Descubrimiento de skills
```

### Session (orquestación)

```
packages/opencode/src/session/
├── prompt.ts          ← Loop principal de prompt/respuesta
├── system.ts          ← System prompts + environment info
├── llm/
│   ├── request.ts     ← Preparación del request al LLM
│   ├── ai-sdk.ts      ← Adaptador AI SDK
│   ├── native-request.ts
│   └── native-runtime.ts
├── processor.ts       ← Procesa respuestas del LLM
├── tools.ts           ← Resolución de tools por sesión
└── ...
```

## Patrón de importación de .txt

Todos los archivos `.txt` se importan con Bun:

```typescript
import DESCRIPTION from "./read.txt"
// Bun runtime: el contenido se asigna como string a DESCRIPTION
// Build: Bun incorpora el .txt en el binario compilado
```

Esto funciona porque Bun trata los imports de `.txt` como imports de texto.
No hay un paso de build intermedio para los `.txt` — Bun lo maneja automáticamente
tanto en desarrollo (`bun run dev`) como en compilación (`bun build --compile`).

## Notas para modificaciones

1. **Para cambiar lo que el LLM sabe de una tool**: editar el `.txt` correspondiente
2. **Para cambiar la personalidad del modelo**: editar `session/prompt/{modelo}.txt`
3. **Para cambiar permisos de agentes**: editar `agent/agent.ts` (built-in) o `opencode.json` (usuario)
4. **Para agregar/quitar tools**: editar `tool/registry.ts`
5. **Para agregar skills**: crear `**/SKILL.md` con frontmatter
6. **Los cambios en .txt se reflejan inmediatamente** en dev (Bun hot reload)
