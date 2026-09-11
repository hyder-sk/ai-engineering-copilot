import type { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { createEmbeddings } from "./embeddings.js";

export interface BuildCodeIndexOptions {
  embeddingModel?: string;
}

/**
 * Phase 2: embed chunks into an in-memory vector store.
 */
export async function buildCodeIndex(
  chunks: Document[],
  options: BuildCodeIndexOptions = {},
): Promise<MemoryVectorStore> {
  const embeddings = createEmbeddings(options.embeddingModel);
  return MemoryVectorStore.fromDocuments(chunks, embeddings);
}
