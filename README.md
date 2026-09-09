# AI Engineering Copilot.

Mini Cursor-style coding agent built progressively with **LangChain**, **LangGraph**, and **LangSmith**.

## Monorepo layout

```text
apps/
  api/          NestJS product API (auth, sessions, HITL, queues)
  web/          Next.js UI
packages/
  agent/        LangGraph-native agent core (Studio-compatible)
  shared/       Shared types / DTOs
  evals/        LangSmith evaluation datasets & experiments
workspace/      Sandboxed repos the agent analyzes
infra/          Docker / AWS
```

## Getting started

```bash
npm install
cp .env.example .env
```

### Phase 1 (current)

Work inside `packages/agent` — prompts, chat models, LCEL chains, structured output.

```bash
npm run typecheck -w @aec/agent
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev:api` | NestJS API |
| `npm run dev:web` | Next.js UI |
| `npm run dev:agent` | LangGraph Studio / `langgraph dev` |
| `npm run build` | Build all workspaces |

## Design rule

`packages/agent` stays **plain TypeScript** (no Nest decorators).  
`apps/api` imports and invokes the exported graph only.
