import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (packages/agent/src/scripts → ../../../../) */
export const REPO_ROOT = path.resolve(__dirname, "../../../../");

export const DEFAULT_FIXTURE = path.join(
  REPO_ROOT,
  "workspace/fixtures/slow-users-endpoint",
);

/**
 * Resolve a workspace/repo path for demo scripts.
 * Relative paths are resolved from the monorepo root (not packages/agent cwd),
 * because `npm run -w @aec/agent` executes with the package as cwd.
 */
export function resolveRepoPath(arg?: string): string {
  if (!arg) return DEFAULT_FIXTURE;
  if (path.isAbsolute(arg)) return path.normalize(arg);
  return path.resolve(REPO_ROOT, arg);
}
