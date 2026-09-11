import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

export class EnvConfig {
  private readonly envConfig: { [key: string]: string | undefined };

  constructor() {
    this.envConfig = process.env;
  }

  get PORT(): number {
    return Number.parseInt(this.envConfig["PORT"] ?? "3001", 10);
  }

  get NODE_ENV(): string {
    return this.envConfig["NODE_ENV"] ?? "development";
  }

  get OPENAI_API_KEY(): string {
    return this.envConfig["OPENAI_API_KEY"] ?? "";
  }

  get LANGCHAIN_TRACING_V2(): boolean {
    return this.envConfig["LANGCHAIN_TRACING_V2"] === "true";
  }

  get LANGCHAIN_PROJECT(): string {
    return this.envConfig["LANGCHAIN_PROJECT"] ?? "ai-engineering-copilot";
  }

  get LANGCHAIN_ENDPOINT(): string {
    return this.envConfig["LANGCHAIN_ENDPOINT"] ?? "https://api.smith.langchain.com";
  }

  get LANGCHAIN_API_KEY(): string {
    return this.envConfig["LANGCHAIN_API_KEY"] ?? "";
  }

  get DATABASE_URL(): string {
    return this.envConfig["DATABASE_URL"] ?? "";
  }

  get REDIS_URL(): string {
    return this.envConfig["REDIS_URL"] ?? "";
  }

  get NEXT_PUBLIC_API_URL(): string {
    return this.envConfig["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  }
}

export const ENV = new EnvConfig();
