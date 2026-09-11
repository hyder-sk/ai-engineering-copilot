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

export function createRunTestsTool(workspaceRoot: string) {
  return tool(
    async ({ script }) => {
      try {
        const cwd = resolveWorkspacePath(workspaceRoot, ".");
        const pkgPath = resolveWorkspacePath(workspaceRoot, "package.json");
        if (!(await pathExists(pkgPath))) {
          return "No package.json in workspace — cannot run tests.";
        }
        const result = await runCommand(cwd, "npm", [
          "run",
          script ?? "test",
        ]);
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
        return `Error running tests: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "run_tests",
      description:
        "Run an npm script in the workspace (default: test).",
      schema: z.object({
        script: z
          .string()
          .nullable()
          .describe('npm script to run, e.g. "test". Defaults to "test".'),
      }),
    },
  );
}

/** @deprecated use createRunTestsTool */
export const runTestsTool = null;
