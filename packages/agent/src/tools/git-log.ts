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

export function createGitLogTool(workspaceRoot: string) {
  return tool(
    async ({ max_count: maxCount }) => {
      try {
        const cwd = resolveWorkspacePath(workspaceRoot, ".");
        if (!(await pathExists(resolveWorkspacePath(workspaceRoot, ".git")))) {
          return "No .git directory in workspace — git_log unavailable.";
        }
        const n = maxCount ?? 10;
        const result = await runGit(cwd, [
          "log",
          `-n${n}`,
          "--oneline",
          "--decorate",
        ]);
        const body = result.stdout.trim() || "(no commits)";
        return truncate(
          [`exit_code: ${result.code}`, body, result.stderr]
            .filter(Boolean)
            .join("\n\n"),
        );
      } catch (err) {
        return `Error running git_log: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "git_log",
      description: "Show recent git commits (oneline) for the workspace.",
      schema: z.object({
        max_count: z
          .number()
          .nullable()
          .describe("Number of commits to show (default 10)"),
      }),
    },
  );
}

/** @deprecated use createGitLogTool */
export const gitLogTool = null;
