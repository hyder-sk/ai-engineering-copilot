import { runCodingAgent } from "../agent/run-coding-agent.js";
import { resolveRepoPath } from "./paths.js";

async function main() {
  const workspaceRoot = resolveRepoPath(process.argv[2]);

  const question =
    process.argv.slice(3).join(" ").trim() ||
    "Why is the /users endpoint slow? Use tools to investigate the codebase.";

  console.log(`Workspace: ${workspaceRoot}`);
  console.log(`Question: ${question}\n`);

  const result = await runCodingAgent({
    workspaceRoot,
    question,
    maxIterations: 8,
  });

  console.log("=== Phase 3 tool calls ===\n");
  if (result.toolCalls.length === 0) {
    console.log("(no tools were called)");
  } else {
    for (const [i, call] of result.toolCalls.entries()) {
      console.log(`${i + 1}. ${call.name}`);
      console.log(`   args: ${JSON.stringify(call.args)}`);
      console.log(`   result: ${call.resultPreview}\n`);
    }
  }

  console.log(`=== iterations: ${result.iterations} ===\n`);
  console.log("=== Phase 3 final answer ===\n");
  console.log(result.answer);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
