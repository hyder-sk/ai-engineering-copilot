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

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".cjs",
]);

async function collectFiles(dir: string, out: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(full, out);
    } else if (entry.isFile() && TEXT_EXT.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
}

export function createSearchCodeTool(workspaceRoot: string) {
  return tool(
    async ({ query, max_results: maxResults }) => {
      try {
        const root = resolveWorkspacePath(workspaceRoot, ".");
        const files: string[] = [];
        await collectFiles(root, files);
        const hits: string[] = [];
        const limit = maxResults ?? 20;
        const needle = query.toLowerCase();

        for (const file of files) {
          if (hits.length >= limit) break;
          const content = await fs.readFile(file, "utf8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (hits.length >= limit) break;
            if (lines[i].toLowerCase().includes(needle)) {
              const rel = path.relative(root, file);
              hits.push(`${rel}:${i + 1}: ${lines[i].trim()}`);
            }
          }
        }

        if (hits.length === 0) {
          return `No matches for "${query}".`;
        }
        return truncate(hits.join("\n"));
      } catch (err) {
        return `Error searching code: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "search_code",
      description:
        "Search workspace source files for a text/query string. Returns path:line: snippet matches.",
      schema: z.object({
        query: z.string().describe("Substring to search for (case-insensitive)"),
        max_results: z
          .number()
          .nullable()
          .describe("Maximum matches to return (default 20)"),
      }),
    },
  );
}

/** @deprecated use createSearchCodeTool */
export const searchCodeTool = null;
