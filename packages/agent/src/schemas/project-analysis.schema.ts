import { z } from "zod";
import { analysisIssueSchema } from "./analysis.schema.js";

/**
 * Project-level structured analysis (Phase 2).
 * All fields required/nullable for OpenAI structured output compatibility.
 */
export const projectAnalysisSchema = z.object({
  language: z.string().describe("Primary programming language"),
  framework: z
    .string()
    .nullable()
    .describe("Framework if detectable, or null"),
  architecture: z
    .string()
    .nullable()
    .describe("High-level architecture notes, or null"),
  dependencies: z
    .array(z.string())
    .describe("Notable dependencies inferred from the code"),
  issues: z.array(analysisIssueSchema).describe("Detected issues across the project"),
  summary: z.string().describe("One-paragraph overall project analysis"),
});

export type ProjectAnalysis = z.infer<typeof projectAnalysisSchema>;
