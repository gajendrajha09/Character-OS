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

function seedFromPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function placeholderUrl(prompt: string, width = 800, height = 1000): string {
  const seed = seedFromPrompt(prompt);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * MockProvider — deterministic placeholder generation for workflow validation.
 * No external API calls. Used when GENERATION_PROVIDER=mock.
 */
export class MockProvider implements GenerationProvider {
  name = "mock";
  priority = 0;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    await this.simulateLatency();
    const url = placeholderUrl(request.prompt);
    return {
      provider: this.name,
      type: "IMAGE",
      success: true,
      output: {
        url,
        thumbnailUrl: placeholderUrl(request.prompt, 400, 500),
        model: "mock-image-v1",
        seed: seedFromPrompt(request.prompt),
      },
      creditsUsed: 0,
      raw: { mock: true },
    };
  }

  async generatePost(request: PostGenerationRequest): Promise<GenerationResult> {
    await this.simulateLatency();
    const prompt = [
      request.prompt,
      request.theme ? `Theme: ${request.theme}.` : "",
      request.goal ? `Goal: ${request.goal}.` : "",
      request.campaign ? `Campaign: ${request.campaign}.` : "",
      "Instagram lifestyle post, editorial composition, 4:5 aspect ratio.",
    ]
      .filter(Boolean)
      .join(" ");

    const url = placeholderUrl(prompt);
    return {
      provider: this.name,
      type: "IMAGE",
      success: true,
      output: {
        url,
        thumbnailUrl: placeholderUrl(prompt, 400, 500),
        model: "mock-post-v1",
        seed: seedFromPrompt(prompt),
      },
      creditsUsed: 0,
      raw: { mock: true, contentType: "POST" },
    };
  }

  async generateProductPromo(request: ProductPromoGenerationRequest): Promise<GenerationResult> {
    await this.simulateLatency();
    const prompt = [
      request.prompt,
      `Product: ${request.productName}.`,
      request.campaignGoal ? `Campaign goal: ${request.campaignGoal}.` : "",
      "Authentic influencer product integration.",
    ]
      .filter(Boolean)
      .join(" ");

    const url = placeholderUrl(prompt);
    return {
      provider: this.name,
      type: "PRODUCT_PROMO",
      success: true,
      output: {
        url,
        thumbnailUrl: placeholderUrl(prompt, 400, 500),
        model: "mock-promo-v1",
        seed: seedFromPrompt(prompt),
      },
      creditsUsed: 0,
      raw: { mock: true },
    };
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult> {
    await this.simulateLatency();
    const url = placeholderUrl(request.prompt, 720, 1280);
    return {
      provider: this.name,
      type: "VIDEO",
      success: true,
      output: {
        url,
        thumbnailUrl: placeholderUrl(request.prompt, 400, 700),
        model: "mock-video-v1",
        jobId: `mock-video-${Date.now()}`,
      },
      creditsUsed: 0,
      raw: { mock: true },
    };
  }

  async generateReel(request: ReelGenerationRequest): Promise<GenerationResult> {
    return this.generateVideo(request);
  }

  async generateCarousel(request: CarouselGenerationRequest): Promise<GenerationResult> {
    const count = request.slideCount ?? 3;
    const result = await this.generateImage(request);
    if (!result.success || !result.output?.url) return result;
    const urls = Array.from({ length: count }, (_, i) =>
      placeholderUrl(`${request.prompt}-slide-${i}`)
    );
    return {
      ...result,
      type: "CAROUSEL",
      output: { ...result.output, urls, url: urls[0] },
    };
  }

  private async simulateLatency(): Promise<void> {
    await new Promise((r) => setTimeout(r, 600));
  }
}

export const mockProvider = new MockProvider();
