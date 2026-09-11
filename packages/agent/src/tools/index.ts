import type { StructuredToolInterface } from "@langchain/core/tools";
import { createGitDiffTool } from "./git-diff.js";
import { createGitLogTool } from "./git-log.js";
import { createListFilesTool } from "./list-files.js";
import { createReadFileTool } from "./read-file.js";
import { createRunLinterTool } from "./run-linter.js";
import { createRunTestsTool } from "./run-tests.js";
import { createSearchCodeTool } from "./search-code.js";

/**
 * Build the Phase 3 tool set bound to a workspace root (sandbox).
 */
export function createWorkspaceTools(
  workspaceRoot: string,
): StructuredToolInterface[] {
  return [
    createListFilesTool(workspaceRoot),
    createReadFileTool(workspaceRoot),
    createSearchCodeTool(workspaceRoot),
    createRunTestsTool(workspaceRoot),
    createRunLinterTool(workspaceRoot),
    createGitDiffTool(workspaceRoot),
    createGitLogTool(workspaceRoot),
  ];
}

/** @deprecated use createWorkspaceTools */
export const tools = [] as const;

export {
  createListFilesTool,
  createReadFileTool,
  createSearchCodeTool,
  createRunTestsTool,
  createRunLinterTool,
  createGitDiffTool,
  createGitLogTool,
};
