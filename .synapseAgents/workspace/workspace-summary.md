<p align="center">
  <img src="https://github.com/synapse-ai-hub/sources/raw/main/logo.png" alt="Logo" width="150">
</p>
<h3 align="center">Workspace Summary</h3>

---

## packages/opencode/src/agent/prompt/ml-engineer.txt

### Dependencies
- None (standalone prompt file)

### Classes
- None

### Functions
- None

### Environment Variables
- None

### Connections
- References NotebookLM notebook "mlops-deployment-guide" (ID: 6ab8b2d3-aa75-4ead-a4d1-52b8cb603074) for knowledge base queries on MLOps best practices
- References other agent types for consultation delegation: ai-architect, ai-research, spec-miner, code-reviewer, security-specialist, product-manager, docs, update, workspace-explorer, agent-engineer, software-engineer
- Depends on `.synapseAgents/workspace/workspace-summary.md` for initial codebase context
- Integrates with NotebookLM tools (notebooklm_ask_question, notebooklm_list_notebooks, etc.) via session-managed queries

### Summary
Prompt definition file for an **ML Engineer (Data Analysis & Machine Learning Expert)** agent role. Defines the agent's scope (data analysis, ML pipelines, model training, LLM integration, RAG systems, fine-tuning, MLOps), available tools (read, grep, glob, question, websearch, webfetch, task), and a consultation methodology with structured JSON output schema. 

**Three sections were recently added (after "Tools Available", before "Consultation Methodology"):**
1. **Knowledge Base** — References a dedicated NotebookLM notebook ("mlops-deployment-guide") containing MLOps deployment strategies, framework comparisons, model serialization/serving patterns, batch/real-time/edge deployment, monitoring/observability, and CI/CD pipelines for ML.
2. **Session Management (IMPORTANT)** — Standard instructions for using unique session IDs, closing unused sessions on errors, limiting to one session per task, and cleaning up old sessions before starting new queries.
3. **Notebook Usage** — Instructions on when to query the knowledge base using notebooklm tools: finding deployment patterns, getting infrastructure recommendations, and verifying approaches against documented production patterns.

Also defines delegation rules for consulting other specialized agents on related tasks such as architecture, security, code review, and documentation.

## packages/opencode/src/session/message-v2.ts

### Dependencies
- `@opencode-ai/core/event` — EventV2
- `@opencode-ai/core/v1/session` — SessionV1, types (APIError, AbortedError, Assistant, AuthError, CompactionPart, ContextOverflowError, Info, OutputLengthError, Part, StructuredOutputError, SubtaskPart, User, WithParts, ToolPart)
- `@opencode-ai/core/util/error` — NamedError
- `@opencode-ai/core/database/database` — Database
- `@opencode-ai/core/effect/layer-node` — LayerNode
- `@opencode-ai/core/session/sql` — MessageTable, PartTable, SessionTable
- `@opencode-ai/core/provider` — ProviderV2
- `./schema` — SessionID, MessageID, PartID
- `@/storage/storage` — NotFoundError
- `@/provider/error` — ProviderError
- `@/provider/provider` — Provider
- `@/util/iife` — iife
- `@/util/error` — errorMessage
- `@/util/media` — isMedia
- `ai` — APICallError, convertToModelMessages, LoadAPIKeyError, ModelMessage, UIMessage
- `drizzle-orm` — and, desc, eq, inArray, lt, or
- `effect` — Effect, Schema
- `bun` — SystemError type

### Classes
- `FetchDecompressionError` (interface) — Error shape for Bun's fetch() when gzip/br decompression fails mid-stream

### Functions
- `truncateToolOutput(text, maxChars?)` — Truncates tool output text with omitted chars notice
- `supportsMediaInToolResult(attachment)` — Checks if the model/provider supports media in tool results
- `toModelOutput(options)` — Converts tool output into text/content/json format for the AI SDK
- `toModelMessagesEffect(input, model, options?)` — Core Effect.gen that converts internal messages to AI SDK ModelMessage format, handling media extraction, tool output formatting, reasoning, and compaction
- `toModelMessages(input, model, options?)` — Synchronous wrapper that runs `toModelMessagesEffect`
- `page(input)` — Paginates messages for a session with cursor-based pagination (limit, before cursor)
- `stream(sessionID)` — Streams all messages for a session by repeatedly calling `page`
- `parts(messageID)` — Retrieves all parts for a given message
- `get(input)` — Retrieves a single message with its parts by sessionID + messageID
- `filterCompacted(msgs)` — Filters and reorders compacted messages for model consumption; handles truncate and summary compaction strategies. Returns a combination of tail messages (before compaction) and continuation messages (after compaction) so no messages are lost.
- `filterCompactedEffect(sessionID)` — Effect wrapper for `filterCompacted`
- `latest(msgs)` — Derives the latest user, assistant, finished assistant, and pending tasks from message array
- `fromError(e, ctx)` — Converts various error types (AbortError, OutputLengthError, API errors, connection errors, etc.) into structured typed error objects
- `cursor.encode/decode` — Base64url encode/decode for pagination cursors

