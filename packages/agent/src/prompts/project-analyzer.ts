import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "./system.js";

export const PROJECT_ANALYZER_PROMPT_TEXT = `You are analyzing a software project from retrieved source excerpts.
Identify language, framework, architecture, notable dependencies, and concrete issues
(performance, security, bugs, code quality). Prefer evidence from the provided excerpts.`;

export const projectAnalyzerPrompt = ChatPromptTemplate.fromMessages([
  ["system", `${SYSTEM_PROMPT}\n\n${PROJECT_ANALYZER_PROMPT_TEXT}`],
  [
    "human",
    `User request: {request}

Retrieved project excerpts:
{context}

Analyze this project.`,
  ],
]);
