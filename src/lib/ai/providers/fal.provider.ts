import type { LegacyGenerationProvider } from "./legacy-types.js";
import type { GenerationRequest, GenerationResult } from "../../../types/generation.js";

/** Fal AI — image generation fallback provider. */
export class FalProvider implements LegacyGenerationProvider {
  name = "fal";
  priority = 2;

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.FAL_API_KEY);
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {

    if (!(await this.isAvailable())) {
      return {
        provider: this.name,
        type: request.type,
        success: false,
        error: "FAL_API_KEY not configured",
        creditsUsed: 0,
      };
    }

    // Stub: HTTP call to fal.run API in production
    return {
      provider: this.name,
      type: request.type,
      success: true,
      output: {
        jobId: `fal-${Date.now()}`,
        url: `https://fal.media/stub/${request.characterId}.jpg`,
      },
      creditsUsed: 2,
    };
  }
}

export const falProvider = new FalProvider();
