// This script generates the CODE for agent.ts from the .txt frontmatter
// Run: node scripts/generate-agents.mjs
// Output: prints the generated agent.ts content to stdout

import fs from "fs"
import path from "path"

const promptDir = "D:/opencode/packages/opencode/src/agent/prompt"
const files = fs.readdirSync(promptDir).filter(f => f.endsWith('.txt'))

const BUILTIN_KEEP = new Set(['compaction.txt', 'compaction-cod.txt', 'title.txt'])

function parseYaml(str) {
  const lines = str.split(/\r?\n/)
  const result = {}
  const stack = []

  for (const line of lines) {
    if (!line.trim()) continue
    const indent = line.search(/[^ ]/)
    const level = indent / 2
    const trimmed = line.trim()

    while (stack.length > level) stack.pop()

    if (trimmed.endsWith(':')) {
      const key = trimmed.slice(0, -1)
      let obj = result
      for (const k of stack) obj = obj[k]
      obj[key] = {}
      stack[level] = key
    } else if (trimmed.includes(': ')) {
      const idx = trimmed.indexOf(': ')
      const k = trimmed.substring(0, idx)
      let v = trimmed.substring(idx + 2)
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      let obj = result
      for (let i = 0; i < level; i++) obj = obj[stack[i]]
      obj[k] = v
    }
  }
  return result
}

function genPermissionCode(perm, indent) {
  const pad = '  '.repeat(indent)
  const lines = []
  
  for (const [key, value] of Object.entries(perm)) {
    if (typeof value === 'string') {
      lines.push(`${pad}${key}: ${JSON.stringify(value)},`)
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${pad}${key}: {`)
      for (const [k, v] of Object.entries(value)) {
        lines.push(`${pad}  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
      }
      lines.push(`${pad}},`)
    }
  }
  return lines.join('\n')
}

// Generate code output
const output = []

output.push('// ═══════════════════════════════════════════════════════')
output.push('// AUTO-GENERATED AGENT DEFINITIONS')
output.push('// Generated from frontmatter in agent/prompt/*.txt')
output.push('// ═══════════════════════════════════════════════════════')
output.push('')

output.push('// ── Imports ──────────────────────────────────────────')
output.push('import { Config } from "@/config/config"')
output.push('import { Auth } from "../auth"')
output.push('import { Provider } from "@/provider/provider"')
output.push('import { Plugin } from "@/plugin"')
output.push('import { Skill } from "../skill"')
output.push('import { Effect, Context, Layer, Schema } from "effect"')
output.push('import { InstanceState } from "@/effect/instance-state"')
output.push('import { Permission } from "@/permission"')
output.push('import { Truncate } from "@/tool/truncate"')
output.push('import { Global } from "@opencode-ai/core/global"')
output.push('import { ProviderTransform } from "@/provider/transform"')
output.push('import { PermissionV1 } from "@opencode-ai/core/v1/permission"')
output.push('import { ProviderV2 } from "@opencode-ai/core/provider"')
output.push('import { ModelV2 } from "@opencode-ai/core/model"')
output.push('import { LocationServiceMap } from "@opencode-ai/core/location-layer"')
output.push('import { Reference } from "@opencode-ai/core/reference"')
output.push('import { Location } from "@opencode-ai/core/location"')
output.push('import { PluginV2 } from "@opencode-ai/core/plugin"')
output.push('import { generateObject, streamObject, type ModelMessage } from "ai"')
output.push('import { Auth as AuthClass } from "../auth"')
output.push('import { ProviderTransform as PT } from "@/provider/transform"')
output.push('import { serviceUse } from "@opencode-ai/core/effect/service-use"')
output.push('import path from "path"')
output.push('import * as OtelTracer from "@effect/opentelemetry/Tracer"')
output.push('import * as Option from "effect/Option"')
output.push('import { AbsolutePath, type DeepMutable } from "@opencode-ai/core/schema"')
output.push('import { mergeDeep, pipe, sortBy, values } from "remeda"')
output.push('')
output.push('// ── Built-in agent prompts that stay ─────────────────')
output.push("import PROMPT_COMPACTION from './prompt/compaction.txt'")
output.push("import PROMPT_COMPACTION_COD from './prompt/compaction-cod.txt'")
output.push("import PROMPT_TITLE from './prompt/title.txt'")
output.push('')

