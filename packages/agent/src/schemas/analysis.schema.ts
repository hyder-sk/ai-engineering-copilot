import { z } from "zod";

export const analysisIssueSchema = z.object({
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().describe("e.g. performance, security, bug, quality"),
  summary: z.string().describe("Short description of the issue"),
  evidence: z
    .string()
    .nullable()
    .describe("Code evidence, or null if none"),
});

export const analysisSchema = z.object({
  language: z.string().describe("Primary programming language"),
  framework: z
    .string()
    .nullable()
    .describe("Framework if detectable, e.g. NestJS, or null"),
  architecture: z
    .string()
    .nullable()
    .describe("Brief architecture notes, or null"),
  issues: z.array(analysisIssueSchema).describe("Detected issues"),
  summary: z.string().describe("One-paragraph overall analysis"),
});

export type AnalysisIssue = z.infer<typeof analysisIssueSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
