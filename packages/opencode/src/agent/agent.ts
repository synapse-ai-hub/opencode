import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { PermissionV1 } from "@opencode-ai/core/v1/permission"
import { Config } from "@/config/config"
import { serviceUse } from "@opencode-ai/core/effect/service-use"
import { Provider } from "@/provider/provider"

import { Truncate } from "@/tool/truncate"

import PROMPT_COMPACTION from "./prompt/compaction.txt"
import PROMPT_COMPACTION_COD from "./prompt/compaction-cod.txt"
import PROMPT_TITLE from "./prompt/title.txt"

import PROMPT_AGENT_ENGINEER from "./prompt/agent-engineer.txt"
import PROMPT_AI_ARCHITECT from "./prompt/ai-architect.txt"
import PROMPT_AI_RESEARCH from "./prompt/ai-research.txt"
import PROMPT_ASK from "./prompt/ask.txt"
import PROMPT_BUILDER from "./prompt/builder.txt"
import PROMPT_CODE_REVIEWER from "./prompt/code-reviewer.txt"
import PROMPT_DATA_ANALYST from "./prompt/data-analyst.txt"
import PROMPT_DEV_ORCHESTRATOR from "./prompt/dev-orchestrator.txt"
import PROMPT_EXPLORER from "./prompt/explorer.txt"
import PROMPT_LLM_AUDITOR from "./prompt/llm-auditor.txt"
import PROMPT_ML_ENGINEER from "./prompt/ml-engineer.txt"
import PROMPT_PLANNER from "./prompt/planner.txt"
import PROMPT_PRODUCT_MANAGER from "./prompt/product-manager.txt"
import PROMPT_PRODUCT_ORCHESTRATOR from "./prompt/product-orchestrator.txt"
import PROMPT_PRODUCT_OWNER from "./prompt/product-owner.txt"
import PROMPT_PROPOSAL_GENERATOR from "./prompt/proposal-generator.txt"
import PROMPT_QA from "./prompt/qa.txt"
import PROMPT_SECURITY_SPECIALIST from "./prompt/security-specialist.txt"
import PROMPT_SOFTWARE_ENGINEER from "./prompt/software-engineer.txt"
import PROMPT_SPEC_MINER from "./prompt/spec-miner.txt"
import PROMPT_UPDATE from "./prompt/update.txt"

import { Permission } from "@/permission"
import { mergeDeep, pipe, sortBy, values } from "remeda"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import { Plugin } from "@/plugin"
import { Skill } from "../skill"
import { Effect, Context, Layer, Schema } from "effect"
import { InstanceState } from "@/effect/instance-state"
import { AbsolutePath, type DeepMutable } from "@opencode-ai/core/schema"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { LocationServiceMap } from "@opencode-ai/core/location-layer"
import { Reference } from "@opencode-ai/core/reference"
import { Location } from "@opencode-ai/core/location"
import { PluginV2 } from "@opencode-ai/core/plugin"

export const Info = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  mode: Schema.Literals(["subagent", "primary", "all"]),
  native: Schema.optional(Schema.Boolean),
  hidden: Schema.optional(Schema.Boolean),
  topP: Schema.optional(Schema.Finite),
  temperature: Schema.optional(Schema.Finite),
  color: Schema.optional(Schema.String),
  permission: PermissionV1.Ruleset,
  model: Schema.optional(
    Schema.Struct({
      modelID: ModelV2.ID,
      providerID: ProviderV2.ID,
    }),
  ),
  variant: Schema.optional(Schema.String),
  prompt: Schema.optional(Schema.String),
  options: Schema.Record(Schema.String, Schema.Unknown),
  steps: Schema.optional(Schema.Finite),
}).annotate({ identifier: "Agent" })
export type Info = DeepMutable<Schema.Schema.Type<typeof Info>>

export interface Interface {
  readonly get: (agent: string) => Effect.Effect<Info>
  readonly list: () => Effect.Effect<Info[]>
  readonly defaultInfo: () => Effect.Effect<Info>
  readonly defaultAgent: () => Effect.Effect<string>
}

type State = Interface

export class Service extends Context.Service<Service, Interface>()("@opencode/Agent") {}

