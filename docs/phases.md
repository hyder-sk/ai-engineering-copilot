# Phases

| Phase | Focus | Primary location |
|---|---|---|
| 1 | LangChain fundamentals (prompts, LCEL, structured output) | `packages/agent/src/chains`, `prompts`, `schemas` |
| 2 | Code analyzer + RAG (loaders, splitters, embeddings, retrieval) | `packages/agent/src/rag`, `project`, `workspace/fixtures` |
| 3 | Tools + tool-calling agent loop | `packages/agent/src/tools`, `agent/run-coding-agent.ts` |
| 4 | LangSmith | `packages/agent/src/observability` |
| 5–7 | LangGraph, state, HITL | `packages/agent/src/nodes`, `edges`, `state.ts` |
| 8 | Multi-agent | `packages/agent/src/agents` |
| 9 | Evaluation | `packages/evals` |
| 10 | Production | `apps/*`, `infra/*` |
