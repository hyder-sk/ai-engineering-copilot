# Architecture

```text
apps/web → apps/api → packages/agent (LangGraph) → tools / LLM / LangSmith
```

- `packages/agent` is plain TypeScript (LangGraph Studio compatible).
- `apps/api` is a thin NestJS wrapper (HTTP, auth, queues, approvals).
- `apps/web` is the product UI.
- `packages/evals` holds LangSmith datasets and experiments.
