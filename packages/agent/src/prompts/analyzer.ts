import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "./system.js";

export const ANALYZER_PROMPT_TEXT = `Analyze the provided source code.
Identify language, framework, architecture signals, and concrete issues
(performance, security, bugs, code quality). Include severity and evidence.`;

export const analyzerPrompt = ChatPromptTemplate.fromMessages([
  ["system", `${SYSTEM_PROMPT}\n\n${ANALYZER_PROMPT_TEXT}`],
  ["human", "Analyze this code:\n\n```\n{code}\n```"],
]);
