# AI Engineering Copilot — Tutorial Blog

A step-by-step learning guide for this project.  
Written for **freshers** who want a real technical grasp of LangChain → RAG → tool-calling agents.

**How to use this doc:** read top to bottom once. When we finish a new phase, we append a new chapter here.

**Related visuals**

- Flow diagrams also live in the root **[README.md](../README.md)** (Mermaid — renders on GitHub)
- [Learning map (HTML)](./learning-flow.html) — expandable explanations (local browser)
- [Flow diagrams (HTML)](./flow-diagram.html) — flowchart shapes (local browser)

---

## Table of contents

1. [What we are building](#1-what-we-are-building)
2. [Project setup & mental model](#2-project-setup--mental-model)
3. [Chapter A — Phase 1: Chains & structured output](#3-chapter-a--phase-1-chains--structured-output)
4. [Chapter B — Phase 2: RAG over a codebase](#4-chapter-b--phase-2-rag-over-a-codebase)
5. [Chapter C — Phase 3: Tools & the agent loop](#5-chapter-c--phase-3-tools--the-agent-loop)
6. [How the three phases connect](#6-how-the-three-phases-connect)
7. [Glossary](#7-glossary)
8. [Try it yourself](#8-try-it-yourself)
9. [What’s next](#9-whats-next)
10. [Maintainer notes](#10-maintainer-notes)

---

## 1. What we are building

We are building a **mini Cursor-style coding agent**: something that can look at a NestJS (or any) project, find bugs/performance issues, and later propose fixes with human approval.

We do **not** build that in one jump. We grow capability phase by phase:

| Phase | Capability | Status |
|------:|------------|--------|
| 1 | Analyze a code **string** with an LLM chain | Done |
| 2 | Analyze a **folder** using RAG | Done |
| 3 | Let the LLM **choose tools** in a loop | Done |
| 4 | Trace everything in LangSmith | Planned |
| 5–7 | Rebuild orchestration with LangGraph + HITL | Planned |
| 8–10 | Multi-agent, evals, production UI/API | Planned |

**Important distinction (learn this early):**

- **Chain** = fixed pipeline you designed (`A → B → C`)
- **RAG** = find relevant text first, then run a chain
- **Agent** = model decides the next action (often by calling tools)

Phase 1–2 are mostly chains (+ RAG). Phase 3 is the first real agent behavior.

---

## 2. Project setup & mental model

### Monorepo layout (what matters now)

```text
ai-engineering-copilot/
├── packages/
│   ├── agent/     ← all AI logic lives here (plain TypeScript)
│   ├── config/    ← ENV (OPENAI_API_KEY, etc.)
│   ├── shared/    ← shared types
│   └── evals/     ← later (Phase 9)
├── apps/
│   ├── api/       ← NestJS shell (later)
│   └── web/       ← Next.js UI (later)
└── workspace/
    └── fixtures/  ← sample buggy projects to analyze
```

**Design rule:** `packages/agent` stays free of Nest decorators so LangGraph Studio can load it later.

### Config

Root `.env` (from `.env.example`) holds secrets.  
`@aec/config` loads that file and exports `ENV`.

```ts
import { ENV } from "@aec/config";
// ENV.OPENAI_API_KEY
```

### Where demos live

| Command | Script |
|---------|--------|
| `npm run phase1` | `packages/agent/src/scripts/run-phase1.ts` |
| `npm run phase2` | `packages/agent/src/scripts/run-phase2.ts` |
| `npm run phase3` | `packages/agent/src/scripts/run-phase3.ts` |

---

## 3. Chapter A — Phase 1: Chains & structured output

### Goal

Take a NestJS code snippet and get:

1. A plain-English **summary**, and  
2. A **typed JSON analysis** (language, issues, severity, …)

### Flow

```text
code string
  → ChatPromptTemplate
  → ChatOpenAI
  → either text  OR  Zod-structured JSON
```

### Concept: Chat model

A **chat model** is the LLM API wrapper. We create it once:

`packages/agent/src/models/chat-model.ts`

- Uses `@langchain/openai` → `ChatOpenAI`
- Reads `ENV.OPENAI_API_KEY`
- `temperature: 0` for more deterministic analysis

### Concept: Messages & prompts

LLMs don’t just take a raw string in production apps. They take **messages**:

- **System** — role / rules  
- **Human** — the user request  
- **AI** — model replies (later also tool calls)

`ChatPromptTemplate` is a recipe with holes like `{code}` that get filled at runtime.

Files:

- `prompts/system.ts`
- `prompts/analyzer.ts`
- `prompts/summarize.ts`

### Concept: LCEL (LangChain Expression Language)

LCEL means: compose steps with `.pipe()`.

```ts
const chain = analyzerPrompt.pipe(model);
await chain.invoke({ code: source });
```

Every piece is a **Runnable** with the same verbs: `.invoke()`, `.stream()`, `.batch()`.

This is why Phase 1 feels clean: prompt and model speak the same interface.

### Concept: Structured output + Zod

Free-form text is hard for programs to use.  
**Structured output** forces the model to return JSON matching a schema.

We define the contract with **Zod** in `schemas/analysis.schema.ts`:

- `language`, `framework`, `architecture`
- `issues[]` with `severity`, `category`, `summary`, `evidence`
- `summary`

Then:

```ts
model.withStructuredOutput(analysisSchema)
```

LangChain turns that Zod schema into a JSON schema OpenAI understands.

**Gotcha we hit in practice:** OpenAI structured output wants every property listed as required. Use `.nullable()`, not `.optional()`.

### Concept: Two chains, one model factory

| Chain | File | Output |
|-------|------|--------|
| `summarizeChain` | `chains/summarize.chain.ts` | `string` |
| `analyzeChain` | `chains/analyze.chain.ts` | `Analysis` object |

Same model, different prompt + output contract.

### What Phase 1 is *not*

- It does not read your disk  
- It does not search a repo  
- It does not call tools  
- It is **not** an agent yet  

It only knows what you put in `{code}`.

### Fresher takeaway

> Phase 1 teaches the atomic unit of LangChain apps: **prompt → model → (optional) schema**.

---

## 4. Chapter B — Phase 2: RAG over a codebase

### Goal

User says: *“Analyze this project / why is `/users` slow?”*  
System looks at a **folder**, finds relevant files, then produces a structured project report.

### Flow

```text
repo folder
  → load files as Documents
  → split into chunks
  → embed into vectors
  → store in MemoryVectorStore
  → similaritySearch(question)
  → analyzeProjectChain(context)
  → ProjectAnalysis JSON
```

### Concept: Document

A LangChain `Document` is:

- `pageContent` — the text  
- `metadata` — e.g. `{ source: "src/users/users.controller.ts" }`

Loader: `rag/loader.ts` → `loadRepoDocuments(root)`

It walks the tree, keeps `.ts/.js/.json/.md`, skips `node_modules`, etc.

### Concept: Chunking / text splitting

LLMs and embedding models have size limits. Large files are split into **chunks** with overlap so meaning isn’t cut awkwardly.

`rag/splitter.ts` uses `RecursiveCharacterTextSplitter`.

In our small fixture, 6 files ≈ 6 chunks (nothing huge to split).

### Concept: Embeddings

An **embedding** turns text into a list of numbers (a vector) that capture meaning.

Similar text → nearby vectors.

We use `OpenAIEmbeddings` (`text-embedding-3-small`) in `rag/embeddings.ts`.

This is a **different API** from chat completion.

### Concept: Vector store + similarity search

`MemoryVectorStore` keeps vectors in RAM for the run.

Then:

```text
embed(user question) → find nearest chunks → those chunks become CONTEXT
```

That is the heart of **RAG** (Retrieval-Augmented Generation):

> Don’t send the whole repo to the LLM.  
> Send only the pieces that look relevant.

Orchestrator: `project/analyze-project.ts`

### Concept: Project-level structured output

`projectAnalysisSchema` extends the idea from Phase 1 and adds `dependencies[]`.

The prompt receives both:

- `{request}` — the user question  
- `{context}` — retrieved excerpts with file paths  

### Demo fixture

`workspace/fixtures/slow-users-endpoint`  
A tiny NestJS app where `GET /users` loads profile + orders **inside a loop** (classic N+1 smell).

When Phase 2 works, you should see meta like:

- `documentsLoaded`
- `chunksIndexed`
- `retrievedSources`

…and an analysis naming the N+1 issue.

### Fresher takeaway

> Phase 2 adds **memory of a codebase via search**, then reuses the Phase 1 idea (prompt + model + schema).

---

## 5. Chapter C — Phase 3: Tools & the agent loop

### Goal

User asks a question about a workspace.  
The **model decides** which tools to call (`search_code`, `read_file`, …) until it can answer.

### Flow

```text
question + workspaceRoot
  → bind tools to chat model
  → LLM may return tool_calls
  → execute tools (sandboxed)
  → append ToolMessage results
  → LLM again
  → … until final text answer
```

### Concept: Tool

A **tool** is a function the model is allowed to request, with:

- `name`
- `description` (the model reads this to decide when to use it)
- `schema` (Zod args)

We build tools with `tool()` from `@langchain/core/tools`.

Examples in `packages/agent/src/tools/`:

| Tool | Purpose |
|------|---------|
| `list_files` | Recursive file listing |
| `read_file` | Read a file by relative path |
| `search_code` | Substring search across source |
| `run_tests` | `npm run test` (if available) |
| `run_linter` | `npm run lint` (if available) |
| `git_diff` / `git_log` | Git info if `.git` exists |

### Concept: Sandbox

Tools resolve paths under `workspaceRoot` only (`tools/sandbox.ts`).  
This prevents `../../etc/passwd`-style escapes.

### Concept: Tool calling (`bindTools`)

```ts
const model = createChatModel().bindTools(tools);
```

Now the model can reply with either:

- normal text, or  
- structured **tool_calls** (`name` + `args`)

### Concept: ToolMessage

After you run a tool, you must send the result back as a `ToolMessage` with the matching `tool_call_id`.  
That becomes the model’s “observation” for the next turn.

### Concept: Agent loop

Implemented in `agent/run-coding-agent.ts`:

1. Start with System + Human messages  
2. `model.invoke(messages)`  
3. If `tool_calls` → run tools → push ToolMessages → goto 2  
4. If no tool_calls → that content is the final answer  
5. Safety: `maxIterations` (default 8)

This is the classic **think → act → observe → think** loop.

### What Phase 3 is *not* yet

- Not LangGraph (no explicit graph nodes/edges/checkpoints)  
- Not human-in-the-loop approvals  
- Not multi-agent  

Those come in later phases. Phase 3 is “agent behavior with a simple while-loop.”

### Fresher takeaway

> Phase 3 is when the system stops being a fixed recipe and starts **choosing actions**.

---

## 6. How the three phases connect

```text
Phase 1:  YOU provide context     → LLM answers
Phase 2:  RETRIEVAL provides context → LLM answers
Phase 3:  LLM FETCHES context itself via tools → LLM answers
```

Same underlying skills reused:

- Chat models  
- Prompts / messages  
- Zod structured output (Phases 1–2)  
- Tool schemas (Phase 3)

**Learning ladder**

1. Talk to an LLM reliably (Phase 1)  
2. Ground answers in a repo via RAG (Phase 2)  
3. Let the model navigate the repo interactively (Phase 3)  

---

## 7. Glossary

| Term | Meaning |
|------|---------|
| **LLM** | Large Language Model (e.g. GPT) |
| **Chat model** | LangChain wrapper around a chat LLM API |
| **Prompt template** | Message recipe with variables like `{code}` |
| **LCEL** | Compose runnables with `.pipe()` |
| **Runnable** | Object with `.invoke()` / `.stream()` / `.batch()` |
| **Zod** | Schema library for validation + TypeScript types |
| **Structured output** | Force JSON that matches a schema |
| **Document** | Text + metadata unit in LangChain |
| **Chunk** | Smaller piece of a document |
| **Embedding** | Numeric vector representing meaning |
| **Vector store** | Store/search embeddings |
| **RAG** | Retrieve relevant text, then generate |
| **Tool** | Function the model can request |
| **Tool calling** | Model returns function name + args |
| **ToolMessage** | Tool result fed back into chat history |
| **Agent loop** | Repeated decide → act → observe until done |
| **N+1 query** | Per-item DB/API calls inside a loop (slow) |
| **Sandbox** | Restrict tools to a workspace directory |

---

## 8. Try it yourself

```bash
cp .env.example .env
# set OPENAI_API_KEY

npm install

npm run phase1
npm run phase2
npm run phase3
```

Optional custom Phase 3 run:

```bash
npm run phase3 -- ./workspace/fixtures/slow-users-endpoint "Why is /users slow?"
```

Then open:

- root `README.md` (Mermaid diagrams on GitHub)  
- `docs/learning-flow.html` / `docs/flow-diagram.html` (local browser)  


---

## 9. What’s next

| Phase | You will learn |
|------:|----------------|
| 4 | LangSmith traces, tags, debugging runs |
| 5 | LangGraph nodes/edges instead of a while-loop |
| 6 | State, reducers, checkpoints, retries |
| 7 | Human-in-the-loop interrupts (approve/reject diffs) |
| 8 | Multi-agent supervisor pattern |
| 9 | Datasets + evaluators |
| 10 | NestJS + Next.js production shell |

---

## 10. Maintainer notes

When a new phase ships:

1. Add a new **Chapter** section to this file (copy the Chapter A/B/C style).  
2. Update the status table in §1.  
3. Update §6 connection diagram and §9.  
4. Add Mermaid flows to root `README.md` (so GitHub shows them).  
5. Update `learning-flow.html` / `flow-diagram.html` for local browser.  
6. Document `npm run phaseN` in the root `README.md`.

Keep language **simple + technical**: one concept → why it exists → where it lives in the repo → what a fresher should remember.
