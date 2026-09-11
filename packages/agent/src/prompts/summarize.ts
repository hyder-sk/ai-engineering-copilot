import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "./system.js";

export const summarizePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `${SYSTEM_PROMPT}\n\nSummarize the code in 3-5 clear sentences. Focus on purpose and structure.`,
  ],
  ["human", "Summarize this code:\n\n```\n{code}\n```"],
]);
