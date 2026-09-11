import { ChatOpenAI } from "@langchain/openai";
import { ENV } from "@aec/config";

export const createChatModel = (model = "gpt-4o-mini") => {
  return new ChatOpenAI({
    model,
    temperature: 0,
    apiKey: ENV.OPENAI_API_KEY,
  });
};
