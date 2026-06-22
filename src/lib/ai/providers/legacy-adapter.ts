import type {
  CarouselGenerationRequest,
  GenerationResult,
  ImageGenerationRequest,
  ProductPromoGenerationRequest,
  ReelGenerationRequest,
  VideoGenerationRequest,
} from "../../../types/generation.js";
import type { GenerationProvider } from "./types.js";

/** Wrap legacy single-method providers for the new interface. */
export function adaptLegacyProvider(
  provider: {
    name: string;
    priority: number;
    isAvailable(): Promise<boolean>;
    generate(request: {
      type: string;
      characterId: string;
      prompt: string;
      negativePrompt?: string;
      parameters?: Record<string, unknown>;
    }): Promise<GenerationResult>;
  }
): GenerationProvider {
  const imageReq = (req: ImageGenerationRequest) =>
    provider.generate({
      type: "IMAGE",
      characterId: req.characterId,
      prompt: req.prompt,
      negativePrompt: req.negativePrompt,
      parameters: { aspectRatio: req.aspectRatio, model: req.model },
    });

  return {
    name: provider.name,
    priority: provider.priority,
    isAvailable: () => provider.isAvailable(),
    generateImage: imageReq,
    generatePost: imageReq,
    generateCarousel: (req) =>
      provider.generate({
        type: "CAROUSEL",
        characterId: req.characterId,
        prompt: req.prompt,
        parameters: { count: req.slideCount, aspectRatio: req.aspectRatio },
      }),
    generateProductPromo: (req) =>
      provider.generate({
        type: "PRODUCT_PROMO",
        characterId: req.characterId,
        prompt: `${req.prompt}. Product: ${req.productName}`,
      }),
    generateVideo: (req: VideoGenerationRequest) =>
      provider.generate({
        type: "VIDEO",
        characterId: req.characterId,
        prompt: req.prompt,
        parameters: { duration: req.duration, model: req.model },
      }),
    generateReel: (req: ReelGenerationRequest) =>
      provider.generate({
        type: "REEL",
        characterId: req.characterId,
        prompt: req.prompt,
        parameters: { duration: req.duration, model: req.model },
      }),
  };
}
