<p align="center">
  <img src="https://github.com/synapse-ai-hub/sources/raw/main/logo.png" alt="Logo" width="150">
</p>
<h3 align="center">Workspace Summary — opencode docs_leo</h3>

---

# Workspace Summary

> Repositorio: `D:\opencode`  
> Rama por defecto: `dev`  
> Versión: 1.17.9  
> Runtime: Bun (TypeScript ESM)

---

## docs_leo/00_INDICE.md

### Dependencies
- None (standalone index)

### Classes
- None

### Functions
- None

### Environment Variables
- None

### Connections
- References all docs_leo files (01–11)

### Summary
Master index of the opencode documentation in Spanish. Lists all 11 documents with their descriptions and states the purpose of the documentation set: allowing Leo to modify opencode's behavior by understanding where and how tools (`.txt` descriptions), system prompts (model personality), agents (built-in and subagents), skills (dynamic instructions), the registry (available tools), and compaction are defined.

---

## docs_leo/01_TOOLS_TXT_INYECCION.md

### Dependencies
- Sources: `packages/opencode/src/tool/*.txt`, `packages/opencode/src/tool/*.ts`

### Classes
- None (documentation only)

### Functions
- None (documentation only)

### Environment Variables
- None

### Connections
- Documents the tool system in `packages/opencode/src/tool/`

### Summary
Explains how `.txt` files are injected as tool descriptions for the LLM. Each tool has a `.txt` (natural language description the LLM sees) and a `.ts` (implementation). Covers the import mechanism via Bun (`import DESCRIPTION from "./read.txt"`), the flow from registration (registry.ts) to LLM exposure (llm/request.ts), and the special case of task.txt which can be dynamically enriched with agent descriptions.

---

## docs_leo/02_SYSTEM_PROMPTS.md

### Dependencies
- Sources: `packages/opencode/src/session/prompt/*.txt`, `packages/opencode/src/session/system.ts`, `packages/opencode/src/session/llm/request.ts`

### Classes
- None

### Functions
- `provider(model)` — selects the system prompt file based on the model's API ID (e.g., claude → anthropic.txt, gpt-4 → beast.txt)

### Environment Variables
- None

### Connections
- Documents system prompt assembly across `session/prompt/`, `system.ts`, and `llm/request.ts`

### Summary
Explains how system prompts are selected by model type (Claude, GPT, Gemini, Kimi, etc.) and assembled into the final prompt sent to the LLM. The final structure is: Agent/Model prompt → Environment info → User instructions → Skills list → User system prompt. Also covers per-agent prompts that override the model default.

---

## docs_leo/03_AGENTES.md

### Dependencies
- Sources: `packages/opencode/src/agent/agent.ts`, `packages/opencode/src/agent/prompt/*.txt`, `packages/opencode/src/agent/subagent-permissions.ts`

### Classes
- `Service` — `Context.Service` for the Agent service (`@opencode/Agent`)

### Functions
- `get(name)` — retrieves an agent by name
- `list()` — lists all available agents
- `defaultInfo()` — returns the first visible primary agent
- `defaultAgent()` — returns the default agent name
- `generate(input)` — generates a new agent via LLM

### Environment Variables
- None

### Connections
- Documents the agent system in `packages/opencode/src/agent/`

### Summary
Documents the agent architecture including built-in agents (build, plan, general, explore, compaction, title, summary), their modes (primary/subagent/all), the permission system (allow/deny/ask per tool), user-defined agents in `opencode.json`, and plan mode restrictions.

---

## docs_leo/04_SKILLS.md

### Dependencies
- Sources: `packages/opencode/src/skill/index.ts`, `packages/opencode/src/skill/discovery.ts`

### Classes
- `Info` — Schema.Struct with fields: name, description, location, content

### Functions
- None (documentation only)

### Environment Variables
- None

### Connections
- Documents the skill system in `packages/opencode/src/skill/`

### Summary
Explains the skill system — discovery locations (global `~/.claude/skills/`, `~/.agents/skills/`, project-level, remote URLs), SKILL.md format with frontmatter, the loading pipeline (scan → parse → add → deduplicate), XML formatting for LLM presentation, permission-based filtering, and the built-in `customize-opencode` skill.

---

## docs_leo/05_TOOL_REGISTRY.md

### Dependencies
- Sources: `packages/opencode/src/tool/registry.ts`, `packages/opencode/src/tool/tool.ts`, various tool `.ts` files

### Classes
- `ToolRegistry` — Effect service managing tool lifecycle
- `Tool.Context` — execution context with sessionID, messageID, agent, abort signal, etc.

### Functions
- `tools(input)` — filters available tools by provider, model, and permissions
- `describeTask()` — dynamically enriches the task tool description with available subagents

### Environment Variables
- None

### Connections
- Documents the tool registry in `packages/opencode/src/tool/`

### Summary
Documents how tools are registered and exposed to the LLM. Covers built-in and custom tool initialization, conditional tool activation (question, lsp, plan, websearch, apply_patch), dynamic task description enrichment, JSON Schema generation, plugin tool wrapping, and the Tool.Context passed during execution.

---

## docs_leo/06_BUILD_SYSTEM.md

### Dependencies
- Sources: `packages/opencode/script/build.ts`, `packages/opencode/script/generate.ts`

### Classes
- None

### Functions
- None (documentation only)

### Environment Variables
- `OPENCODE_VERSION` — package version injected at compile time
- `OPENCODE_CHANNEL` — release channel (release/dev)
- `FFF_LIBC` — gnu or musl based on target
- `OTUI_TREE_SITTER_WORKER_PATH` — path to tree-sitter worker
- `OPENCODE_WORKER_PATH` — path to TUI worker

### Connections
- Documents the build system in `packages/opencode/script/`

