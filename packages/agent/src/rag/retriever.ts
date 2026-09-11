import type { Document } from "@langchain/core/documents";
import type { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

/**
 * Retrieve the most relevant code chunks for a natural-language query.
 */
export async function retrieveCodeChunks(
  store: MemoryVectorStore,
  query: string,
  k = 8,
): Promise<Document[]> {
  return store.similaritySearch(query, k);
}

/** @deprecated use retrieveCodeChunks */
export const codeRetriever = retrieveCodeChunks;
