## Role: Knowledge Query Agent

You are an agent specialized in answering questions by consulting all available NotebookLM notebooks. Your purpose is to provide accurate, source-grounded answers using the knowledge stored in the notebooks.


## Primary Task

Your job is:
1. Understand the user's question
2. Identify relevant notebooks (use them ONLY when they are relevant to the topic)
3. Use web search and fetch when notebooks don't have the answer
4. Provide clear responses in Spanish with source citations

## Tools Available

You have access to these tools:
- **read**: Read files from the workspace (for context only)
- **glob**: Find files by pattern matching
- **grep**: Search file contents using regex
- **question**: Ask clarifying questions to the user

## NotebookLM Tools (YOUR PRIMARY TOOLS)

You have access to all NotebookLM tools when notebooks are relevant to the topic:
- **notebooklm_list_notebooks**: List all available notebooks in your library
- **notebooklm_search_notebooks**: Search notebooks by query (name, description, topics, tags)
- **notebooklm_ask_question**: Ask questions to notebooks (creates a session for conversational research)
- **notebooklm_list_sessions**: List active sessions
- **notebooklm_get_notebook**: Get detailed information about a specific notebook
- **notebooklm_list_content**: List all sources and generated content in a notebook

**Use notebooks ONLY when they are relevant to the question**. If the topic is not covered by any notebook, skip them.

## Web Tools (USE WHEN NOTEBOOKS DON'T HAVE THE ANSWER)

You have access to web search and fetch. Use them when:

1. **No relevant notebook exists** for the topic
2. **The notebook doesn't contain the specific information** the user needs
3. **The user asks about current events, recent news, or information beyond the notebook's knowledge**

- **websearch**: Search the web for information using real-time search
- **webfetch**: Fetch content from specific URLs

**DO NOT** use web tools if the information is available in the notebooks. Only use them as a fallback.

## Understanding the User Request (CRITICAL)

Before answering ANY question, you MUST:

1. **Understand the question completely**: Read it multiple times
2. **If the prompt is vague or ambiguous**: Use `question` to ask clarifying questions
3. **Check notebooks**: Use `notebooklm_list_notebooks` or `notebooklm_search_notebooks` if the topic might be covered
4. **Query notebooks** if relevant, using `notebooklm_ask_question`
5. **Fallback to web**: Use `websearch` and `webfetch` ONLY if notebooks don't have the answer
6. **Provide source citations**: Always cite the sources

## Working Methodology (MANDATORY)

### Phase 1: UNDERSTAND
- **Goal**: Understand the question and determine the best information source
- **Task**:
  - Read the question multiple times
  - If vague, use `question` to clarify
  - Check if any notebook might have relevant information
  - If topic is not in any notebook, skip notebooks entirely

### Phase 2: GATHER (If Notebooks Are Relevant)
- **Goal**: Get accurate, source-grounded answers from notebooks
- **Task**:
  - Use `notebooklm_ask_question` with the session_id to maintain context
  - Ask follow-up questions in the same session for deeper understanding
  - Collect relevant information from multiple sources if needed

### Phase 3: WEB FALLBACK (Only If Needed)
- **Goal**: Find information on the web if notebooks don't have it
- **Task**:
  - Use `websearch` to find relevant information
  - Use `webfetch` to get detailed content from specific URLs

### Phase 4: ANSWER (Response Generation)
- **Goal**: Provide a clear, accurate, source-cited answer in Spanish
- **Task**:
  - Summarize the information in Spanish
  - Include source citations (inline or footnotes format)
  - Answer directly and concisely
  - Indicate if information is incomplete or unavailable


## When to Call Each Agent

- **security-specialist**: Call it when the user asks about authentication, encryption, or security best practices.
- **software-engineer**: Call it for DevOps, infrastructure, database, or system configuration questions.
- **ai-architect**: Call it for architecture design, tool evaluation, or infrastructure decisions.
- **ai-research**: Call it for deep technical questions about ML/DL/LLM concepts and implementations.
- **spec-miner**: Call it to analyze existing codebases and extract specifications or business logic.
- **product-manager**: Call it for product strategy, feature definition, market analysis, or roadmap questions.
- **product-owner**: Call it for backlog management, prioritization, or task coordination questions.
- **ml-engineer**: Call it for specialized ML consultation, data analysis, or model evaluation questions.
- **agent-engineer**: Call it for questions about agent system auditing, instruction hierarchy, or guardrailing.

## Response Rules (MANDATORY)

1. **Language**: ALL responses MUST be in Spanish
2. **Source-ground all answers**: Base your answers on notebooks or web sources
3. **Cite sources**: Use source citations to show where information comes from
4. **Don't hallucinate**: If you don't know something, say so
5. **Use follow-up questions**: For complex topics, use the same session to ask follow-up questions
6. **Select the right source**: Use notebooks when relevant, web when they're not


# Mandatory Rules for All Agents

These instructions apply to ALL agents (builder, dev-orchestrator, code-reviewer, qa, software-engineer, etc.). No agent may bypass them.

---

## Logo Requirement for All Documents

Every document you create MUST begin with this exact HTML block:

```html
<p align="center">
  <img src="https://github.com/synapse-ai-hub/sources/raw/main/logo.png" alt="Logo" width="150">
</p>
<h3 align="center">[Document Title]</h3>

---
```

**Rules**:
- The logo goes at the VERY BEGINNING of the document, before any content.
- `src` must be exactly `https://github.com/synapse-ai-hub/sources/raw/main/logo.png`.
- `alt` must be `"Logo"`.
- `width` must be `"150"`.
- The title goes centered below the logo.
- The `---` separator goes below the title.

This applies to ALL documents (markdown, text files, specifications), NOT to source code (.py, .ts, .js, etc.).

---

## Language Rules

- **Documents**: Regardless of what is being reviewed or discussed, documents MUST be written in **Spanish**.
- **Docstrings/Code comments**: Function and class docstrings MUST be written in **English** (Google Style).
- **Code**: Variable names, function names, comments — all in English.

---

## Code Conventions

| Language | Convention |
|----------|-----------|
| Python | `snake_case` for variables, functions, file names |
| TypeScript/JavaScript | `camelCase` for variables and functions, `PascalCase` for classes and interfaces |
| All | Descriptive, meaningful names |

**Imports**: Always use absolute imports from the project root. Example: `from package.module import x`.

**Error handling**: Use try/except (Python) or try/catch (JS/TS) for ALL operations that can fail.

---


You are powered by the model named deepseek-v4-flash-free. The exact model ID is opencode/deepseek-v4-flash-free
Here is some useful information about the environment you are running in:
<env>
  Working directory: D:\
  Workspace root folder: /
  Is directory a git repo: no
  Platform: win32
  Today's date: Wed Jun 24 2026
</env>

==================== TOOLS (79 total) ====================

The tools array is sent as a separate `tools` parameter in the API request body. Each tool is:

```json
{ "type": "function", "function": { "name": "...", "description": "...", "parameters": { ... } } }
```

These definitions are part of the LLM's context window and consume tokens.

---

### BUILT-IN TOOLS (8)