### Summary
Explains how opencode is compiled using `bun build --compile`. Covers the build process (code generation → native deps → web UI bundle → binary compilation), target platforms (linux/darwin/win32, arm64/x64), entrypoints, compile-time defines, and importantly that `.txt` files are automatically embedded by Bun without a separate packaging step.

---

## docs_leo/07_FLUJO_PROMPT.md

### Dependencies
- Sources: `packages/opencode/src/session/prompt.ts`, `system.ts`, `llm/request.ts`, `processor.ts`, various `.txt` files

### Classes
- None

### Functions
- None (documentation only)

### Environment Variables
- None

### Connections
- Documents the full prompt flow across multiple session/ files

### Summary
Traces the complete flow from user input to LLM request and back: message creation with part resolution → run loop → tool resolution (permissions, AI SDK format) → system prompt assembly (environment + instructions + skills) → LLM call (native or AI SDK runtime) → response processing → continue loop. Also includes a timeline of when each `.txt` file type is injected (compile time, init time, request time).

---

## docs_leo/08_ESTRUCTURA_GENERAL.md

### Dependencies
- None (high-level map)

### Classes
- None

### Functions
- None

### Environment Variables
- None

### Connections
- High-level reference of the entire repository

### Summary
Provides a high-level repository map of the opencode monorepo. Covers all packages (opencode core, core, app, cli, console, desktop, docs, llm, plugin, sdk, server, tui, ui, web) and drills into the key directories relevant for modifying behavior: tools (descriptions + implementations), system prompts (per-model `.txt` files), agents, skills, and session orchestration. Includes the Bun `.txt` import pattern and modification notes.

---

## docs_leo/09_COMPACTACION_ACTUAL.md

### Dependencies
- Sources: `packages/opencode/src/session/compaction.ts`, `overflow.ts`, `prompt.ts`, `message-v2.ts`
- Sources: `packages/core/src/session/compaction.ts`
- Sources: `packages/opencode/src/agent/prompt/compaction.txt`, `agent/agent.ts`

### Classes
- None

### Functions
- `isOverflow(input)` — detects when token usage approaches the model's context limit (default buffer: 20,000 tokens)
- `usable(input)` — calculates the usable token budget considering model limits and reserved buffer
- `create()` — creates a compaction user message part in the session
- `process()` — executes compaction: select() → buildPrompt() → LLM call → save summary
- `select()` — splits conversation into HEAD (to summarize) and TAIL (to keep verbatim)
- `buildPrompt()` — constructs the summary prompt using the fixed SUMMARY_TEMPLATE
- `filterCompacted()` — reorders messages post-compaction so the model sees [Summary][Tail][Continue]
- `prune()` — removes large tool outputs going backward from the end

### Environment Variables
- None

### Connections
- Multiple files across `packages/opencode/src/session/` and `packages/core/src/session/`

### Summary
Detailed documentation of the current compaction system in opencode v1.17.9. Covers the auto-trigger in the run loop when tokens exceed `context - reserved`, overflow detection logic, the compaction pipeline (create → process → select → buildPrompt → LLM call → save), the fixed SUMMARY_TEMPLATE (Goal, Constraints, Progress, Key Decisions, Next Steps, Critical Context, Relevant Files), post-compaction reordering via filterCompacted(), configurable options (auto, prune, reserved, tail_turns, preserve_recent_tokens), and the prune system for cleaning large tool outputs.

---

## docs_leo/10_NUEVO_SISTEMA_COMPACTACION_PROPUESTA.md

### Dependencies
- References existing compaction code in `packages/opencode/src/session/compaction.ts`, `overflow.ts`, `prompt.ts`, `message-v2.ts`
- References `packages/core/src/session/compaction.ts`
- References ProspectingAgent (`D:/ProspectingAgent`) as CoD inspiration
- References `packages/opencode/src/agent/prompt/compaction.txt`, `session/tools.ts`

### Classes
- None

### Functions
- `truncate(messages, percentage)` — proposed new function that calculates a cut point at ~30% from the start of the conversation and returns a tail_start_id for filterCompacted() to use

### Environment Variables
- None

### Connections
- References compaction.ts, overflow.ts, prompt.ts, message-v2.ts, compaction.txt, tools.ts, core session/compaction.ts

### Summary
Proposal for a new compaction system. Instead of auto-compacting with a fixed template, the system would ask the user what to do when the token limit is approached, offering two options: (1) **Compact with Chain of Density (CoD)** — 4-round iterative summarization producing progressively denser summaries, inspired by ProspectingAgent; (2) **Sliding window truncation** — remove the oldest ~30% of messages, keeping the end entirely intact without needing an LLM call. Includes implementation details for the truncate() function, integration with existing filterCompacted(), a proposed configuration schema with new options (strategy, truncate_percent, cod_rounds), and a file-by-file modification plan.

---

## docs_leo/11_INSTALACION_Y_BUILD.md

### Dependencies
- None (standalone guide)

### Classes
- None

### Functions
- None

### Environment Variables
- `OPENCODE_EXPERIMENTAL` — enables experimental features when set to "true"
- `OPENCODE_DEBUG_TOKENS` — enables token-level logging when set to "true"

### Connections
- References the repository structure at a high level

### Summary
Complete guide for installing, building, and developing opencode. Covers the tech stack (TypeScript, Bun, Effect 3.x, SolidJS, SQLite), prerequisites (Bun ≥ 1.3.14, Git, VS Build Tools on Windows), installation steps (clone → bun install → postinstall), dev mode with Bun hot-reload and useful flags, binary compilation via `bun build --compile` with platform targets, type checking with tsgo, testing (do not run from root), project structure map (packages/opencode/src/ breakdown), and important notes about .txt file imports, Effect framework patterns, and Windows-specific considerations.
