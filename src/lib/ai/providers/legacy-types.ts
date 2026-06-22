import type { GenerationRequest, GenerationResult } from "../../../types/generation.js";

/** Legacy single-method provider shape for Fal/OpenAI/Replicate adapters. */
export interface LegacyGenerationProvider {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
