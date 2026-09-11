import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { resolveWorkspacePath, truncate } from "./sandbox.js";

const IGNORE = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".next",
  "coverage",
]);

async function walk(
  dir: string,
  root: string,
  out: string[],
  maxFiles: number,
): Promise<void> {
  if (out.length >= maxFiles) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (out.length >= maxFiles) return;
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (entry.isDirectory()) {
      await walk(full, root, out, maxFiles);
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
}

export function createListFilesTool(workspaceRoot: string) {
  return tool(
    async ({ directory, max_files: maxFiles }) => {
      try {
        const abs = resolveWorkspacePath(workspaceRoot, directory ?? ".");
        const files: string[] = [];
        await walk(abs, path.resolve(workspaceRoot), files, maxFiles ?? 200);
        if (files.length === 0) return "No files found.";
        return truncate(files.sort().join("\n"));
      } catch (err) {
        return `Error listing files: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "list_files",
      description:
        "List relative file paths under a workspace directory (recursive).",
      schema: z.object({
        directory: z
          .string()
          .nullable()
          .describe("Relative directory to list, or null for workspace root"),
        max_files: z
          .number()
          .nullable()
          .describe("Max files to return (default 200)"),
      }),
    },
  );
}

/** @deprecated use createListFilesTool */
export const listFilesTool = null;