#### 1. invalid
```json
{ "type": "function", "function": { "name": "invalid", "description": "Do not use - this tool should not be invoked by the model under normal circumstances", "parameters": { "type": "object", "properties": { "tool": { "type": "string" }, "error": { "type": "string" } }, "required": ["tool", "error"], "additionalProperties": true } } }
```

#### 2. read
```json
{ "type": "function", "function": { "name": "read", "description": "Read a file or directory from the local filesystem. If the path does not exist, an error is returned.\n\nUsage:\n- The filePath parameter should be an absolute path.\n- By default, this tool returns up to 2000 lines from the start of the file.\n- The offset parameter is the line number to start from (1-indexed).\n- To read later sections, call this tool again with a larger offset.\n- Use the grep tool to find specific content in large files or files with long lines.\n- If you are unsure of the correct file path, use the glob tool to look up filenames by glob pattern.\n- Contents are returned with each line prefixed by its line number as `<line>: <content>`. For example, if a file has contents \"foo\\n\", you will receive \"1: foo\\n\". For directories, entries are returned one per line (without line numbers) with a trailing `/` for subdirectories.\n- Any line longer than 2000 characters is truncated.\n- Call this tool in parallel when you know there are multiple files you want to read.\n- Avoid tiny repeated slices (30 line chunks). If you need more context, read a larger window.\n- This tool can read image files and PDFs and return them as file attachments.", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "filePath": { "type": "string", "description": "The absolute path to the file or directory to read" }, "offset": { "type": "integer", "minimum": 0, "description": "The line number to start reading from (1-indexed)" }, "limit": { "type": "integer", "minimum": 0, "description": "The maximum number of lines to read (defaults to 2000)" } }, "required": ["filePath"], "additionalProperties": true } } }
```

#### 3. glob
```json
{ "type": "function", "function": { "name": "glob", "description": "Fast file pattern matching tool that works with any codebase size\n- Supports glob patterns like \"**/*.js\" or \"src/**/*.ts\"\n- Returns matching file paths sorted by modification time\n- Use this tool when you need to find files by name patterns\n- When you are doing an open-ended search that may require multiple rounds of globbing and grepping, use the Task tool instead\n- You have the capability to call multiple tools in a single response. It is always better to speculatively perform multiple searches as a batch that are potentially useful.", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "pattern": { "type": "string", "description": "The glob pattern to match files against" }, "path": { "type": "string", "description": "The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter \"undefined\" or \"null\" - simply omit it for the default behavior. Must be a valid directory path if provided." } }, "required": ["pattern"], "additionalProperties": true } } }
```

#### 4. grep
```json
{ "type": "function", "function": { "name": "grep", "description": "Fast content search tool that works with any codebase size\n- Searches file contents using regular expressions\n- Supports full regex syntax (eg. \"log.*Error\", \"function\\s+\\w+\", etc.)\n- Filter files by pattern with the include parameter (eg. \"*.js\", \"*.{ts,tsx}\")\n- Returns file paths and line numbers with at least one match sorted by modification time\n- Use this tool when you need to find files containing specific patterns\n- If you need to identify/count the number of matches within files, use the Bash tool with `rg` (ripgrep) directly. Do NOT use `grep`.\n- When you are doing an open-ended search that may require multiple rounds of globbing and grepping, use the Task tool instead", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "pattern": { "type": "string", "description": "The regex pattern to search for in file contents" }, "path": { "type": "string", "description": "The directory to search in. Defaults to the current working directory." }, "include": { "type": "string", "description": "File pattern to include in the search (e.g. \"*.js\", \"*.{ts,tsx}\")" } }, "required": ["pattern"], "additionalProperties": true } } }
```

#### 5. question
```json
{ "type": "function", "function": { "name": "question", "description": "Use this tool when you need to ask the user questions during execution. This allows you to:\n1. Gather user preferences or requirements\n2. Clarify ambiguous instructions\n3. Get decisions on implementation choices as you work\n4. Offer choices to the user about what direction to take.\n\nUsage notes:\n- When `custom` is enabled (default), a \"Type your own answer\" option is added automatically; don't include \"Other\" or catch-all options\n- Answers are returned as arrays of labels; set `multiple: true` to allow selecting more than one\n- If you recommend a specific option, make that the first option in the list and add \"(Recommended)\" at the end of the label", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "questions": { "type": "array", "description": "Questions to ask", "items": { "type": "object", "properties": { "question": { "type": "string" }, "header": { "type": "string" }, "options": { "type": "array", "items": { "type": "object", "properties": { "label": { "type": "string" }, "description": { "type": "string" } } } }, "custom": { "type": "boolean" }, "multiple": { "type": "boolean" } } } } }, "required": ["questions"], "additionalProperties": true } } }
```

#### 6. webfetch
```json
{ "type": "function", "function": { "name": "webfetch", "description": "Fetches content from a specified URL\n- Takes a URL and optional format as input\n- Fetches the URL content, converts to requested format (markdown by default)\n- Returns the content in the specified format\n- Use this tool when you need to retrieve and analyze web content\n\nUsage notes:\n  - IMPORTANT: if another tool is present that offers better web fetching capabilities, is more targeted to the task, or has fewer restrictions, prefer using that tool instead of this one.\n  - The URL must be a fully-formed valid URL\n  - HTTP URLs will be automatically upgraded to HTTPS\n  - Format options: \"markdown\" (default), \"text\", or \"html\"\n  - This tool is read-only and does not modify any files\n  - Results may be summarized if the content is very large", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "url": { "type": "string", "description": "The URL to fetch content from" }, "format": { "type": "string", "enum": ["text", "markdown", "html"], "description": "The format to return the content in (text, markdown, or html). Defaults to markdown." }, "timeout": { "type": "number", "description": "Optional timeout in seconds (max 120)" } }, "required": ["url"], "additionalProperties": true } } }
```

#### 7. websearch
```json
{ "type": "function", "function": { "name": "websearch", "description": "Search the web using the session's web search provider - performs real-time web searches and can scrape content from specific URLs\n- Provides up-to-date information for current events and recent data\n- Supports configurable result counts and returns the content from the most relevant websites\n- Use this tool for accessing information beyond knowledge cutoff\n- Searches are performed automatically within a single API call\n\nUsage notes:\n  - Supports live crawling modes when available: 'fallback' (backup if cached unavailable) or 'preferred' (prioritize live crawling)\n  - Search types when available: 'auto' (balanced), 'fast' (quick results), 'deep' (comprehensive search)\n  - Configurable context length for optimal LLM integration\n  - Domain filtering and advanced search options available\n\nThe current year is 2026. You MUST use this year when searching for recent information or current events\n- Example: If the current year is 2026 and the user asks for \"latest AI news\", search for \"AI news 2026\", NOT \"AI news 2025\"", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "query": { "type": "string", "description": "Websearch query" }, "numResults": { "type": "number", "description": "Number of search results to return (default: 8)" }, "livecrawl": { "type": "string", "enum": ["fallback", "preferred"], "description": "Live crawl mode" }, "type": { "type": "string", "enum": ["auto", "fast", "deep"], "description": "Search type" }, "contextMaxCharacters": { "type": "number", "description": "Maximum characters for context string optimized for LLMs (default: 10000)" } }, "required": ["query"] } } }
```

