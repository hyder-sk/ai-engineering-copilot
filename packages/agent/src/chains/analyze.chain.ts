import { analyzerPrompt } from "../prompts/analyzer.js";
import { createChatModel } from "../models/chat-model.js";
import {
  analysisSchema,
  type Analysis,
} from "../schemas/analysis.schema.js";

/**
 * Phase 1 LCEL chain: prompt → chat model → structured analysis.
 */
export function buildAnalyzeChain(modelName?: string) {
  const model = createChatModel(modelName).withStructuredOutput(analysisSchema);
  return analyzerPrompt.pipe(model);
}

export async function analyzeChain(input: {
  code: string;
  modelName?: string;
}): Promise<Analysis> {
  const chain = buildAnalyzeChain(input.modelName);
  return chain.invoke({ code: input.code });
}
