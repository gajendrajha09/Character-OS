import OpenAI from "openai";
import type { LegacyGenerationProvider } from "./legacy-types.js";
import type { GenerationRequest, GenerationResult } from "../../../types/generation.js";

export class OpenAIProvider implements LegacyGenerationProvider {
  name = "openai";
  priority = 3;
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  estimateCredits(request: GenerationRequest): number {
    if (request.type === "BIBLE") return 3;
    if (request.type === "SCRIPT") return 2;
    return 1;
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const credits = this.estimateCredits(request);

    if (!(await this.isAvailable())) {
      return {
        provider: this.name,
        type: request.type,
        success: false,
        error: "OPENAI_API_KEY not configured",
        creditsUsed: 0,
      };
    }

    try {
      const response = await this.getClient().chat.completions.create({
        model: (request.parameters?.model as string) ?? "gpt-4o-mini",
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: (request.parameters?.maxTokens as number) ?? 1024,
      });

      const text = response.choices[0]?.message?.content ?? "";
      return {
        provider: this.name,
        type: request.type,
        success: true,
        output: { text },
        creditsUsed: credits,
      };
    } catch (err) {
      return {
        provider: this.name,
        type: request.type,
        success: false,
        error: err instanceof Error ? err.message : "OpenAI generation failed",
        creditsUsed: 0,
      };
    }
  }
}

export const openaiProvider = new OpenAIProvider();
