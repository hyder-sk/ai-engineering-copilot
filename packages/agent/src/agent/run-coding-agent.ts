import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createChatModel } from "../models/chat-model.js";
import { createWorkspaceTools } from "../tools/index.js";

const DEFAULT_SYSTEM = `You are an AI Engineering Copilot investigating a local codebase.
Use tools to explore the workspace before answering.
Prefer: list_files / search_code → read_file → conclude with a clear answer.
Cite file paths in your final answer. If a tool fails, try another approach.`;

export interface ToolCallTrace {
  name: string;
  args: unknown;
  resultPreview: string;
}

export interface RunCodingAgentOptions {
  workspaceRoot: string;
  question: string;
  modelName?: string;
  maxIterations?: number;
  systemPrompt?: string;
  tools?: StructuredToolInterface[];
}

export interface RunCodingAgentResult {
  answer: string;
  iterations: number;
  toolCalls: ToolCallTrace[];
  messages: BaseMessage[];
}

function preview(text: string, max = 400): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

/**
 * Phase 3 tool-calling agent loop (no LangGraph yet):
 * LLM → tool_calls → execute tools → ToolMessage → LLM … → final text
 */
export async function runCodingAgent(
  options: RunCodingAgentOptions,
): Promise<RunCodingAgentResult> {
  const tools = options.tools ?? createWorkspaceTools(options.workspaceRoot);
  const toolByName = new Map(tools.map((t) => [t.name, t]));
  const model = createChatModel(options.modelName).bindTools(tools);
  const maxIterations = options.maxIterations ?? 8;

  const messages: BaseMessage[] = [
    new SystemMessage(options.systemPrompt ?? DEFAULT_SYSTEM),
    new HumanMessage(
      `Workspace root: ${options.workspaceRoot}\n\nQuestion: ${options.question}`,
    ),
  ];

  const toolCalls: ToolCallTrace[] = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations += 1;
    const response = await model.invoke(messages);
    messages.push(response);

    const calls = response.tool_calls ?? [];
    if (!calls.length) {
      const answer =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
      return { answer, iterations, toolCalls, messages };
    }

    for (const call of calls) {
      const selected = toolByName.get(call.name);
      let result: string;
      if (!selected) {
        result = `Unknown tool: ${call.name}`;
      } else {
        try {
          const raw = await selected.invoke(call.args);
          result = typeof raw === "string" ? raw : JSON.stringify(raw);
        } catch (err) {
          result = `Tool error: ${err instanceof Error ? err.message : String(err)}`;
        }
      }

      toolCalls.push({
        name: call.name,
        args: call.args,
        resultPreview: preview(result),
      });

      messages.push(
        new ToolMessage({
          content: result,
          tool_call_id: call.id ?? call.name,
        }),
      );
    }
  }

  messages.push(
    new HumanMessage(
      "Stop using tools. Provide your best final answer based on evidence so far.",
    ),
  );
  const finalModel = createChatModel(options.modelName);
  const final = await finalModel.invoke(messages);
  messages.push(final);
  const answer =
    typeof final.content === "string"
      ? final.content
      : JSON.stringify(final.content);

  return { answer, iterations, toolCalls, messages };
}
