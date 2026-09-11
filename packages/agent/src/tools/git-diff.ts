import { spawn } from "node:child_process";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { pathExists, resolveWorkspacePath, truncate } from "./sandbox.js";

function runGit(
  cwd: string,
  args: string[],
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    child.on("error", (err) =>
      resolve({ code: 1, stdout, stderr: err.message }),
    );
  });
}

export function createGitDiffTool(workspaceRoot: string) {
  return tool(
    async ({ staged }) => {
      try {
        const cwd = resolveWorkspacePath(workspaceRoot, ".");
        if (!(await pathExists(resolveWorkspacePath(workspaceRoot, ".git")))) {
          return "No .git directory in workspace — git_diff unavailable.";
        }
        const args = staged ? ["diff", "--staged"] : ["diff"];
        const result = await runGit(cwd, args);
        const body = result.stdout.trim() || "(empty diff)";
        return truncate(
          [`exit_code: ${result.code}`, body, result.stderr]
            .filter(Boolean)
            .join("\n\n"),
        );
      } catch (err) {
        return `Error running git_diff: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "git_diff",
      description: "Show git diff for the workspace (optionally staged only).",
      schema: z.object({
        staged: z
          .boolean()
          .nullable()
          .describe("If true, show staged diff only. Default false."),
      }),
    },
  );
}

/** @deprecated use createGitDiffTool */
export const gitDiffTool = null;
