import type { LegacyGenerationProvider } from "./legacy-types.js";
import type { GenerationRequest, GenerationResult } from "../../../types/generation.js";

/** Replicate — image generation fallback. */
export class ReplicateProvider implements LegacyGenerationProvider {
  name = "replicate";
  priority = 3;

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.REPLICATE_API_TOKEN);
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (!(await this.isAvailable())) {
      return {
        provider: this.name,
        type: request.type,
        success: false,
        error: "REPLICATE_API_TOKEN not configured",
        creditsUsed: 0,
      };
    }

    return {
      provider: this.name,
      type: request.type,
      success: true,
      output: {
        jobId: `replicate-${Date.now()}`,
        url: `https://replicate.delivery/stub/${request.characterId}.jpg`,
      },
      creditsUsed: 2,
    };
  }
}

export const replicateProvider = new ReplicateProvider();