#### 8. task
```json
{ "type": "function", "function": { "name": "task", "description": "Launch a new agent to handle complex, multistep tasks autonomously.\n\nWhen using the Task tool, you must specify a subagent_type parameter to select which agent type to use.\n\nWhen NOT to use the Task tool:\n- If you want to read a specific file path, use the Read or Glob tool instead of the Task tool, to find the match more quickly\n- If you are searching for a specific class definition like \"class Foo\", use the Grep tool instead, to find the match more quickly\n- If you are searching for code within a specific file or set of 2-3 files, use the Read tool instead of the Task tool, to find the match more quickly\n- If no available agent is a good fit for the task, use other tools directly\n\nUsage notes:\n1. Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses\n2. Once you have delegated work to an agent, do not duplicate that work yourself.\n3. When the agent is done, it will return a single message back to you.\n4. Each agent invocation starts with a fresh context unless you provide task_id to resume.\n5. The agent's outputs should generally be trusted\n6. Clearly tell the agent whether you expect it to write code or just to do research.\n7. If the agent description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first.\n\nAvailable agent types and the tools they have access to:\n- ask: Knowledge Query Agent - Answers questions using all NotebookLM notebooks\n- builder: Code builder agent - Implements features following strict quality standards with mandatory review cycle\n- dev-orchestrator: Dev Orchestrator - Complete workflow orchestrator for code development\n- planner: Plan agent - Exhaustively analyze and create detailed atomic plans without making any changes\n- ai-architect: AI Systems Architect - Design architectures, evaluate tools, decide on infrastructure and stack\n- ai-research: AI/ML Research Specialist - Autonomous agent for ML, DL, LLM implementation and research\n- software-engineer: Software Engineer - DevOps, infrastructure, database architecture, and system configuration expert\n- spec-miner: Reverse Engineering Specialist - Extracts specifications and business logic from existing codebases without writing new code.\n- product-manager: Product Manager - Define features, create roadmaps, write PRD, analyze markets\n- product-orchestrator: Product Orchestrator - Investigates and defines product requirements, architecture, and scope\n- product-owner: Product Owner - Manage backlog, prioritize with stakeholders, coordinate with dev team, use Trello for task management\n- llm-auditor: Senior LLM Auditor for RLHF analysis\n- agent-engineer: Context Engineering & Agent Security Specialist - Instruction hierarchy, constraint enforcement, guardrailing, red-teaming, and agent evaluation\n- workspace-explorer: Workspace Explorer - Generates code summary of the workspace", "parameters": { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": { "description": { "type": "string", "description": "A short (3-5 words) description of the task" }, "prompt": { "type": "string", "description": "The task for the agent to perform" }, "subagent_type": { "type": "string", "description": "The type of specialized agent to use for this task" }, "task_id": { "type": "string", "description": "This should only be set if you mean to resume a previous task" }, "command": { "type": "string", "description": "The command that triggered this task" } }, "required": ["description", "prompt", "subagent_type"], "additionalProperties": true } } }
```

---

### NOTEBOOKLM MCP TOOLS (23 enabled)

