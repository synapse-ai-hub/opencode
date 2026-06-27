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