// Import custom agent prompts
for (const file of files.sort()) {
  if (BUILTIN_KEEP.has(file)) continue
  const name = file.replace('.txt', '')
  const constName = `PROMPT_${name.toUpperCase().replace(/-/g, '_')}`
  output.push(`import ${constName} from './prompt/${file}'`)
}

output.push('')

// ── Define Agent.Info schema ──────────────────────────
output.push('// ── Agent Schema ─────────────────────────────────────')
output.push('')
output.push('export const Info = Schema.Struct({')
output.push('  name: Schema.String,')
output.push('  description: Schema.optional(Schema.String),')
output.push('  mode: Schema.Literals(["subagent", "primary", "all"]),')
output.push('  native: Schema.optional(Schema.Boolean),')
output.push('  hidden: Schema.optional(Schema.Boolean),')
output.push('  topP: Schema.optional(Schema.Finite),')
output.push('  temperature: Schema.optional(Schema.Finite),')
output.push('  color: Schema.optional(Schema.String),')
output.push('  permission: PermissionV1.Ruleset,')
output.push('  model: Schema.optional(')
output.push('    Schema.Struct({')
output.push('      modelID: ModelV2.ID,')
output.push('      providerID: ProviderV2.ID,')
output.push('    }),')
output.push('  ),')
output.push('  variant: Schema.optional(Schema.String),')
output.push('  prompt: Schema.optional(Schema.String),')
output.push('  options: Schema.Record(Schema.String, Schema.Unknown),')
output.push('  steps: Schema.optional(Schema.Finite),')
output.push('}).annotate({ identifier: "Agent" })')
output.push('export type Info = DeepMutable<Schema.Schema.Type<typeof Info>>')
output.push('')

// ── Agent interface and service ───────────────────────
output.push('// ── Service Interface ──────────────────────────────────')
output.push('')
output.push('export interface Interface {')
output.push('  readonly get: (agent: string) => Effect.Effect<Info>')
output.push('  readonly list: () => Effect.Effect<Info[]>')
output.push('  readonly defaultInfo: () => Effect.Effect<Info>')
output.push('  readonly defaultAgent: () => Effect.Effect<string>')
output.push('}')
output.push('')
output.push('export class Service extends Context.Service<Service, Interface>()("@opencode/Agent") {}')
output.push('export const use = serviceUse(Service)')
output.push('')

// ── Layer ─────────────────────────────────────────────
output.push('// ── Layer ──────────────────────────────────────────────')
output.push('')
output.push('export const layer = Layer.effect(')
output.push('  Service,')
output.push('  Effect.gen(function* () {')
output.push('    const config = yield* Config.Service')
output.push('    const auth = yield* Auth.Service')
output.push('    const plugin = yield* Plugin.Service')
output.push('    const skill = yield* Skill.Service')
output.push('    const provider = yield* Provider.Service')
output.push('    const locations = yield* LocationServiceMap')
output.push('')
output.push('    const state = yield* InstanceState.make<Record<string, Info>>(')
output.push('      Effect.fn("Agent.state")(function* (ctx) {')
output.push('        const cfg = yield* config.get()')
output.push('')
output.push('        // ── Default permissions ──')
output.push('        const whitelistedDirs = [')
output.push('          Truncate.GLOB,')
output.push('          path.join(Global.Path.tmp, "*"),')
output.push('        ]')
output.push('')
output.push('        const defaults = Permission.fromConfig({')
output.push('          "*": "allow",')
output.push('          doom_loop: "ask",')
output.push('          external_directory: {')
output.push('            "*": "ask",')
output.push('            ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),')
output.push('          },')
output.push('          question: "deny",')
output.push('          plan_enter: "deny",')
output.push('          plan_exit: "deny",')
output.push('          read: {')
output.push('            "*": "allow",')
output.push('            "*.env": "ask",')
output.push('            "*.env.*": "ask",')
output.push('            "*.env.example": "allow",')
output.push('          },')
output.push('        })')
output.push('')
output.push('        const user = Permission.fromConfig(cfg.permission ?? {})')
output.push('')

