import { analyzeProject } from "../project/analyze-project.js";
import { resolveRepoPath } from "./paths.js";

async function main() {
  const repositoryPath = resolveRepoPath(process.argv[2]);

  const request =
    process.argv.slice(3).join(" ").trim() ||
    "Analyze this project and find why the /users endpoint is slow.";

  console.log(`Repository: ${repositoryPath}`);
  console.log(`Request: ${request}\n`);

  const result = await analyzeProject(repositoryPath, { request });

  console.log("=== Phase 2 meta ===");
  console.log(
    JSON.stringify(
      {
        documentsLoaded: result.documentsLoaded,
        chunksIndexed: result.chunksIndexed,
        retrievedSources: result.retrievedSources,
      },
      null,
      2,
    ),
  );

  console.log("\n=== Phase 2 analysis ===\n");
  console.log(JSON.stringify(result.analysis, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
