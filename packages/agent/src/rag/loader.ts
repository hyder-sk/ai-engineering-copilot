import fs from "node:fs/promises";
import path from "node:path";
import { Document } from "@langchain/core/documents";

const DEFAULT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
]);

const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".next",
  "coverage",
]);

export interface LoadRepoOptions {
  extensions?: Set<string>;
  ignoreDirs?: Set<string>;
  maxFileBytes?: number;
}

/**
 * Phase 2 document loader: walk a local repo/folder → LangChain Documents.
 */
export async function loadRepoDocuments(
  rootDir: string,
  options: LoadRepoOptions = {},
): Promise<Document[]> {
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const ignoreDirs = options.ignoreDirs ?? DEFAULT_IGNORE_DIRS;
  const maxFileBytes = options.maxFileBytes ?? 200_000;
  const absoluteRoot = path.resolve(rootDir);
  const documents: Document[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue;
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions.has(ext)) continue;

      const stat = await fs.stat(fullPath);
      if (stat.size > maxFileBytes) continue;

      const content = await fs.readFile(fullPath, "utf8");
      const relativePath = path.relative(absoluteRoot, fullPath);
      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            source: relativePath,
            absolutePath: fullPath,
            extension: ext,
            bytes: stat.size,
          },
        }),
      );
    }
  }

  await walk(absoluteRoot);
  return documents;
}

/** @deprecated use loadRepoDocuments */
export const repoLoader = loadRepoDocuments;