// ── Generate all agents ───────────────────────────────
output.push('        // ── Agent Definitions ──')
output.push('        const agents: Record<string, Info> = {')

// Built-in agents that stay
output.push('')
output.push('          // ── Built-in ──')
output.push('          compaction: {')
output.push('            name: "compaction",')
output.push('            mode: "primary",')
output.push('            native: true,')
output.push('            hidden: true,')
output.push('            prompt: PROMPT_COMPACTION,')
output.push('            permission: Permission.merge(defaults, Permission.fromConfig({ "*": "deny" }), user),')
output.push('            options: {},')
output.push('          },')
output.push('          title: {')
output.push('            name: "title",')
output.push('            mode: "primary",')
output.push('            options: {},')
output.push('            native: true,')
output.push('            hidden: true,')
output.push('            temperature: 0.5,')
output.push('            permission: Permission.merge(defaults, Permission.fromConfig({ "*": "deny" }), user),')
output.push('            prompt: PROMPT_TITLE,')
output.push('          },')

// Custom agents from frontmatter
for (const file of files.sort()) {
  if (BUILTIN_KEEP.has(file)) continue
  const content = fs.readFileSync(path.join(promptDir, file), 'utf8').replace(/^\uFEFF/, '')
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) continue
  
  const fm = parseYaml(m[1])
  const name = fm.name || file.replace('.txt', '')
  const promptConst = `PROMPT_${name.toUpperCase().replace(/-/g, '_')}`
  
  output.push('')
  output.push(`          ${JSON.stringify(name)}: {`)
  output.push(`            name: ${JSON.stringify(name)},`)
  if (fm.description) output.push(`            description: ${JSON.stringify(fm.description)},`)
  output.push(`            mode: ${JSON.stringify(fm.mode || 'subagent')},`)
  if (fm.hidden === 'true') output.push('            hidden: true,')
  if (fm.color) output.push(`            color: ${JSON.stringify(fm.color)},`)
  if (fm.temperature) output.push(`            temperature: ${parseFloat(fm.temperature)},`)
  if (fm.top_p) output.push(`            topP: ${parseFloat(fm.top_p)},`)
  output.push(`            prompt: ${promptConst},`)
  
  // Generate permissions
  if (fm.permission) {
    output.push('            permission: Permission.merge(defaults, Permission.fromConfig({')
    output.push(genPermissionCode(fm.permission, 14))
    output.push('            }), user),')
  } else {
    output.push('            permission: Permission.merge(defaults, Permission.fromConfig({ "*": "deny" }), user),')
  }
  
  output.push('            options: {},')
  output.push('          },')
}

output.push('        }')
output.push('')

// ── Config override merging ──────────────────────────
output.push('        // ── Merge user-defined agents from config ──')
output.push('        for (const [key, value] of Object.entries(cfg.agent ?? {})) {')
output.push('          if (value.disable) {')
output.push('            delete agents[key]')
output.push('            continue')
output.push('          }')
output.push('          let item = agents[key]')
output.push('          if (!item)')
output.push('            item = agents[key] = {')
output.push('              name: key,')
output.push('              mode: "all",')
output.push('              permission: Permission.merge(defaults, user),')
output.push('              options: {},')
output.push('              native: false,')
output.push('            }')
output.push('          if (value.model) item.model = Provider.parseModel(value.model)')
output.push('          item.variant = value.variant ?? item.variant')
output.push('          item.prompt = value.prompt ?? item.prompt')
output.push('          item.description = value.description ?? item.description')
output.push('          item.temperature = value.temperature ?? item.temperature')
output.push('          item.topP = value.top_p ?? item.topP')
output.push('          item.mode = value.mode ?? item.mode')
output.push('          item.color = value.color ?? item.color')
output.push('          item.hidden = value.hidden ?? item.hidden')
output.push('          item.name = value.name ?? item.name')
output.push('          item.steps = value.steps ?? item.steps')
output.push('          item.options = mergeDeep(item.options, value.options ?? {})')
output.push('          item.permission = Permission.merge(item.permission, Permission.fromConfig(value.permission ?? {}))')
output.push('        }')
output.push('')

