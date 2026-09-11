import { summarizePrompt } from "../prompts/summarize.js";
import { createChatModel } from "../models/chat-model.js";

/**
 * Phase 1 LCEL chain: prompt → chat model → plain text summary.
 */
export function buildSummarizeChain(modelName?: string) {
  const model = createChatModel(modelName);
  return summarizePrompt.pipe(model);
}

export async function summarizeChain(input: {
  code: string;
  modelName?: string;
}): Promise<string> {
  const chain = buildSummarizeChain(input.modelName);
  const result = await chain.invoke({ code: input.code });
  return typeof result.content === "string"
    ? result.content
    : JSON.stringify(result.content);
}
