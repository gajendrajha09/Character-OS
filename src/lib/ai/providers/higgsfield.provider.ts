import type {
  CarouselGenerationRequest,
  GenerationResult,
  ImageGenerationRequest,
  PostGenerationRequest,
  ProductPromoGenerationRequest,
  ReelGenerationRequest,
  VideoGenerationRequest,
} from "../../../types/generation.js";
import type { GenerationProvider } from "./types.js";
import { higgsfieldClient } from "../mcp/higgsfield-client.js";

/**
 * Higgsfield Provider — Priority #1 generation layer for CharacterOS.
 * CharacterOS builds briefs; Higgsfield executes generation.
 */
export class HiggsfieldProvider implements GenerationProvider {
  name = "higgsfield";
  priority = 1;

  async isAvailable(): Promise<boolean> {
    return higgsfieldClient.isConfigured() || higgsfieldClient.isMockMode();
  }

  estimateCreditsImage = () => 3;
  estimateCreditsVideo = (duration = 15) => Math.ceil(duration / 5) * 5;

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    const model = request.model ?? "soul_2";
    const result = await higgsfieldClient.generateImage({
      model,
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio ?? "4:5",
      count: request.count ?? 1,
    });

    return this.toGenerationResult("IMAGE", result, this.estimateCreditsImage());
  }

  async generatePost(request: PostGenerationRequest): Promise<GenerationResult> {
    const prompt = [
      request.prompt,
      request.theme ? `Theme: ${request.theme}.` : "",
      request.goal ? `Goal: ${request.goal}.` : "",
      request.campaign ? `Campaign: ${request.campaign}.` : "",
      request.mood ? `Mood: ${request.mood}.` : "",
      request.location ? `Location: ${request.location}.` : "",
      "Instagram lifestyle post, editorial composition.",
    ]
      .filter(Boolean)
      .join(" ");

    return this.generateImage({
      ...request,
      prompt,
      aspectRatio: request.aspectRatio ?? "4:5",
      model: request.model ?? "soul_2",
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult> {
    const model = request.model ?? "seedance_2_0";
    const result = await higgsfieldClient.generateVideo({
      model,
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio ?? "9:16",
      duration: request.duration ?? 15,
      medias: request.startImageJobId
        ? [{ value: request.startImageJobId, role: "start_image" }]
        : undefined,
    });

    return this.toGenerationResult("VIDEO", result, this.estimateCreditsVideo(request.duration));
  }

  async generateCarousel(request: CarouselGenerationRequest): Promise<GenerationResult> {
    const count = request.slideCount ?? 3;
    const result = await higgsfieldClient.generateImage({
      model: request.model ?? "soul_2",
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio ?? "1:1",
      count,
    });

    return this.toGenerationResult("CAROUSEL", result, this.estimateCreditsImage() * count);
  }

  async generateProductPromo(request: ProductPromoGenerationRequest): Promise<GenerationResult> {
    const prompt = [
      request.prompt,
      `Product: ${request.productName}.`,
      request.campaignGoal ? `Campaign goal: ${request.campaignGoal}.` : "",
      "Authentic influencer product integration, lifestyle setting, not overly commercial.",
    ]
      .filter(Boolean)
      .join(" ");

    const result = await higgsfieldClient.generateImage({
      model: request.model ?? "marketing_studio_image",
      prompt,
      aspect_ratio: request.aspectRatio ?? "4:5",
      count: 1,
    });

    return this.toGenerationResult("PRODUCT_PROMO", result, this.estimateCreditsImage() + 2);
  }

  async generateReel(request: ReelGenerationRequest): Promise<GenerationResult> {
    const prompt = [
      request.prompt,
      request.theme ? `Theme: ${request.theme}.` : "",
      request.mood ? `Mood: ${request.mood}.` : "",
      "Vertical UGC reel, handheld lifestyle vlog style.",
    ]
      .filter(Boolean)
      .join(" ");

    const result = await higgsfieldClient.generateVideo({
      model: request.model ?? "seedance_2_0",
      prompt,
      aspect_ratio: "9:16",
      duration: request.duration ?? 15,
      medias: request.startImageJobId
        ? [{ value: request.startImageJobId, role: "start_image" }]
        : undefined,
    });

    return this.toGenerationResult("REEL", result, this.estimateCreditsVideo(request.duration));
  }

  /** Legacy unified generate for router compatibility */
  async generate(request: {
    type: string;
    prompt: string;
    characterId: string;
    parameters?: Record<string, unknown>;
    negativePrompt?: string;
  }): Promise<GenerationResult> {
    if (request.type === "VIDEO" || request.type === "REEL") {
      return this.generateReel({
        characterId: request.characterId,
        prompt: request.prompt,
        duration: (request.parameters?.duration as number) ?? 15,
        model: request.parameters?.model as string | undefined,
      });
    }

    return this.generateImage({
      characterId: request.characterId,
      prompt: request.prompt,
      negativePrompt: request.negativePrompt,
      aspectRatio: request.parameters?.aspectRatio as string | undefined,
      model: request.parameters?.model as string | undefined,
    });
  }

  private toGenerationResult(
    type: GenerationResult["type"],
    result: Awaited<ReturnType<typeof higgsfieldClient.generateImage>>,
    creditsUsed: number
  ): GenerationResult {
    if (!result.success) {
      return {
        provider: this.name,
        type,
        success: false,
        error: result.error,
        creditsUsed: 0,
        raw: result.raw,
      };
    }

    return {
      provider: this.name,
      type,
      success: true,
      output: {
        url: result.url,
        urls: result.urls,
        thumbnailUrl: result.thumbnailUrl,
        jobId: result.jobId,
        model: result.model,
        seed: result.seed,
      },
      creditsUsed,
      raw: result.raw,
    };
  }
}

export const higgsfieldProvider = new HiggsfieldProvider();