### Environment Variables
- None

### Connections
- `@opencode-ai/core` packages for events, sessions, database, provider, and SQL schema
- `@/storage/storage` — NotFoundError for session/message lookups
- `@/provider/error` and `@/provider/provider` — Provider error classification and model definitions
- `@/util/iife`, `@/util/error`, `@/util/media` — Internal utilities
- Drizzle ORM — Database queries on MessageTable, PartTable, SessionTable
- Effect-TS — Functional effect composition (Effect.gen, Schema, LayerNode)
- AI SDK (`ai`) — Message format conversion and API error types

### Summary
Core message handling module for OpenCode's V2 session system. Manages the full lifecycle of session messages: converting between internal storage format and AI SDK model message format (with support for media, tool output, reasoning, and compaction), paginating and streaming messages from the database, filtering and reordering compacted message sequences for coherent model consumption, and normalizing various error types (API errors, connection errors, provider errors, decompression errors) into structured typed error objects. The module is built on Effect-TS for functional composition and uses Drizzle ORM for all database operations.

**Fixed (line 577):** In `filterCompacted`, the `isTruncate` branch — changed from a single `result.slice(tailIndex, compactionIndex)` to a combination of `result.slice(tailIndex, compactionIndex)` and `result.slice(compactionIndex + 1)`. This ensures continuation messages posted after the compaction message are preserved and not lost.

## packages/opencode/src/session/compaction.ts

### Dependencies
- `@opencode-ai/core/effect/layer-node` — LayerNode
- `@opencode-ai/core/v1/session` — SessionV1
- `@opencode-ai/core/v1/config/config` — ConfigV1
- `./session` — Session
- `./schema` — SessionID, MessageID, PartID
- `@/provider/provider` — Provider (including `Provider.Model` type for `FAKE_MODEL`)
- `./message-v2` — MessageV2
- `@/util/token` — Token
- `./processor` — SessionProcessor
- `@/agent/agent` — Agent
- `@/plugin` — Plugin
- `@/config/config` — Config
- `@/storage/storage` — NotFoundError
- `effect` — Effect, Layer, Context
- `effect/DateTime` — DateTime
- `@/effect/instance-state` — InstanceState
- `./overflow` — isOverflow (as overflow), usable
- `@opencode-ai/core/effect/service-use` — serviceUse
- `@/effect/runtime-flags` — RuntimeFlags
- `@/event-v2-bridge` — EventV2Bridge
- `@opencode-ai/core/session/event` — SessionEvent
- `@opencode-ai/core/session/message` — SessionMessage
- `@opencode-ai/core/provider` — ProviderV2
- `@opencode-ai/core/model` — ModelV2
- `@opencode-ai/core/event` — EventV2
- `@opencode-ai/core/session/compaction` — buildPrompt, buildPromptCoD
- `../agent/prompt/compaction-cod.txt` — PROMPT_COMPACTION_COD (raw text import)

### Classes
- `Service` (extends `Context.Service`) — Effect service class tagged as `@opencode/SessionCompaction`, exposes the compaction interface

### Constants
- `PRUNE_MINIMUM` — Minimum token threshold (20k) for pruning to be effective
- `PRUNE_PROTECT` — Token reserve (40k) to protect recent tool output from pruning
- `TOOL_OUTPUT_MAX_CHARS` — Max chars (2k) for tool output in compaction context
- `PRUNE_PROTECTED_TOOLS` — Tool names excluded from pruning (e.g., `"skill"`)
- `DEFAULT_TAIL_TURNS` — Default number of recent turns to preserve (2)
- `MIN_PRESERVE_RECENT_TOKENS` / `MAX_PRESERVE_RECENT_TOKENS` — Clamp values for preserve budget (2k–8k)
- `FAKE_MODEL` — Synthetic `Provider.Model` object with a 999,999,999 context limit (`output: 0`) and full `api` stub (`npm`, `id`, `url`), used in `truncate()` to avoid runtime errors when accessing `model.api.npm` or `model.limit.output`