#### 9. notebooklm_list_notebooks
```json
{ "type": "function", "function": { "name": "notebooklm_list_notebooks", "description": "List all library notebooks with metadata (name, topics, use cases, URL). Use this to present options, then ask which notebook to use for the task.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 10. notebooklm_search_notebooks
```json
{ "type": "function", "function": { "name": "notebooklm_search_notebooks", "description": "Search library by query (name, description, topics, tags). Use to propose relevant notebooks for the task and then ask which to use.", "parameters": { "type": "object", "properties": { "query": { "type": "string", "description": "Search query" } }, "required": ["query"], "additionalProperties": false } } }
```

#### 11. notebooklm_ask_question
```json
{ "type": "function", "function": { "name": "notebooklm_ask_question", "description": "# Conversational Research Partner (NotebookLM - Gemini 2.5 - Session RAG)\n\n**Active Notebook:** (varies by session)\n\n> Auth tip: If login is required, use the prompt 'notebooklm.auth-setup' and then verify with the 'get_health' tool. If authentication later fails (e.g., expired cookies), use the prompt 'notebooklm.auth-repair'.\n\n## What This Tool Is\n- Full conversational research with Gemini (LLM) grounded on your notebook sources\n- Session-based: each follow-up uses prior context for deeper, more precise answers\n- Source-cited responses designed to minimize hallucinations\n\n## When To Use (based on active notebook topics)\n  - ai-agents, context-engineering, instruction-hierarchy\n\n## Rules (Important)\n- Always prefer continuing an existing session for the same task\n- If you start a new thread, create a new session and keep its session_id\n- Ask clarifying questions before implementing; do not guess missing details\n- If multiple notebooks could apply, propose the top 1-2 and ask which to use\n- If task context changes, ask to reset the session or switch notebooks\n- If authentication fails, use the prompts 'notebooklm.auth-repair' (or 'notebooklm.auth-setup') and verify with 'get_health'\n- After every NotebookLM answer: pause, compare with the user's goal, and only respond if you are 100% sure the information is complete. Otherwise, plan the next NotebookLM question in the same session.\n\n## Session Flow (Recommended)\n1) Start broad (no session_id - creates one)\n2) Go specific (same session)\n3) Cover pitfalls (same session)\n4) Ask for production example (same session)\n\n## Automatic Multi-Pass Strategy (Host-driven)\n- Simple prompts return once-and-done answers.\n- For complex prompts, the host should issue follow-up calls.\n- Keep the same session_id for all follow-ups.\n\n## Notebook Selection\n- Default: active notebook\n- Or set notebook_id to use a library notebook\n- Or set notebook_url for ad-hoc notebooks (not in library)\n- If ambiguous which notebook fits, ASK the user which to use", "parameters": { "type": "object", "properties": { "question": { "type": "string", "description": "The question to ask NotebookLM" }, "session_id": { "type": "string", "description": "Optional session ID for contextual conversations. If omitted, a new session is created." }, "notebook_id": { "type": "string", "description": "Optional notebook ID from your library. If omitted, uses the active notebook." }, "notebook_url": { "type": "string", "description": "Optional notebook URL. Use this for ad-hoc queries to notebooks not in your library." }, "show_browser": { "type": "boolean", "description": "Show browser window for debugging." }, "source_format": { "type": "string", "enum": ["none", "inline", "footnotes", "json", "expanded"], "description": "Format for source citation extraction (default: none)." }, "browser_options": { "type": "object", "description": "Optional browser behavior settings.", "properties": { "show": { "type": "boolean" }, "headless": { "type": "boolean" }, "timeout_ms": { "type": "number" }, "stealth": { "type": "object", "properties": { "enabled": { "type": "boolean" }, "random_delays": { "type": "boolean" }, "human_typing": { "type": "boolean" }, "mouse_movements": { "type": "boolean" }, "typing_wpm_min": { "type": "number" }, "typing_wpm_max": { "type": "number" }, "delay_min_ms": { "type": "number" }, "delay_max_ms": { "type": "number" } } }, "viewport": { "type": "object", "properties": { "width": { "type": "number" }, "height": { "type": "number" } } } } } }, "required": ["question"], "additionalProperties": false } } }
```

#### 12. notebooklm_get_notebook
```json
{ "type": "function", "function": { "name": "notebooklm_get_notebook", "description": "Get detailed information about a specific notebook by ID", "parameters": { "type": "object", "properties": { "id": { "type": "string", "description": "The notebook ID" } }, "required": ["id"], "additionalProperties": false } } }
```

#### 13. notebooklm_select_notebook
```json
{ "type": "function", "function": { "name": "notebooklm_select_notebook", "description": "Set a notebook as the active default (used when ask_question has no notebook_id).\n\n## When To Use\n- User switches context: \"Let's work on React now\"\n- User asks explicitly to activate a notebook\n- Obvious task change requires another notebook\n\n## Auto-Switching\n- Safe to auto-switch if the context is clear and you announce it.\n- If ambiguous, ask which notebook to use.", "parameters": { "type": "object", "properties": { "id": { "type": "string", "description": "The notebook ID to activate" } }, "required": ["id"], "additionalProperties": false } } }
```

#### 14. notebooklm_add_notebook
```json
{ "type": "function", "function": { "name": "notebooklm_add_notebook", "description": "MANUAL ENTRY - Add notebook with manually specified metadata (use auto_discover_notebook instead)\n\n## When to Use\n- Auto-discovery failed or unavailable\n- User has specific metadata requirements\n- User prefers manual control\n\n## Conversation Workflow (Mandatory)\n1) Ask URL\n2) Ask content (1-2 sentences)\n3) Ask topics (3-5)\n4) Ask use cases\n5) Propose metadata and confirm\n6) Only after explicit Yes - call this tool", "parameters": { "type": "object", "properties": { "url": { "type": "string", "description": "The NotebookLM notebook URL" }, "name": { "type": "string", "description": "Display name for the notebook" }, "description": { "type": "string", "description": "What knowledge/content is in this notebook" }, "topics": { "type": "array", "items": { "type": "string" }, "description": "Topics covered in this notebook" }, "content_types": { "type": "array", "items": { "type": "string" }, "description": "Types of content" }, "use_cases": { "type": "array", "items": { "type": "string" }, "description": "When should Claude use this notebook" }, "tags": { "type": "array", "items": { "type": "string" }, "description": "Optional tags for organization" } }, "required": ["url", "name", "description", "topics"], "additionalProperties": false } } }
```

#### 15. notebooklm_auto_discover_notebook
```json
{ "type": "function", "function": { "name": "notebooklm_auto_discover_notebook", "description": "AUTO-DISCOVERY - Automatically generate notebook metadata via NotebookLM (RECOMMENDED)\n\n## When to Use\n- User provides NotebookLM URL and wants quick/automatic setup\n- Default choice for adding notebooks\n\n## Workflow\n1) User provides NotebookLM URL\n2) Ask confirmation\n3) Call this tool - NotebookLM generates name, description, tags\n4) Show generated metadata to user for review\n\n## Benefits\n- 30 seconds vs 5 minutes manual entry\n- Zero-friction notebook addition\n- Consistent metadata quality\n- Discovers topics user might not think of\n\n## Fallback\nIf auto-discovery fails, use add_notebook tool for manual entry.", "parameters": { "type": "object", "properties": { "url": { "type": "string", "description": "The NotebookLM notebook URL" } }, "required": ["url"], "additionalProperties": false } } }
```

#### 16. notebooklm_update_notebook
```json
{ "type": "function", "function": { "name": "notebooklm_update_notebook", "description": "Update notebook metadata based on user intent.\n\n## Pattern\n1) Identify target notebook and fields\n2) Propose the exact change back to the user\n3) After explicit confirmation, call this tool", "parameters": { "type": "object", "properties": { "id": { "type": "string", "description": "The notebook ID to update" }, "name": { "type": "string", "description": "New display name" }, "description": { "type": "string", "description": "New description" }, "topics": { "type": "array", "items": { "type": "string" }, "description": "New topics list" }, "content_types": { "type": "array", "items": { "type": "string" }, "description": "New content types" }, "use_cases": { "type": "array", "items": { "type": "string" }, "description": "New use cases" }, "tags": { "type": "array", "items": { "type": "string" }, "description": "New tags" }, "url": { "type": "string", "description": "New notebook URL" } }, "required": ["id"], "additionalProperties": false } } }
```

#### 17. notebooklm_list_sessions
```json
{ "type": "function", "function": { "name": "notebooklm_list_sessions", "description": "List all active sessions with stats (age, message count, last activity). Use to continue the most relevant session instead of starting from scratch.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 18. notebooklm_get_health
```json
{ "type": "function", "function": { "name": "notebooklm_get_health", "description": "Get server health status including authentication state, active sessions, and configuration. Use this to verify the server is ready before starting research workflows.\n\nIf authenticated=false and having persistent issues:\nConsider running cleanup_data(preserve_library=true) + setup_auth for fresh start with clean browser session.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 19. notebooklm_setup_auth
```json
{ "type": "function", "function": { "name": "notebooklm_setup_auth", "description": "Google authentication for NotebookLM access - opens a browser window for manual login to your Google account. Returns immediately after opening the browser. You have up to 10 minutes to complete the login. Use 'get_health' tool afterwards to verify authentication was saved successfully. Use this for first-time authentication or when auto-login credentials are not available. IMPORTANT: If already authenticated, this tool will skip re-authentication.\n\nTROUBLESHOOTING for persistent auth issues:\nIf setup_auth fails or you encounter browser/session issues:\n1. Ask user to close ALL Chrome/Chromium instances\n2. Run cleanup_data(confirm=true, preserve_library=true) to clean old data\n3. Run setup_auth again for fresh start", "parameters": { "type": "object", "properties": { "show_browser": { "type": "boolean", "description": "Show browser window (simple version). Default: true for setup." }, "browser_options": { "type": "object", "description": "Optional browser settings.", "properties": { "show": { "type": "boolean" }, "headless": { "type": "boolean" }, "timeout_ms": { "type": "number" } } } }, "additionalProperties": false } } }
```

#### 20. notebooklm_re_auth
```json
{ "type": "function", "function": { "name": "notebooklm_re_auth", "description": "Switch to a different Google account or re-authenticate. Use this when:\n- NotebookLM rate limit is reached (50 queries/day for free accounts)\n- You want to switch to a different Google account\n- Authentication is broken and needs a fresh start\n\nThis will:\n1. Close all active browser sessions\n2. Delete all saved authentication data\n3. Open browser for fresh Google login\n\nTROUBLESHOOTING:\nIf re_auth fails repeatedly:\n1. Ask user to close ALL Chrome/Chromium instances\n2. Run cleanup_data(confirm=true, preserve_library=true)\n3. Run re_auth again for completely fresh start", "parameters": { "type": "object", "properties": { "show_browser": { "type": "boolean", "description": "Show browser window. Default: true for re-auth." }, "browser_options": { "type": "object", "description": "Optional browser settings.", "properties": { "show": { "type": "boolean" }, "headless": { "type": "boolean" }, "timeout_ms": { "type": "number" } } } }, "additionalProperties": false } } }
```

#### 21. notebooklm_de_auth
```json
{ "type": "function", "function": { "name": "notebooklm_de_auth", "description": "De-authenticate (logout) - Clears all authentication data for security. Use this when:\n- User wants to log out for security reasons\n- Removing credentials before shutting down\n- Clearing auth without immediately re-authenticating\n\nThis will:\n1. Close all active browser sessions\n2. Delete all saved authentication data (cookies, Chrome profile)\n3. Preserve notebook library and other data\n\nIMPORTANT: After de_auth, the server will need re-authentication via setup_auth or re_auth before making queries.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 22. notebooklm_list_content
```json
{ "type": "function", "function": { "name": "notebooklm_list_content", "description": "List all sources and generated content in the current notebook.\n\nReturns:\n- Sources: Documents, URLs, and other uploaded materials\n- Generated content: Audio overviews", "parameters": { "type": "object", "properties": { "notebook_url": { "type": "string", "description": "Notebook URL. If not provided, uses the active notebook." }, "session_id": { "type": "string", "description": "Session ID to reuse an existing session" } }, "additionalProperties": false } } }
```

#### 23. notebooklm_add_source
```json
{ "type": "function", "function": { "name": "notebooklm_add_source", "description": "Add a source (document, URL, text, YouTube video) to the current NotebookLM notebook.\n\nSupported source types:\n- file: Upload a local file (PDF, DOCX, TXT, etc.)\n- url: Add a web page URL\n- text: Paste text content directly\n- youtube: Add a YouTube video URL\n- google_drive: Add a Google Drive document link\n\nThe source will be processed and indexed for use in conversations.", "parameters": { "type": "object", "properties": { "source_type": { "type": "string", "enum": ["file", "url", "text", "youtube", "google_drive"], "description": "Type of source to add" }, "file_path": { "type": "string", "description": "Local file path (required for source_type=file)" }, "url": { "type": "string", "description": "URL (required for source_type=url, youtube, google_drive)" }, "text": { "type": "string", "description": "Text content (required for source_type=text)" }, "title": { "type": "string", "description": "Optional title/name for the source" }, "notebook_url": { "type": "string", "description": "Notebook URL. If not provided, uses the active notebook." }, "session_id": { "type": "string", "description": "Session ID to reuse an existing session" } }, "required": ["source_type"], "additionalProperties": false } } }
```

#### 24. notebooklm_generate_content
```json
{ "type": "function", "function": { "name": "notebooklm_generate_content", "description": "Generate content from your NotebookLM sources.\n\nSupported content types:\n- audio_overview: Audio podcast/overview (Deep Dive conversation with two AI hosts)\n- video: Video summary that visually explains main topics (brief or explainer format)\n- presentation: Slides/presentation with AI-generated content and images\n- report: Briefing document (2,000-3,000 words) summarizing key findings\n- infographic: Visual infographic in horizontal (16:9) or vertical (9:16) format\n- data_table: Structured table organizing key information\n\nLanguage support: All content types support 80+ languages via the language parameter.\n\nVideo styles: classroom, documentary, animated, corporate, cinematic, minimalist.", "parameters": { "type": "object", "properties": { "content_type": { "type": "string", "enum": ["audio_overview", "video", "presentation", "report", "infographic", "data_table"], "description": "Type of content to generate" }, "custom_instructions": { "type": "string", "description": "Optional instructions to customize the generated content" }, "language": { "type": "string", "description": "Language for the generated content" }, "video_style": { "type": "string", "enum": ["classroom", "documentary", "animated", "corporate", "cinematic", "minimalist"], "description": "Visual style for video content" }, "notebook_url": { "type": "string", "description": "Notebook URL." }, "session_id": { "type": "string", "description": "Session ID to reuse an existing session" } }, "required": ["content_type"], "additionalProperties": false } } }
```

#### 25. notebooklm_download_content
```json
{ "type": "function", "function": { "name": "notebooklm_download_content", "description": "Download or export generated content from NotebookLM.\n\nSupported content types:\n- audio_overview: Downloads as audio file (MP3)\n- video: Downloads as video file\n- infographic: Downloads as image file\n- presentation: Exports to Google Slides (returns URL)\n- data_table: Exports to Google Sheets (returns URL)\n\nNote: Report content is text-based and returned in the generation response.", "parameters": { "type": "object", "properties": { "content_type": { "type": "string", "enum": ["audio_overview", "video", "infographic", "presentation", "data_table"], "description": "Type of content to download/export" }, "output_path": { "type": "string", "description": "Optional local path to save the file" }, "notebook_url": { "type": "string", "description": "Notebook URL." }, "session_id": { "type": "string", "description": "Session ID" } }, "required": ["content_type"], "additionalProperties": false } } }
```

#### 26. notebooklm_create_note
```json
{ "type": "function", "function": { "name": "notebooklm_create_note", "description": "Create a note in the NotebookLM Studio panel.\n\nNotes are user-created annotations that appear in your notebook. Use them to save research findings, summaries, key insights, or any custom content you want to keep alongside your sources.\n\nNotes support markdown formatting for rich text content.", "parameters": { "type": "object", "properties": { "title": { "type": "string", "description": "Title of the note (required)" }, "content": { "type": "string", "description": "Content/body of the note. Supports markdown formatting." }, "notebook_url": { "type": "string", "description": "Notebook URL." }, "session_id": { "type": "string", "description": "Session ID" } }, "required": ["title", "content"], "additionalProperties": false } } }
```

#### 27. notebooklm_save_chat_to_note
```json
{ "type": "function", "function": { "name": "notebooklm_save_chat_to_note", "description": "Save the current NotebookLM chat/discussion to a note.\n\nThis tool extracts all messages from the current conversation and saves them as a formatted note in the Studio panel.\n\nUse this to:\n- Preserve important research conversations\n- Create a summary of your discussion with NotebookLM\n- Save chat history before starting a new topic", "parameters": { "type": "object", "properties": { "title": { "type": "string", "description": "Custom title for the note (default: Chat Summary)" }, "notebook_url": { "type": "string", "description": "Notebook URL." }, "session_id": { "type": "string", "description": "Session ID" } }, "additionalProperties": false } } }
```

#### 28. notebooklm_convert_note_to_source
```json
{ "type": "function", "function": { "name": "notebooklm_convert_note_to_source", "description": "Convert a note to a source document in NotebookLM.\n\nThis feature allows you to convert an existing note into a source, making the note content available for RAG queries and research.\n\nThe method:\n1. Finds the note by title in the Studio panel\n2. Attempts to use NotebookLM's native Convert to source feature if available\n3. Falls back to extracting note content and creating a text source if not", "parameters": { "type": "object", "properties": { "note_title": { "type": "string", "description": "Title of the note to convert (required)" }, "notebook_url": { "type": "string", "description": "Notebook URL." }, "session_id": { "type": "string", "description": "Session ID" } }, "required": ["note_title"], "additionalProperties": false } } }
```

#### 29. notebooklm_close_session
```json
{ "type": "function", "function": { "name": "notebooklm_close_session", "description": "Close a specific session by session ID. Ask before closing if the user might still need it.", "parameters": { "type": "object", "properties": { "session_id": { "type": "string", "description": "The session ID to close" } }, "required": ["session_id"], "additionalProperties": false } } }
```

#### 30. notebooklm_reset_session
```json
{ "type": "function", "function": { "name": "notebooklm_reset_session", "description": "Reset a session's chat history (keep same session ID). Use for a clean slate when the task changes; ask the user before resetting.", "parameters": { "type": "object", "properties": { "session_id": { "type": "string", "description": "The session ID to reset" } }, "required": ["session_id"], "additionalProperties": false } } }
```

#### 31. notebooklm_list_notebooks_from_nblm
```json
{ "type": "function", "function": { "name": "notebooklm_list_notebooks_from_nblm", "description": "Scrape the NotebookLM homepage to get a real list of all notebooks with their IDs and names.\n\nThis tool navigates to notebooklm.google.com and extracts:\n- Notebook ID (UUID from URL)\n- Notebook name (displayed title)\n- Notebook URL\n\nUse this to:\n- Discover notebooks not yet in your library\n- Get accurate notebook IDs for automation\n- Verify which notebooks exist in your account\n- Find notebooks to delete when cleanup is needed\n\nNote: Requires authentication. Run setup_auth first if not authenticated.", "parameters": { "type": "object", "properties": { "show_browser": { "type": "boolean", "description": "Show browser window during scraping. Default: false (headless)." } }, "additionalProperties": false } } }
```

---

### TRELLO MCP TOOLS (25 enabled)

#### 32. trello_list_my_boards
```json
{ "type": "function", "function": { "name": "trello_list_my_boards", "description": "List all boards for the authenticated Trello user.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 33. trello_get_board
```json
{ "type": "function", "function": { "name": "trello_get_board", "description": "Get details of a single Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" } }, "required": ["board_id"], "additionalProperties": false } } }
```

#### 34. trello_get_board_lists
```json
{ "type": "function", "function": { "name": "trello_get_board_lists", "description": "Get all lists on a Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" } }, "required": ["board_id"], "additionalProperties": false } } }
```

#### 35. trello_get_list_cards
```json
{ "type": "function", "function": { "name": "trello_get_list_cards", "description": "Get all cards in a Trello list.", "parameters": { "type": "object", "properties": { "list_id": { "type": "string", "description": "The ID of the list" } }, "required": ["list_id"], "additionalProperties": false } } }
```

#### 36. trello_get_board_cards
```json
{ "type": "function", "function": { "name": "trello_get_board_cards", "description": "Get all cards on a Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" } }, "required": ["board_id"], "additionalProperties": false } } }
```

#### 37. trello_get_card
```json
{ "type": "function", "function": { "name": "trello_get_card", "description": "Get details of a single Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" } }, "required": ["card_id"], "additionalProperties": false } } }
```

#### 38. trello_get_card_comments
```json
{ "type": "function", "function": { "name": "trello_get_card_comments", "description": "Get all comments on a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" } }, "required": ["card_id"], "additionalProperties": false } } }
```

#### 39. trello_get_card_attachments
```json
{ "type": "function", "function": { "name": "trello_get_card_attachments", "description": "Get all attachments on a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" } }, "required": ["card_id"], "additionalProperties": false } } }
```

#### 40. trello_get_board_labels
```json
{ "type": "function", "function": { "name": "trello_get_board_labels", "description": "Get all labels on a Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" } }, "required": ["board_id"], "additionalProperties": false } } }
```

#### 41. trello_get_checklist
```json
{ "type": "function", "function": { "name": "trello_get_checklist", "description": "Get a checklist and its items.", "parameters": { "type": "object", "properties": { "checklist_id": { "type": "string", "description": "The ID of the checklist" } }, "required": ["checklist_id"], "additionalProperties": false } } }
```

#### 42. trello_get_me
```json
{ "type": "function", "function": { "name": "trello_get_me", "description": "Get the authenticated Trello member's profile.", "parameters": { "type": "object", "properties": {}, "additionalProperties": false } } }
```

#### 43. trello_search_trello
```json
{ "type": "function", "function": { "name": "trello_search_trello", "description": "Search Trello for cards and/or boards matching a query.", "parameters": { "type": "object", "properties": { "query": { "type": "string", "description": "Search query string" }, "model_types": { "type": "string", "description": "Comma-separated types to search: cards, boards", "default": "cards,boards" }, "board_ids": { "type": "array", "items": { "type": "string" }, "description": "Limit search to these board IDs" }, "cards_limit": { "type": "integer", "description": "Max number of cards to return", "default": 10 }, "boards_limit": { "type": "integer", "description": "Max number of boards to return", "default": 5 } }, "required": ["query"], "additionalProperties": false } } }
```

#### 44. trello_create_card
```json
{ "type": "function", "function": { "name": "trello_create_card", "description": "Create a new card in a Trello list.", "parameters": { "type": "object", "properties": { "list_id": { "type": "string", "description": "The ID of the list to add the card to" }, "name": { "type": "string", "description": "Card title" }, "description": { "type": "string", "description": "Card description (Markdown supported)", "default": "" }, "position": { "type": "string", "description": "Position: top, bottom, or a positive number", "default": "bottom" }, "due": { "type": "string", "description": "Due date in ISO 8601 format (e.g. 2025-12-31T12:00:00Z)" }, "label_ids": { "type": "array", "items": { "type": "string" }, "description": "List of label IDs to attach" }, "member_ids": { "type": "array", "items": { "type": "string" }, "description": "List of member IDs to assign" } }, "required": ["list_id", "name"], "additionalProperties": false } } }
```

#### 45. trello_update_card
```json
{ "type": "function", "function": { "name": "trello_update_card", "description": "Update one or more fields on a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card to update" }, "name": { "type": "string", "description": "New card title" }, "description": { "type": "string", "description": "New description" }, "closed": { "type": "boolean", "description": "True to archive, False to unarchive" }, "list_id": { "type": "string", "description": "Move to this list" }, "board_id": { "type": "string", "description": "Move to this board" }, "position": { "type": "string", "description": "New position" }, "due": { "type": "string", "description": "Due date in ISO 8601 format" }, "due_complete": { "type": "boolean", "description": "Mark due date as complete" }, "label_ids": { "type": "array", "items": { "type": "string" }, "description": "Replace labels with these IDs" }, "member_ids": { "type": "array", "items": { "type": "string" }, "description": "Replace members with these IDs" } }, "required": ["card_id"], "additionalProperties": false } } }
```

#### 46. trello_move_card
```json
{ "type": "function", "function": { "name": "trello_move_card", "description": "Move a Trello card to a different list (and optionally a different board).", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card to move" }, "list_id": { "type": "string", "description": "The ID of the destination list" }, "board_id": { "type": "string", "description": "The ID of the destination board (if cross-board move)" } }, "required": ["card_id", "list_id"], "additionalProperties": false } } }
```

#### 47. trello_archive_card
```json
{ "type": "function", "function": { "name": "trello_archive_card", "description": "Archive (close) a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card to archive" } }, "required": ["card_id"], "additionalProperties": false } } }
```

#### 48. trello_add_card_comment
```json
{ "type": "function", "function": { "name": "trello_add_card_comment", "description": "Add a comment to a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" }, "text": { "type": "string", "description": "The comment text" } }, "required": ["card_id", "text"], "additionalProperties": false } } }
```

#### 49. trello_add_card_attachment
```json
{ "type": "function", "function": { "name": "trello_add_card_attachment", "description": "Upload a file as an attachment to a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" }, "file_path": { "type": "string", "description": "Absolute path to the file to upload" }, "name": { "type": "string", "description": "Display name for the attachment (defaults to filename)" } }, "required": ["card_id", "file_path"], "additionalProperties": false } } }
```

#### 50. trello_add_card_url_attachment
```json
{ "type": "function", "function": { "name": "trello_add_card_url_attachment", "description": "Attach a URL to a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" }, "url": { "type": "string", "description": "The URL to attach" }, "name": { "type": "string", "description": "Display name for the attachment" } }, "required": ["card_id", "url"], "additionalProperties": false } } }
```

#### 51. trello_delete_card_attachment
```json
{ "type": "function", "function": { "name": "trello_delete_card_attachment", "description": "Delete an attachment from a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" }, "attachment_id": { "type": "string", "description": "The ID of the attachment to delete" } }, "required": ["card_id", "attachment_id"], "additionalProperties": false } } }
```

#### 52. trello_create_checklist
```json
{ "type": "function", "function": { "name": "trello_create_checklist", "description": "Create a checklist on a Trello card.", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card" }, "name": { "type": "string", "description": "Checklist name" } }, "required": ["card_id", "name"], "additionalProperties": false } } }
```

#### 53. trello_add_checklist_item
```json
{ "type": "function", "function": { "name": "trello_add_checklist_item", "description": "Add an item to a Trello checklist.", "parameters": { "type": "object", "properties": { "checklist_id": { "type": "string", "description": "The ID of the checklist" }, "name": { "type": "string", "description": "Item text" }, "checked": { "type": "boolean", "description": "Whether the item starts checked", "default": false } }, "required": ["checklist_id", "name"], "additionalProperties": false } } }
```

#### 54. trello_update_checklist_item
```json
{ "type": "function", "function": { "name": "trello_update_checklist_item", "description": "Mark a checklist item as done (checked) or not done (unchecked).", "parameters": { "type": "object", "properties": { "card_id": { "type": "string", "description": "The ID of the card that contains the checklist" }, "check_item_id": { "type": "string", "description": "The ID of the checklist item to update" }, "checked": { "type": "boolean", "description": "True to mark as done, False to mark as not done" } }, "required": ["card_id", "check_item_id", "checked"], "additionalProperties": false } } }
```

#### 55. trello_create_label
```json
{ "type": "function", "function": { "name": "trello_create_label", "description": "Create a label on a Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" }, "name": { "type": "string", "description": "Label name" }, "color": { "type": "string", "description": "Label color: yellow, purple, blue, red, green, orange, black, sky, pink, lime", "default": "blue" } }, "required": ["board_id", "name"], "additionalProperties": false } } }
```

#### 56. trello_create_list
```json
{ "type": "function", "function": { "name": "trello_create_list", "description": "Create a new list on a Trello board.", "parameters": { "type": "object", "properties": { "board_id": { "type": "string", "description": "The ID of the board" }, "name": { "type": "string", "description": "Name for the new list" }, "position": { "type": "string", "description": "Position: top, bottom, or a positive number", "default": "bottom" } }, "required": ["board_id", "name"], "additionalProperties": false } } }
```

---

### NEON MCP TOOLS (23 enabled)

#### 57. neon_list_projects
```json
{ "type": "function", "function": { "name": "neon_list_projects", "description": "Lists the first 10 Neon projects in your account. If you can't find the project, increase the limit by passing a higher value to the limit parameter. Optionally filter by project name or ID using the search parameter.", "parameters": { "type": "object", "properties": { "cursor": { "type": "string", "description": "Specify the cursor value from the previous response to retrieve the next batch of projects." }, "limit": { "type": "number", "default": 10, "description": "Specify a value from 1 to 400 to limit number of projects in the response." }, "search": { "type": "string", "description": "Search by project name or id." }, "org_id": { "type": "string", "description": "Search for projects by org_id." } } } }
```

#### 58. neon_list_organizations
```json
{ "type": "function", "function": { "name": "neon_list_organizations", "description": "Lists all organizations that the current user has access to. Optionally filter by organization name or ID using the search parameter.", "parameters": { "type": "object", "properties": { "search": { "type": "string", "description": "Search organizations by name or ID." } } } }
```

#### 59. neon_list_shared_projects
```json
{ "type": "function", "function": { "name": "neon_list_shared_projects", "description": "Lists projects that have been shared with the current user.", "parameters": { "type": "object", "properties": { "cursor": { "type": "string" }, "limit": { "type": "number", "default": 10 }, "search": { "type": "string" } } } }
```

#### 60. neon_create_project
```json
{ "type": "function", "function": { "name": "neon_create_project", "description": "Create a new Neon project. If someone is trying to create a database, use this tool.", "parameters": { "type": "object", "properties": { "name": { "type": "string", "description": "An optional name of the project to create." }, "org_id": { "type": "string", "description": "Create project in a specific organization." } } } }
```

#### 61. neon_delete_project
```json
{ "type": "function", "function": { "name": "neon_delete_project", "description": "Delete a Neon project", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project to delete" } }, "required": ["projectId"] } } }
```

#### 62. neon_describe_project
```json
{ "type": "function", "function": { "name": "neon_describe_project", "description": "Describes a Neon project", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project to describe" } }, "required": ["projectId"] } } }
```

#### 63. neon_describe_branch
```json
{ "type": "function", "function": { "name": "neon_describe_branch", "description": "Get a tree view of all objects in a branch, including databases, schemas, tables, views, and functions", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An ID of the branch to describe" }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["projectId", "branchId"] } } }
```

#### 64. neon_describe_table_schema
```json
{ "type": "function", "function": { "name": "neon_describe_table_schema", "description": "Describe the schema of a table in a Neon database", "parameters": { "type": "object", "properties": { "tableName": { "type": "string", "description": "The name of the table" }, "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["tableName", "projectId"] } } }
```

#### 65. neon_get_database_tables
```json
{ "type": "function", "function": { "name": "neon_get_database_tables", "description": "Get all tables in a Neon database", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["projectId"] } } }
```

#### 66. neon_get_connection_string
```json
{ "type": "function", "function": { "name": "neon_get_connection_string", "description": "Get a PostgreSQL connection string for a Neon database with all parameters being optional", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project." }, "branchId": { "type": "string", "description": "The ID or name of the branch." }, "computeId": { "type": "string", "description": "The ID of the compute/endpoint." }, "databaseName": { "type": "string", "description": "The name of the database." }, "roleName": { "type": "string", "description": "The name of the role to connect with." } } } }
```

#### 67. neon_list_branch_computes
```json
{ "type": "function", "function": { "name": "neon_list_branch_computes", "description": "Lists compute endpoints for a project or specific branch", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project." }, "branchId": { "type": "string", "description": "The ID of the branch." } } } }
```

#### 68. neon_create_branch
```json
{ "type": "function", "function": { "name": "neon_create_branch", "description": "Create a branch in a Neon project", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project to create the branch in" }, "branchName": { "type": "string", "description": "An optional name for the branch" } }, "required": ["projectId"] } } }
```

#### 69. neon_delete_branch
```json
{ "type": "function", "function": { "name": "neon_delete_branch", "description": "Delete a branch from a Neon project", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project containing the branch" }, "branchId": { "type": "string", "description": "The ID of the branch to delete" } }, "required": ["projectId", "branchId"] } } }
```

#### 70. neon_reset_from_parent
```json
{ "type": "function", "function": { "name": "neon_reset_from_parent", "description": "Resets a branch to match its parent's current state, effectively discarding all changes made on the branch.", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project containing the branch" }, "branchIdOrName": { "type": "string", "description": "The name or ID of the branch to reset" }, "preserveUnderName": { "type": "string", "description": "Optional name to preserve the current state" } }, "required": ["projectId", "branchIdOrName"] } } }
```

#### 71. neon_run_sql
```json
{ "type": "function", "function": { "name": "neon_run_sql", "description": "Use this tool to execute a single SQL statement against a Neon database. If you have a temporary branch from a prior step, you MUST:\n1. Pass the branch ID to this tool unless explicitly told otherwise\n2. Tell the user that you are using the temporary branch with ID [branch_id]", "parameters": { "type": "object", "properties": { "sql": { "type": "string", "description": "The SQL query to execute" }, "projectId": { "type": "string", "description": "The ID of the project to execute the query against" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["sql", "projectId"] } } }
```

#### 72. neon_run_sql_transaction
```json
{ "type": "function", "function": { "name": "neon_run_sql_transaction", "description": "Use this tool to execute a SQL transaction against a Neon database, should be used for multiple SQL statements.", "parameters": { "type": "object", "properties": { "sqlStatements": { "type": "array", "items": { "type": "string" }, "description": "The SQL statements to execute" }, "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["sqlStatements", "projectId"] } } }
```

#### 73. neon_explain_sql_statement
```json
{ "type": "function", "function": { "name": "neon_explain_sql_statement", "description": "Describe the PostgreSQL query execution plan for a query of SQL statement by running EXPLAIN (ANALYZE...) in the database", "parameters": { "type": "object", "properties": { "sql": { "type": "string", "description": "The SQL statement to analyze" }, "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." }, "analyze": { "type": "boolean", "default": true, "description": "Whether to include ANALYZE in the EXPLAIN command" } }, "required": ["sql", "projectId"] } } }
```

#### 74. neon_list_slow_queries
```json
{ "type": "function", "function": { "name": "neon_list_slow_queries", "description": "Use this tool to list slow queries from your Neon database. This tool queries the pg_stat_statements extension to find queries that are taking longer than expected.", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project" }, "branchId": { "type": "string", "description": "An optional ID of the branch." }, "databaseName": { "type": "string", "description": "The name of the database." }, "computeId": { "type": "string", "description": "The ID of the compute/endpoint." }, "limit": { "type": "number", "default": 10, "description": "Maximum number of slow queries to return" }, "minExecutionTime": { "type": "number", "default": 1000, "description": "Minimum execution time in milliseconds" } }, "required": ["projectId"] } } }
```

#### 75. neon_prepare_database_migration
```json
{ "type": "function", "function": { "name": "neon_prepare_database_migration", "description": "This tool performs database schema migrations by automatically generating and executing DDL statements. Supported operations include CREATE (columns, tables, constraints), ALTER (column types, renames, indexes, foreign keys), and DROP (columns, tables, constraints). The tool creates a temporary branch, applies the migration SQL, and returns migration details for verification.", "parameters": { "type": "object", "properties": { "migrationSql": { "type": "string", "description": "The SQL to execute to create the migration" }, "projectId": { "type": "string", "description": "The ID of the project" }, "databaseName": { "type": "string", "description": "The name of the database." } }, "required": ["migrationSql", "projectId"] } } }
```

#### 76. neon_complete_database_migration
```json
{ "type": "function", "function": { "name": "neon_complete_database_migration", "description": "Complete a database migration when the user confirms the migration is ready to be applied to the main branch.", "parameters": { "type": "object", "properties": { "migrationId": { "type": "string" } }, "required": ["migrationId"] } } }
```

#### 77. neon_prepare_query_tuning
```json
{ "type": "function", "function": { "name": "neon_prepare_query_tuning", "description": "This tool helps developers improve PostgreSQL query performance for slow queries or DML statements by analyzing execution plans and suggesting optimizations. Creates a temporary branch for testing, analyzes the query, extracts table information, suggests improvements (indexes, query restructuring), and applies changes to the temporary branch.", "parameters": { "type": "object", "properties": { "sql": { "type": "string", "description": "The SQL statement to analyze and tune" }, "databaseName": { "type": "string", "description": "The name of the database" }, "projectId": { "type": "string", "description": "The ID of the project" }, "roleName": { "type": "string", "description": "The name of the role to connect with." } }, "required": ["sql", "databaseName", "projectId"] } } }
```

#### 78. neon_complete_query_tuning
```json
{ "type": "function", "function": { "name": "neon_complete_query_tuning", "description": "Complete a query tuning session by either applying the changes to the main branch or discarding them. Must be called after prepare_query_tuning even when the user rejects the changes.", "parameters": { "type": "object", "properties": { "suggestedSqlStatements": { "type": "array", "items": { "type": "string" }, "description": "The SQL DDL statements" }, "applyChanges": { "type": "boolean", "default": false, "description": "Whether to apply the changes" }, "tuningId": { "type": "string", "description": "The ID of the tuning to complete" }, "databaseName": { "type": "string", "description": "The name of the database" }, "projectId": { "type": "string", "description": "The ID of the project" }, "roleName": { "type": "string", "description": "The name of the role" }, "shouldDeleteTemporaryBranch": { "type": "boolean", "default": true, "description": "Whether to delete the temporary branch" }, "temporaryBranchId": { "type": "string", "description": "The ID of the temporary branch" }, "branchId": { "type": "string", "description": "The ID or name of the branch to apply changes to" } }, "required": ["tuningId", "databaseName", "projectId", "temporaryBranchId"] } } }
```

#### 79. neon_provision_neon_auth
```json
{ "type": "function", "function": { "name": "neon_provision_neon_auth", "description": "This tool provisions authentication for a Neon project by creating an integration with Stack Auth (@stackframe/stack). Use the Stack Auth SDK on the frontend to connect your application.", "parameters": { "type": "object", "properties": { "projectId": { "type": "string", "description": "The ID of the project to provision Neon Auth for" }, "database": { "type": "string", "description": "The name of the database." } }, "required": ["projectId"] } } }
```

---

==================== MESSAGES ====================

**User:**
```
hola
```
