import type { GenerationRequest, GenerationResult, GenerationType } from "../../types/generation.js";
import { allProviders } from "./providers/index.js";
import type { GenerationProvider } from "./providers/types.js";

const ROUTING: Record<GenerationType, string[]> = {
  VIDEO: ["mock", "higgsfield", "fal", "replicate"],
  REEL: ["mock", "higgsfield"],
  IMAGE: ["mock", "higgsfield", "fal", "replicate"],
  CAROUSEL: ["mock", "higgsfield", "fal"],
  PRODUCT_PROMO: ["mock", "higgsfield", "fal"],
  TEXT: ["openai"],
  CAPTION: ["openai"],
  HASHTAGS: ["openai"],
  BIBLE: ["openai"],
  SCRIPT: ["openai", "higgsfield"],
};

function getProvider(name: string): GenerationProvider | undefined {
  return allProviders.find((p) => p.name === name);
}

function providersForType(type: GenerationType): GenerationProvider[] {
  const chain = ROUTING[type] ?? ["higgsfield"];
  return chain
    .map(getProvider)
    .filter((p): p is GenerationProvider => p !== undefined)
    .sort((a, b) => a.priority - b.priority);
}

export async function routeGeneration(request: GenerationRequest): Promise<GenerationResult> {
  const providers = providersForType(request.type);
  let lastError: string | undefined;

  for (const provider of providers) {
    if (!(await provider.isAvailable())) continue;

    let result: GenerationResult;

    switch (request.type) {
      case "REEL":
        result = await provider.generateReel({
          characterId: request.characterId,
          briefId: request.briefId,
          prompt: request.prompt,
          model: request.parameters?.model as string | undefined,
          duration: request.parameters?.duration as number | undefined,
        });
        break;
      case "VIDEO":
        result = await provider.generateVideo({
          characterId: request.characterId,
          briefId: request.briefId,
          prompt: request.prompt,
          model: request.parameters?.model as string | undefined,
          duration: request.parameters?.duration as number | undefined,
        });
        break;
      case "CAROUSEL":
        result = await provider.generateCarousel({
          characterId: request.characterId,
          briefId: request.briefId,
          prompt: request.prompt,
          slideCount: request.parameters?.slideCount as number | undefined,
        });
        break;
      case "PRODUCT_PROMO":
        result = await provider.generateProductPromo({
          characterId: request.characterId,
          briefId: request.briefId,
          prompt: request.prompt,
          productName: String(request.metadata?.productName ?? "Product"),
        });
        break;
      default:
        result = await provider.generateImage({
          characterId: request.characterId,
          briefId: request.briefId,
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
          model: request.parameters?.model as string | undefined,
          aspectRatio: request.parameters?.aspectRatio as string | undefined,
        });
    }

    if (result.success) return result;
    lastError = result.error;
  }

  return {
    provider: providers[0]?.name ?? "none",
    type: request.type,
    success: false,
    error: lastError ?? `No provider available for type ${request.type}`,
    creditsUsed: 0,
  };
}

export function estimateCredits(request: GenerationRequest): number {
  const provider = providersForType(request.type)[0];
  if (!provider) return 0;
  if (request.type === "REEL" || request.type === "VIDEO") return 15;
  return 3;
}

export { providersForType, ROUTING };
