import { OpenAIEmbeddings } from "@langchain/openai";
import { ENV } from "@aec/config";

export function createEmbeddings(model = "text-embedding-3-small") {
  return new OpenAIEmbeddings({
    model,
    apiKey: ENV.OPENAI_API_KEY,
  });
}
