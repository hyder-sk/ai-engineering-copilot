import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface SplitCodeOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Phase 2 text splitter: large files → chunks with preserved metadata.
 */
export async function splitCodeDocuments(
  documents: Document[],
  options: SplitCodeOptions = {},
): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? 1200,
    chunkOverlap: options.chunkOverlap ?? 150,
    separators: ["\n\n", "\n", " ", ""],
  });

  return splitter.splitDocuments(documents);
}

/** @deprecated use splitCodeDocuments */
export const codeSplitter = splitCodeDocuments;
