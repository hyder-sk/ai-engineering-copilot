import { projectAnalyzerPrompt } from "../prompts/project-analyzer.js";
import { createChatModel } from "../models/chat-model.js";
import {
  projectAnalysisSchema,
  type ProjectAnalysis,
} from "../schemas/project-analysis.schema.js";

/**
 * Phase 2 LCEL chain: retrieved context → structured project analysis.
 */
export function buildAnalyzeProjectChain(modelName?: string) {
  const model = createChatModel(modelName).withStructuredOutput(
    projectAnalysisSchema,
  );
  return projectAnalyzerPrompt.pipe(model);
}

export async function analyzeProjectChain(input: {
  request: string;
  context: string;
  modelName?: string;
}): Promise<ProjectAnalysis> {
  const chain = buildAnalyzeProjectChain(input.modelName);
  return chain.invoke({
    request: input.request,
    context: input.context,
  });
}
