import type {
  CarouselGenerationRequest,
  GenerationResult,
  ImageGenerationRequest,
  PostGenerationRequest,
  ProductPromoGenerationRequest,
  ReelGenerationRequest,
  VideoGenerationRequest,
} from "../../../types/generation.js";

/**
 * Provider-agnostic generation interface.
 * CharacterOS intelligence layer → provider execution layer.
 */
export interface GenerationProvider {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  generateImage(request: ImageGenerationRequest): Promise<GenerationResult>;
  generatePost(request: PostGenerationRequest): Promise<GenerationResult>;
  generateVideo(request: VideoGenerationRequest): Promise<GenerationResult>;
  generateCarousel(request: CarouselGenerationRequest): Promise<GenerationResult>;
  generateProductPromo(request: ProductPromoGenerationRequest): Promise<GenerationResult>;
  generateReel(request: ReelGenerationRequest): Promise<GenerationResult>;
}

export type { PostGenerationRequest } from "../../../types/generation.js";

export type {
  GenerationRequest,
  GenerationResult,
  GenerationType,
} from "../../../types/generation.js";