### Functions (Exported Interface)
- `isOverflow(input)` — Checks if token usage exceeds model context limit (delegates to `./overflow`)
- `prune(input)` — Goes backwards through tool parts, erases output of old tool calls when there are enough prune-protected tokens, frees context space without LLM call
- `process(input)` — Main compaction pipeline: resolves compaction parent, handles overflow replay, dispatches to truncate or LLM-based strategies, manages assistant message creation, processor lifecycle, event publishing, and auto-continuation
- `create(input)` — Creates a compaction marker message with a `CompactionPart` in the session

### Internal Functions
- `summaryText(message)` — Extracts concatenated text content from message parts, stripping empty blocks
- `completedCompactions(messages)` — Scans messages for completed user-assistant compaction pairs
- `preserveRecentBudget(input)` — Calculates token budget for preserving recent conversation turns (default: 25% of usable context, clamped to 2k–8k)
- `turns(messages)` — Splits messages into user turn ranges, excluding compaction messages
- `splitTurn(input)` — Splits a single turn at a budget boundary by token-estimating slices from the end
- `estimate(input)` — Estimates token count by converting messages to model format and JSON-stringifying
- `select(input)` — Selects the head (compaction region) and optional tail_start_id by fitting recent turns into preserve budget
- `truncate(input)` — Truncates messages by percentage (cuts early messages), returns tail_start_id of the first kept user message

### Environment Variables
- None

### Connections
- `Session` service — message/part CRUD operations (create, update, query)
- `Provider` service — model resolution by providerID/modelID
- `Agent` service — agent config retrieval ("compaction" agent)
- `Plugin` service — hooks: `experimental.session.compacting`, `experimental.chat.messages.transform`, `experimental.compaction.autocontinue`
- `SessionProcessor` service — creates and runs the assistant message processor pipeline
- `EventV2Bridge` — publishes `session.compacted` and `SessionEvent.Compaction.Started/Ended` events
- `Config` service — compaction configuration (strategy, percentages, tail turns, preserve budget)
- `RuntimeFlags` — feature flags (experimentalEventSystem, outputTokenMax)
- `InstanceState` — provides context directory and worktree for assistant message path
- `./overflow` — overflow detection and budget calculation
- `@/storage/storage` — NotFoundError for session queries
- `@opencode-ai/core/session/compaction` — shared buildPrompt / buildPromptCoD functions

### Summary
Core session compaction module for the OpenCode conversation system. Manages context window optimization by compacting or truncating conversation history when the token budget is exceeded. Supports three strategies: **original** (LLM-based summarization), **cod** (Chain-of-Density summarization), and **truncate** (percentage-based head cutting without LLM call). The module handles overflow scenarios (replaying the user's last message after compaction), auto-continuation (triggering follow-up assistant responses), and plugin hooks for extensibility. Built entirely on Effect-TS for functional composition, with LayerNode-based dependency injection and Drizzle ORM for persistence.

**Bug fix (lines 375–382):** Fixed infinite loop in the "truncate" strategy when user messages are posted after the compaction message. Changed parent lookup from matching `input.parentID` to searching `input.messages` via `findLast` for the message that actually contains a `CompactionPart`. This ensures `compactionPart` is always resolved correctly, so `tail_start_id` gets persisted and the truncation loop terminates.

**Bug fix (lines 334–352):** Fixed infinite compaction loop in the `truncate()` function's guard logic. The accumulation loop counts tokens from ALL messages (user + assistant + tool), so `cutIndex` can point to any role. The old guard (`if (!firstKept || firstKept.info.role !== "user") return { tail_start_id: undefined }`) aborted truncation whenever `cutIndex` landed on a non-user message, causing infinite compaction loops. Replaced with forward-search logic that scans forward from `cutIndex` to find the next user message, only aborting if none is found. Also added edge case guards: early return when `cutIndex <= 0` (no truncation needed) and clamp when `cutIndex >= messages.length`.

**Bug fix (lines 46–51, 317, 326):** Added `FAKE_MODEL` constant to replace `{ limit: { context: 999_999_999 } } as any` in `truncate()`. The `as any` object lacked the `api` property (`npm`, `id`, `url`) that `MessageV2.toModelMessagesEffect()` accesses at runtime, causing `TypeError: Cannot read properties of undefined (reading 'npm')`. The typed `FAKE_MODEL` provides all required fields (`limit.context`, `limit.output`, `api`, `providerID`, `id`) with empty defaults to prevent this crash.
