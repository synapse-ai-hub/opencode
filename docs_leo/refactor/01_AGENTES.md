# Refactor: Reemplazo de Agentes Built-in

## Agentes eliminados
build, plan, general, explore, summary

## Archivos eliminados
```
agent/prompt/explore.txt
agent/prompt/summary.txt
agent/generate.txt
session/prompt/plan.txt
session/prompt/plan-mode.txt
session/prompt/build-switch.txt
session/prompt/plan-reminder-anthropic.txt
```

## Agentes que se quedan
compaction, compaction-cod, title

## Agentes agregados (20)
builder, code-reviewer, dev-orchestrator, ask, agent-engineer, ai-architect,
ai-research, data-analyst, explorer, llm-auditor, ml-engineer, planner,
product-manager, product-orchestrator, product-owner, proposal-generator,
qa, security-specialist, software-engineer, spec-miner, update

## Archivos modificados
- `agent/agent.ts`: imports, definiciones, default agent → "ask", removido generate
- `session/reminders.ts`: simplificado (sin plan/build)