// ── Ensure Truncate.GLOB is allowed ──────────────────
output.push('        // Ensure Truncate.GLOB is allowed unless explicitly configured')
output.push('        for (const name in agents) {')
output.push('          const agent = agents[name]')
output.push('          const explicit = agent.permission.some((r) => {')
output.push('            if (r.permission !== "external_directory") return false')
output.push('            if (r.action !== "deny") return false')
output.push('            return r.pattern === Truncate.GLOB')
output.push('          })')
output.push('          if (explicit) continue')
output.push('          agents[name].permission = Permission.merge(')
output.push('            agents[name].permission,')
output.push('            Permission.fromConfig({ external_directory: { [Truncate.GLOB]: "allow" } }),')
output.push('          )')
output.push('        }')
output.push('')

// ── Service methods ──────────────────────────────────
output.push('        // ── Service Methods ──')
output.push('        const get = Effect.fnUntraced(function* (agent: string) {')
output.push('          return agents[agent]')
output.push('        })')
output.push('')
output.push('        const list = Effect.fnUntraced(function* () {')
output.push('          const cfg = yield* config.get()')
output.push('          return pipe(')
output.push('            agents,')
output.push('            values(),')
output.push('            sortBy(')
output.push('              [(x) => cfg.default_agent ? x.name === cfg.default_agent : x.name === "ask", "desc"],')
output.push('              [(x) => x.name, "asc"],')
output.push('            ),')
output.push('          )')
output.push('        })')
output.push('')
output.push('        const defaultInfo = Effect.fnUntraced(function* () {')
output.push('          const c = yield* config.get()')
output.push('          if (c.default_agent) {')
output.push('            const agent = agents[c.default_agent]')
output.push('            if (!agent) throw new Error(\`default agent "\${c.default_agent}" not found\`)')
output.push('            if (agent.mode === "subagent") throw new Error(\`default agent "\${c.default_agent}" is a subagent\`)')
output.push('            if (agent.hidden === true) throw new Error(\`default agent "\${c.default_agent}" is hidden\`)')
output.push('            return agent')
output.push('          }')
output.push('          const visible = Object.values(agents).find((a) => a.mode !== "subagent" && a.hidden !== true)')
output.push('          if (!visible) throw new Error("no primary visible agent found")')
output.push('          return visible')
output.push('        })')
output.push('')
output.push('        const defaultAgent = Effect.fnUntraced(function* () {')
output.push('          return (yield* defaultInfo()).name')
output.push('        })')
output.push('')
output.push('        return { get, list, defaultInfo, defaultAgent }')
output.push('      }),')
output.push('    )')
output.push('')
output.push('    return Service.of({')
output.push('      get: Effect.fn("Agent.get")(function* (agent: string) {')
output.push('        return yield* InstanceState.useEffect(state, (s) => s.get(agent))')
output.push('      }),')
output.push('      list: Effect.fn("Agent.list")(function* () {')
output.push('        return yield* InstanceState.useEffect(state, (s) => s.list())')
output.push('      }),')
output.push('      defaultInfo: Effect.fn("Agent.defaultInfo")(function* () {')
output.push('        return yield* InstanceState.useEffect(state, (s) => s.defaultInfo())')
output.push('      }),')
output.push('      defaultAgent: Effect.fn("Agent.defaultAgent")(function* () {')
output.push('        return yield* InstanceState.useEffect(state, (s) => s.defaultAgent())')
output.push('      }),')
output.push('    })')
output.push('  }),')
output.push(')')
output.push('')
output.push('export const defaultLayer = layer.pipe(')
output.push('  Layer.provide(Plugin.defaultLayer),')
output.push('  Layer.provide(Provider.defaultLayer),')
output.push('  Layer.provide(Auth.defaultLayer),')
output.push('  Layer.provide(Config.defaultLayer),')
output.push('  Layer.provide(Skill.defaultLayer),')
output.push('  Layer.provide(LocationServiceMap.layer),')
output.push(')')
output.push('')
output.push('export * as Agent from "./agent"')

// Write to file
const outputPath = "D:/opencode/scripts/agent-output.ts"
fs.writeFileSync(outputPath, output.join('\n'))
console.log(`\n✓ Generated: ${outputPath}`)
console.log(`  Total agents: ${files.length - BUILTIN_KEEP.size} custom + ${BUILTIN_KEEP.size} built-in`)
