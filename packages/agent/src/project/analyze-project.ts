import type { Document } from "@langchain/core/documents";
import { analyzeProjectChain } from "../chains/analyze-project.chain.js";
import type { ProjectAnalysis } from "../schemas/project-analysis.schema.js";
import {
  buildCodeIndex,
  loadRepoDocuments,
  retrieveCodeChunks,
  splitCodeDocuments,
} from "../rag/index.js";

export interface AnalyzeProjectOptions {
  request?: string;
  topK?: number;
  modelName?: string;
  embeddingModel?: string;
}

export interface AnalyzeProjectResult {
  analysis: ProjectAnalysis;
  documentsLoaded: number;
  chunksIndexed: number;
  retrievedSources: string[];
}

function formatContext(docs: Document[]): string {
  return docs
    .map((doc, i) => {
      const source = String(doc.metadata.source ?? "unknown");
      return `--- Excerpt ${i + 1}: ${source} ---\n${doc.pageContent}`;
    })
    .join("\n\n");
}

/**
 * Phase 2 orchestrator:
 * repo → load → split → embed/index → retrieve → structured analysis
 */
export async function analyzeProject(
  repositoryPath: string,
  options: AnalyzeProjectOptions = {},
): Promise<AnalyzeProjectResult> {
  const request =
    options.request ??
    "Analyze this project for architecture, bugs, security, and performance issues.";

  const documents = await loadRepoDocuments(repositoryPath);
  if (documents.length === 0) {
    throw new Error(`No supported source files found in: ${repositoryPath}`);
  }

  const chunks = await splitCodeDocuments(documents);
  const store = await buildCodeIndex(chunks, {
    embeddingModel: options.embeddingModel,
  });

  const retrieved = await retrieveCodeChunks(
    store,
    request,
    options.topK ?? 8,
  );

  const analysis = await analyzeProjectChain({
    request,
    context: formatContext(retrieved),
    modelName: options.modelName,
  });

  const retrievedSources = [
    ...new Set(
      retrieved.map((doc) => String(doc.metadata.source ?? "unknown")),
    ),
  ];

  return {
    analysis,
    documentsLoaded: documents.length,
    chunksIndexed: chunks.length,
    retrievedSources,
  };
}
