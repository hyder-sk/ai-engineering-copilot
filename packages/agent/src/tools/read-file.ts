import fs from "node:fs/promises";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { resolveWorkspacePath, truncate } from "./sandbox.js";

export function createReadFileTool(workspaceRoot: string) {
  return tool(
    async ({ path: filePath }) => {
      try {
        const absolute = resolveWorkspacePath(workspaceRoot, filePath);
        const content = await fs.readFile(absolute, "utf8");
        return truncate(content);
      } catch (err) {
        return `Error reading file: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "read_file",
      description:
        "Read a text file from the workspace by relative path. Use after list_files or search_code.",
      schema: z.object({
        path: z
          .string()
          .describe(
            "Relative path from workspace root, e.g. src/users/users.controller.ts",
          ),
      }),
    },
  );
}

/** @deprecated use createReadFileTool */
export const readFileTool = null;
