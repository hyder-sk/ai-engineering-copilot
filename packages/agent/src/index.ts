export { graph } from "./agent.js";
export type { AgentState } from "./state.js";

export { createChatModel } from "./models/chat-model.js";
export { analyzeChain, buildAnalyzeChain } from "./chains/analyze.chain.js";
export {
  summarizeChain,
  buildSummarizeChain,
} from "./chains/summarize.chain.js";
export {
  analyzeProjectChain,
  buildAnalyzeProjectChain,
} from "./chains/analyze-project.chain.js";
export {
  analyzeProject,
  type AnalyzeProjectOptions,
  type AnalyzeProjectResult,
} from "./project/analyze-project.js";
export {
  runCodingAgent,
  type RunCodingAgentOptions,
  type RunCodingAgentResult,
  type ToolCallTrace,
} from "./agent/run-coding-agent.js";
export {
  createWorkspaceTools,
  createListFilesTool,
  createReadFileTool,
  createSearchCodeTool,
  createRunTestsTool,
  createRunLinterTool,
  createGitDiffTool,
  createGitLogTool,
} from "./tools/index.js";
export {
  analysisSchema,
  analysisIssueSchema,
  type Analysis,
  type AnalysisIssue,
} from "./schemas/analysis.schema.js";
export {
  projectAnalysisSchema,
  type ProjectAnalysis,
} from "./schemas/project-analysis.schema.js";
export {
  loadRepoDocuments,
  splitCodeDocuments,
  buildCodeIndex,
  retrieveCodeChunks,
  createEmbeddings,
} from "./rag/index.js";
