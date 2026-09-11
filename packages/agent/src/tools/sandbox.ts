import fs from "node:fs/promises";
import path from "node:path";

/**
 * Resolve a user-supplied path under workspaceRoot.
 * Prevents path traversal outside the sandbox.
 */
export function resolveWorkspacePath(
  workspaceRoot: string,
  relativePath = ".",
): string {
  const root = path.resolve(workspaceRoot);
  const target = path.resolve(root, relativePath);
  const rel = path.relative(root, target);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes workspace: ${relativePath}`);
  }
  return target;
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function truncate(text: string, maxChars = 12_000): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n...[truncated ${text.length - maxChars} chars]`;
}