export const use = serviceUse(Service)

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const config = yield* Config.Service
    const plugin = yield* Plugin.Service
    const skill = yield* Skill.Service
    const provider = yield* Provider.Service
    const locations = yield* LocationServiceMap

    const state = yield* InstanceState.make<State>(
      Effect.fn("Agent.state")(function* (ctx) {
        const cfg = yield* config.get()
        const skillDirs = yield* skill.dirs()
        const referenceDirs = Object.keys(cfg.references ?? cfg.reference ?? {}).length
          ? yield* Effect.gen(function* () {
              yield* (yield* PluginV2.Service).wait(PluginV2.ID.make("core/config-reference"))
              return (yield* (yield* Reference.Service).list()).map((reference) => reference.path)
            }).pipe(Effect.provide(locations.get(Location.Ref.make({ directory: AbsolutePath.make(ctx.directory) }))))
          : []
        const whitelistedDirs = [
          Truncate.GLOB,
          path.join(Global.Path.tmp, "*"),
          ...skillDirs.map((dir) => path.join(dir, "*")),
          ...referenceDirs.map((dir) => path.join(dir, "*")),
        ]
        const defaults = Permission.fromConfig({
          "*": "allow",
          doom_loop: "ask",
          external_directory: {
            "*": "ask",
            ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
          },
          question: "deny",
          plan_enter: "deny",
          plan_exit: "deny",
          // mirrors github.com/github/gitignore Node.gitignore pattern for .env files
          read: {
            "*": "allow",
            "*.env": "ask",
            "*.env.*": "ask",
            "*.env.example": "allow",
          },
        })

        const user = Permission.fromConfig(cfg.permission ?? {})

        const agents: Record<string, Info> = {
          compaction: {
            name: "compaction",
            mode: "primary",
            native: true,
            hidden: true,
            prompt: PROMPT_COMPACTION,
            permission: Permission.merge(defaults, Permission.fromConfig({ "*": "deny" }), user),
            options: {},
          },
          title: {
            name: "title",
            mode: "primary",
            options: {},
            native: true,
            hidden: true,
            temperature: 0.5,
            permission: Permission.merge(defaults, Permission.fromConfig({ "*": "deny" }), user),
            prompt: PROMPT_TITLE,
          },
          // ── Custom Agents ────────────────────────────────────
          "agent-engineer": {
            name: "agent-engineer",
            description: "Context Engineering & Agent Security Specialist - Instruction hierarchy, constraint enforcement, guardrailing, red-teaming, and agent evaluation",
            mode: "primary",
            color: "#9f07c5",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_AGENT_ENGINEER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "deny",
              task: { "*": "deny", "llm-auditor": "allow", "ai-architect": "allow",
                "security-specialist": "allow", "code-reviewer": "allow", "software-engineer": "allow",
                "qa": "allow", "spec-miner": "allow", "ml-engineer": "allow", "ai-research": "allow",
                "workspace-explorer": "allow", "update": "allow", "docs": "allow" },
              skill: { "*": "deny",
                "global-standards": "allow", "debugging-wizard": "allow",
                "python-pro": "allow",
                "context-engineer": "allow", "guardrail-implementer": "allow",
                "evaluation-specialist": "allow",
                "prompt-engineer": "allow", "skill-creator": "allow",
                "fine-tuning-expert": "allow" },
            }), user),
            options: {},
          },
          "ai-architect": {
            name: "ai-architect",
            description: "AI Systems Architect - Design architectures, evaluate tools, decide on infrastructure and stack",
            mode: "primary",
            color: "#EAB308",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_AI_ARCHITECT,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",
              bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" },
              lsp: "allow", apply_patch: "allow", todowrite: "allow",
              webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-research": "allow", "software-engineer": "allow",
                "security-specialist": "allow", "spec-miner": "allow",
                "workspace-explorer": "allow", "update": "allow",
                "product-manager": "allow", "docs": "allow",
                "code-reviewer": "allow", "builder": "allow" },
              skill: { "*": "deny", "api-designer": "allow", "cloud-architect": "allow",
                "fastapi-expert": "allow", "feature-forge": "allow",
                "fine-tuning-expert": "allow", "graphql-architect": "allow",
                "mcp-developer": "allow", "microservices-architect": "allow",
                "rag-architect": "allow",
                "global-standards": "allow", "devops-engineer": "allow" },
            }), user),
            options: {},
          },
          "ai-research": {
            name: "ai-research",
            description: "AI/ML Research Specialist - Autonomous agent for ML, DL, LLM implementation and research",
            mode: "primary",
            color: "#22C55E",
            temperature: 0.4,
            topP: 0.85,
            prompt: PROMPT_AI_RESEARCH,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",
              bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" },
              lsp: "allow", apply_patch: "allow", todowrite: "allow",
              webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "software-engineer": "allow", "spec-miner": "allow",
                "workspace-explorer": "allow", "update": "allow",
                "product-manager": "allow", "ai-architect": "allow",
                "docs": "allow", "ml-engineer": "allow" },
              skill: { "*": "deny" },
            }), user),
            options: {},
          },
          ask: {
            name: "ask",
            description: "Knowledge Query Agent - Answers questions using all NotebookLM notebooks",
            mode: "primary",
            color: "#10B981",
            temperature: 0.45,
            topP: 0.85,
            prompt: PROMPT_ASK,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "deny", write: "deny",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "security-specialist": "allow",
                "software-engineer": "allow", "ai-architect": "allow", "ai-research": "allow",
                "spec-miner": "allow", "product-manager": "allow", "product-owner": "allow",
                "ml-engineer": "allow", "agent-engineer": "allow" },
              skill: { "*": "deny" },
            }), user),
            options: {},
          },
          builder: {
            name: "builder",
            description: "Code builder agent - Implements features following strict quality standards with mandatory review cycle",
            mode: "primary",
            color: "#FF00FF",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_BUILDER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",               bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" }, lsp: "allow",
              apply_patch: "allow", todowrite: "allow", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "code-reviewer": "allow",
                "qa": "allow", "ai-research": "allow", "docs": "allow", "software-engineer": "allow",
                "ml-engineer": "allow", "security-specialist": "allow", "spec-miner": "allow",
                "update": "allow", "agent-engineer": "allow", "workspace-explorer": "allow" },
              skill: { "*": "deny", "api-designer": "allow", "cloud-architect": "allow",
                "code-documenter": "allow", "debugging-wizard": "allow",
                "fastapi-expert": "allow", "fine-tuning-expert": "allow",
                "graphql-architect": "allow", "javascript-pro": "allow",
                "mcp-developer": "allow", "microservices-architect": "allow", "pandas-pro": "allow",
                "python-pro": "allow", "rag-architect": "allow", "react-expert": "allow",
                "sql-pro": "allow", "typescript-pro": "allow",
                "global-standards": "allow", "fullstack-guardian": "allow",
                "skill-creator": "allow", "prompt-engineer": "allow" },
            }), user),
            options: {},
          },
          "code-reviewer": {
            name: "code-reviewer",
            description: "Senior Software Architect for code review",
            mode: "subagent",
            hidden: true,
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_CODE_REVIEWER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "deny",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "product-manager": "allow", "qa": "allow", "docs": "allow",
                "security-specialist": "allow", "spec-miner": "allow",
                "software-engineer": "allow", "update": "allow",
                "agent-engineer": "allow" },
              skill: { "*": "deny", "code-reviewer": "allow", "debugging-wizard": "allow",
                "javascript-pro": "allow", "python-pro": "allow", "react-expert": "allow",
                "secure-code-guardian": "allow", "security-reviewer": "allow",
                "typescript-pro": "allow",
                "global-standards": "allow", "skill-creator": "allow",
                "prompt-engineer": "allow", "fullstack-guardian": "allow",
                "fastapi-expert": "allow" },
            }), user),
            options: {},
          },
          "data-analyst": {
            name: "data-analyst",
            description: "Senior Data Analyst using synapseTools for EDA",
            mode: "subagent",
            hidden: true,
            prompt: PROMPT_DATA_ANALYST,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-research": "allow", "docs": "allow",
                "update": "allow" },
              skill: { "*": "deny", "global-standards": "allow", "pandas-pro": "allow",
                "sql-pro": "allow", "python-pro": "allow" },
            }), user),
            options: {},
          },
          "dev-orchestrator": {
            name: "dev-orchestrator",
            description: "Dev Orchestrator - Complete workflow orchestrator for code development",
            mode: "primary",
            color: "#8B5CF6",
            temperature: 0.0,
            topP: 0.60,
            prompt: PROMPT_DEV_ORCHESTRATOR,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",               bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" }, lsp: "allow",
              apply_patch: "allow", todowrite: "allow", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "planner": "allow", "builder": "allow",
                "code-reviewer": "allow", "qa": "allow", "security-specialist": "allow",
                "software-engineer": "allow", "ai-architect": "allow", "ai-research": "allow",
                "product-manager": "allow", "product-owner": "allow", "spec-miner": "allow",
                "docs": "allow", "ml-engineer": "allow", "workspace-explorer": "allow",
                "update": "allow", "agent-engineer": "allow", "llm-auditor": "allow" },
              skill: { "*": "deny",
                "global-standards": "allow", "skill-creator": "allow",
                "docs-template": "allow", "debugging-wizard": "allow",
                "prompt-engineer": "allow", "dispatching-parallel-agents": "allow" },
            }), user),
            options: {},
          },
          "workspace-explorer": {
            name: "workspace-explorer",
            description: "Workspace Explorer - Generates code summary of the workspace",
            mode: "primary",
            color: "#3B82F6",
            temperature: 0.2,
            topP: 0.75,
            prompt: PROMPT_EXPLORER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",               bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" }, lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow", task: { "*": "deny" },
              skill: { "*": "deny", "global-standards": "allow", "code-documenter": "allow",
                "spec-miner": "allow", "debugging-wizard": "allow",
                "python-pro": "allow", "typescript-pro": "allow", "fastapi-expert": "allow" },
            }), user),
            options: {},
          },
          "llm-auditor": {
            name: "llm-auditor",
            description: "Senior LLM Auditor for RLHF analysis",
            mode: "primary",
            color: "#cc7127",
            temperature: 0.0,
            topP: 0.40,
            prompt: PROMPT_LLM_AUDITOR,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",               bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" }, lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow", task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "docs": "allow", "update": "allow", "agent-engineer": "allow", "ml-engineer": "allow" },
              skill: { "*": "deny", "global-standards": "allow", "llm-review": "allow",
                 "prompt-engineer": "allow", "evaluation-specialist": "allow",
                "context-engineer": "allow", "guardrail-implementer": "allow" },
            }), user),
            options: {},
          },
          "ml-engineer": {
            name: "ml-engineer",
            description: "ML Engineer - Data analysis, machine learning pipelines, and AI model implementation expert",
            mode: "subagent",
            hidden: true,
            temperature: 0.2,
            topP: 0.65,
            prompt: PROMPT_ML_ENGINEER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "spec-miner": "allow", "code-reviewer": "allow", "security-specialist": "allow",
                "product-manager": "allow", "docs": "allow", "update": "allow",
                "workspace-explorer": "allow", "agent-engineer": "allow",
                "software-engineer": "allow" },
              skill: { "*": "deny", "debugging-wizard": "allow", "fastapi-expert": "allow",
                "fine-tuning-expert": "allow",
                "python-pro": "allow", "rag-architect": "allow",
                "global-standards": "allow", "pandas-pro": "allow",
                "evaluation-specialist": "allow", "prompt-engineer": "allow" },
            }), user),
            options: {},
          },
          planner: {
            name: "planner",
            description: "Plan agent - Exhaustively analyze and create detailed atomic plans without making any changes",
            mode: "primary",
            color: "#FFA500",
            temperature: 0.4,
            topP: 0.8,
            prompt: PROMPT_PLANNER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "product-manager": "allow", "code-reviewer": "allow", "qa": "allow",
                "builder": "allow", "docs": "allow", "software-engineer": "allow",
                "ml-engineer": "allow", "security-specialist": "allow",
                "workspace-explorer": "allow", "spec-miner": "allow" },
              skill: { "*": "deny", "debugging-wizard": "allow", "fastapi-expert": "allow",
                "fine-tuning-expert": "allow", "graphql-architect": "allow",
                "rag-architect": "allow", "test-master": "allow",
                "global-standards": "allow", "python-pro": "allow",
                "typescript-pro": "allow", "cloud-architect": "allow",
                "prompt-engineer": "allow" },
            }), user),
            options: {},
          },
          "product-manager": {
            name: "product-manager",
            description: "Product Manager - Define features, create roadmaps, write PRD, analyze markets",
            mode: "primary",
            color: "#A855F7",
            prompt: PROMPT_PRODUCT_MANAGER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "product-owner": "allow", "docs": "allow", "proposal-generator": "allow",
                "update": "allow", "spec-miner": "allow",
                "workspace-explorer": "allow", "agent-engineer": "allow" },
              skill: { "*": "deny", "feature-forge": "allow",
                "global-standards": "allow",
                "acquisition-channel-advisor": "allow",
                "ai-shaped-readiness-advisor": "allow",
                "altitude-horizon-framework": "allow",
                "business-health-diagnostic": "allow", "company-research": "allow",
                "context-engineering-advisor": "allow",
                "customer-journey-map": "allow",
                "customer-journey-mapping-workshop": "allow",
                "discovery-interview-prep": "allow", "discovery-process": "allow",
                "director-readiness-advisor": "allow",
                "epic-breakdown-advisor": "allow", "epic-hypothesis": "allow",
                "executive-onboarding-playbook": "allow",
                "feature-investment-advisor": "allow",
                "finance-based-pricing-advisor": "allow",
                "finance-metrics-quickref": "allow",
                "jobs-to-be-done": "allow", "lean-ux-canvas": "allow",
                "opportunity-solution-tree": "allow", "pestel-analysis": "allow",
                "pol-probe": "allow", "pol-probe-advisor": "allow",
                "positioning-statement": "allow", "positioning-workshop": "allow",
                "prd-development": "allow", "press-release": "allow",
                "prioritization-advisor": "allow",
                "problem-framing-canvas": "allow", "problem-statement": "allow",
                "product-sense-interview-answer": "allow",
                "product-strategy-session": "allow", "proto-persona": "allow",
                "recommendation-canvas": "allow", "roadmap-planning": "allow",
                "saas-economics-efficiency-metrics": "allow",
                "saas-revenue-growth-metrics": "allow",
                "skill-authoring-workflow": "allow", "storyboard": "allow",
                "tam-sam-som-calculator": "allow", "user-story": "allow",
                "user-story-mapping": "allow",
                "user-story-mapping-workshop": "allow",
                "user-story-splitting": "allow",
                "vp-cpo-readiness-advisor": "allow",
                "workshop-facilitation": "allow" },
            }), user),
            options: {},
          },
          "product-orchestrator": {
            name: "product-orchestrator",
            description: "Product Orchestrator - Investigates and defines product requirements, architecture, and scope",
            mode: "primary",
            color: "#dfbb2d",
            temperature: 0.0,
            topP: 0.60,
            prompt: PROMPT_PRODUCT_ORCHESTRATOR,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",
              bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" },
              lsp: "allow",
              apply_patch: "allow", todowrite: "allow", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-research": "allow", "ai-architect": "allow",
                "software-engineer": "allow", "product-manager": "allow",
                "spec-miner": "allow", "docs": "allow",
                "update": "allow", "workspace-explorer": "allow" },
              skill: { "*": "deny",
                "global-standards": "allow", "skill-creator": "allow",
                "docs-template": "allow", "prompt-engineer": "allow",
                "dispatching-parallel-agents": "allow" },
            }), user),
            options: {},
          },
          "product-owner": {
            name: "product-owner",
            description: "Product Owner - Manage backlog, prioritize with stakeholders, coordinate with dev team, use Trello for task management",
            mode: "primary",
            color: "#EF4444",
            prompt: PROMPT_PRODUCT_OWNER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "product-manager": "allow", "docs": "allow",
                "update": "allow", "spec-miner": "allow",
                "workspace-explorer": "allow", "proposal-generator": "allow" },
              skill: { "*": "deny", "global-standards": "allow",
                "epic-hypothesis": "allow", "prioritization-advisor": "allow",
                "user-story": "allow" },
            }), user),
            options: {},
          },
          "proposal-generator": {
            name: "proposal-generator",
            description: "Proposal Generator - Creates detailed technical and business proposals",
            mode: "subagent",
            color: "#10B981",
            prompt: PROMPT_PROPOSAL_GENERATOR,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "update": "allow", "docs": "allow" },
              skill: { "*": "deny", "proposal-framework": "allow", "global-standards": "allow",
                "docs-template": "allow" },
            }), user),
            options: {},
          },
          qa: {
            name: "qa",
            description: "Senior SDET for testing and quality assurance",
            mode: "subagent",
            hidden: true,
            color: "#EF4444",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_QA,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "deny",
              task: { "*": "deny", "ai-architect": "allow", "ai-research": "allow",
                "code-reviewer": "allow", "llm-auditor": "allow",
                "product-manager": "allow", "docs": "allow",
                "software-engineer": "allow", "security-specialist": "allow",
                "spec-miner": "allow", "update": "allow",
                "agent-engineer": "allow" },
              skill: { "*": "deny", "debugging-wizard": "allow", "javascript-pro": "allow",
                "python-pro": "allow", "react-expert": "allow",
                "secure-code-guardian": "allow", "security-reviewer": "allow",
                "test-master": "allow", "typescript-pro": "allow",
                "global-standards": "allow", "sql-pro": "allow",
                "fastapi-expert": "allow", "qa-expert": "allow",
                "evaluation-specialist": "allow" },
            }), user),
            options: {},
          },
          "security-specialist": {
            name: "security-specialist",
            description: "Security Specialist - Authentication, encryption, secrets management, and security best practices expert",
            mode: "subagent",
            hidden: true,
            color: "#DC2626",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_SECURITY_SPECIALIST,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "code-reviewer": "allow",
                "software-engineer": "allow", "product-manager": "allow",
                "ai-research": "allow", "docs": "allow",
                "spec-miner": "allow", "update": "allow",
                "agent-engineer": "allow" },
              skill: { "*": "deny", "debugging-wizard": "allow", "fastapi-expert": "allow",
                "python-pro": "allow",
                "secure-code-guardian": "allow", "security-reviewer": "allow",
                "global-standards": "allow", "fullstack-guardian": "allow" },
            }), user),
            options: {},
          },
          "software-engineer": {
            name: "software-engineer",
            description: "Software Engineer - DevOps, infrastructure, database architecture, and system configuration expert",
            mode: "primary",
            temperature: 0.0,
            topP: 0.65,
            prompt: PROMPT_SOFTWARE_ENGINEER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",               bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" }, lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-architect": "allow", "code-reviewer": "allow",
                "security-specialist": "allow", "spec-miner": "allow",
                "product-manager": "allow", "ai-research": "allow",
                "docs": "allow", "update": "allow",
                "workspace-explorer": "allow", "ml-engineer": "allow",
                "agent-engineer": "allow" },
              skill: { "*": "deny", "debugging-wizard": "allow", "devops-engineer": "allow",
                "fastapi-expert": "allow", "postgres-pro": "allow",
                "python-pro": "allow",
                "global-standards": "allow", "cloud-architect": "allow",
                "microservices-architect": "allow", "api-designer": "allow",
                "sql-pro": "allow", "database-optimizer": "allow",
                "mcp-developer": "allow", "prompt-engineer": "allow",
                "skill-creator": "allow" },
            }), user),
            options: {},
          },
          "spec-miner": {
            name: "spec-miner",
            description: "Reverse Engineering Specialist - Extracts specifications and business logic from existing codebases without writing new code.",
            mode: "primary",
            color: "#c34c0b",
            temperature: 0.0,
            topP: 0.5,
            prompt: PROMPT_SPEC_MINER,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow",
              bash: { "*": "allow", "git restore *": "deny", "git restore": "deny" },
              lsp: "allow",
              apply_patch: "allow", todowrite: "allow", webfetch: "allow", websearch: "allow",
              question: "allow",
              task: { "*": "deny", "ai-research": "allow", "ai-architect": "allow",
                "software-engineer": "allow", "security-specialist": "allow",
                "code-reviewer": "allow", "product-manager": "allow",
                "docs": "allow", "update": "allow",
                "workspace-explorer": "allow", "agent-engineer": "allow" },
              skill: { "*": "deny", "spec-miner": "allow", "debugging-wizard": "allow",
                "python-pro": "allow", "typescript-pro": "allow", "javascript-pro": "allow",
                "fastapi-expert": "allow", "sql-pro": "allow", "postgres-pro": "allow",
                "react-expert": "allow", "code-documenter": "allow",
                "api-designer": "allow" },
            }), user),
            options: {},
          },
          update: {
            name: "update",
            description: "Updates workspace summary when files are written or edited",
            mode: "subagent",
            hidden: true,
            temperature: 0.2,
            topP: 0.75,
            prompt: PROMPT_UPDATE,
            permission: Permission.merge(defaults, Permission.fromConfig({
               read: "allow", edit: "allow", write: "allow",
              glob: "allow", grep: "allow", bash: "deny", lsp: "deny",
              apply_patch: "deny", todowrite: "deny", webfetch: "deny", websearch: "deny",
              question: "deny",
              task: { "*": "deny", "workspace-explorer": "allow" },
              skill: { "*": "deny", "global-standards": "allow",
                "code-documenter": "allow" },
            }), user),
            options: {},
          },
        }

        for (const [key, value] of Object.entries(cfg.agent ?? {})) {
          if (value.disable) {
            delete agents[key]
            continue
          }
          let item = agents[key]
          if (!item)
            item = agents[key] = {
              name: key,
              mode: "all",
              permission: Permission.merge(defaults, user),
              options: {},
              native: false,
            }
          if (value.model) item.model = Provider.parseModel(value.model)
          item.variant = value.variant ?? item.variant
          item.prompt = value.prompt ?? item.prompt
          item.description = value.description ?? item.description
          item.temperature = value.temperature ?? item.temperature
          item.topP = value.top_p ?? item.topP
          item.mode = value.mode ?? item.mode
          item.color = value.color ?? item.color
          item.hidden = value.hidden ?? item.hidden
          item.name = value.name ?? item.name
          item.steps = value.steps ?? item.steps
          item.options = mergeDeep(item.options, value.options ?? {})
          item.permission = Permission.merge(item.permission, Permission.fromConfig(value.permission ?? {}))
        }

        // Ensure Truncate.GLOB is allowed unless explicitly configured
        for (const name in agents) {
          const agent = agents[name]
          const explicit = agent.permission.some((r) => {
            if (r.permission !== "external_directory") return false
            if (r.action !== "deny") return false
            return r.pattern === Truncate.GLOB
          })
          if (explicit) continue

          agents[name].permission = Permission.merge(
            agents[name].permission,
            Permission.fromConfig({ external_directory: { [Truncate.GLOB]: "allow" } }),
          )
        }

        const get = Effect.fnUntraced(function* (agent: string) {
          return agents[agent]
        })

        const list = Effect.fnUntraced(function* () {
          const cfg = yield* config.get()
          return pipe(
            agents,
            values(),
            sortBy(
              [(x) => (cfg.default_agent ? x.name === cfg.default_agent : x.name === "ask"), "desc"],
              [(x) => x.name, "asc"],
            ),
          )
        })

        const defaultInfo = Effect.fnUntraced(function* () {
          const c = yield* config.get()
          if (c.default_agent) {
            const agent = agents[c.default_agent]
            if (!agent) throw new Error(`default agent "${c.default_agent}" not found`)
            if (agent.mode === "subagent") throw new Error(`default agent "${c.default_agent}" is a subagent`)
            if (agent.hidden === true) throw new Error(`default agent "${c.default_agent}" is hidden`)
            return agent
          }
          const visible = Object.values(agents).find((a) => a.mode !== "subagent" && a.hidden !== true)
          if (!visible) throw new Error("no primary visible agent found")
          return visible
        })

        const defaultAgent = Effect.fnUntraced(function* () {
          return (yield* defaultInfo()).name
        })

        return {
          get,
          list,
          defaultInfo,
          defaultAgent,
        } satisfies State
      }),
    )

    return Service.of({
      get: Effect.fn("Agent.get")(function* (agent: string) {
        return yield* InstanceState.useEffect(state, (s) => s.get(agent))
      }),
      list: Effect.fn("Agent.list")(function* () {
        return yield* InstanceState.useEffect(state, (s) => s.list())
      }),
      defaultInfo: Effect.fn("Agent.defaultInfo")(function* () {
        return yield* InstanceState.useEffect(state, (s) => s.defaultInfo())
      }),
      defaultAgent: Effect.fn("Agent.defaultAgent")(function* () {
        return yield* InstanceState.useEffect(state, (s) => s.defaultAgent())
      }),
    })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Plugin.defaultLayer),
  Layer.provide(Provider.defaultLayer),
  Layer.provide(Config.defaultLayer),
  Layer.provide(Skill.defaultLayer),
  Layer.provide(LocationServiceMap.layer),
)

const locationServiceMapNode = LayerNode.make(LocationServiceMap.layer, [])

export const node = LayerNode.make(layer, [
  Config.node,
  Plugin.node,
  Skill.node,
  Provider.node,
  locationServiceMapNode,
])

export * as Agent from "./agent"
