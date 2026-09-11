import { spawn } from "node:child_process";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { pathExists, resolveWorkspacePath, truncate } from "./sandbox.js";

function runCommand(
  cwd: string,
  command: string,
  args: string[],
  timeoutMs = 60_000,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        code: null,
        stdout,
        stderr: `${stderr}\n[timeout after ${timeoutMs}ms]`.trim(),
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: 1, stdout, stderr: err.message });
    });
  });
}

export function createRunLinterTool(workspaceRoot: string) {
  return tool(
    async () => {
      try {
        const cwd = resolveWorkspacePath(workspaceRoot, ".");
        const pkgPath = resolveWorkspacePath(workspaceRoot, "package.json");
        if (!(await pathExists(pkgPath))) {
          return "No package.json in workspace — cannot run linter.";
        }
        const result = await runCommand(cwd, "npm", ["run", "lint"]);
        return truncate(
          [
            `exit_code: ${result.code}`,
            result.stdout && `stdout:\n${result.stdout}`,
            result.stderr && `stderr:\n${result.stderr}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        );
      } catch (err) {
        return `Error running linter: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "run_linter",
      description: "Run `npm run lint` in the workspace if available.",
      schema: z.object({}),
    },
  );
}

/** @deprecated use createRunLinterTool */
export const runLinterTool = null;
