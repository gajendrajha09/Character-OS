export type GenerationType =

  | "TEXT"

  | "IMAGE"

  | "VIDEO"

  | "CAPTION"

  | "HASHTAGS"

  | "BIBLE"

  | "SCRIPT"

  | "CAROUSEL"

  | "PRODUCT_PROMO"

  | "REEL";



export type ContentGoal =

  | "LIFESTYLE"

  | "PRODUCT_PHOTOGRAPHY"

  | "LUXURY_FASHION"

  | "INFLUENCER_PORTRAIT"

  | "TRAVEL"

  | "MORNING_ROUTINE"

  | "GYM"

  | "CAFE"

  | "CAMPAIGN"

  | "PRODUCT_PROMOTION";



export interface GenerationRequest {

  type: GenerationType;

  characterId: string;

  briefId?: string;

  prompt: string;

  negativePrompt?: string;

  parameters?: Record<string, unknown>;

  metadata?: Record<string, unknown>;

}



export interface ImageGenerationRequest {

  characterId: string;

  briefId?: string;

  prompt: string;

  negativePrompt?: string;

  aspectRatio?: string;

  model?: string;

  count?: number;

  metadata?: Record<string, unknown>;

}



export interface PostGenerationRequest extends ImageGenerationRequest {

  theme?: string;

  goal?: string;

  campaign?: string;

  mood?: string;

  location?: string;

}



export interface VideoGenerationRequest {

  characterId: string;

  briefId?: string;

  prompt: string;

  aspectRatio?: string;

  duration?: number;

  model?: string;

  startImageJobId?: string;

  metadata?: Record<string, unknown>;

}



export interface CarouselGenerationRequest extends ImageGenerationRequest {

  slideCount?: number;

}



export interface ProductPromoGenerationRequest extends ImageGenerationRequest {

  productName: string;

  campaignGoal?: string;

}



export interface ReelGenerationRequest extends VideoGenerationRequest {

  theme?: string;

  mood?: string;

}



export interface GenerationResult {

  provider: string;

  type: GenerationType;

  success: boolean;

  output?: {

    text?: string;

    url?: string;

    urls?: string[];

    thumbnailUrl?: string;

    jobId?: string;

    model?: string;

    seed?: string | number;

  };

  error?: string;

  creditsUsed: number;

  raw?: Record<string, unknown>;

}



export interface ModelRecommendation {

  model: string;

  provider: "higgsfield" | "fal" | "replicate" | "openai";

  reason: string;

  aspectRatio: string;

}



export interface CompiledGenerationPayload {

  script?: Record<string, unknown>;

  video?: Record<string, unknown>;

  image?: Record<string, unknown>;

  thumbnail?: Record<string, unknown>;

  caption?: Record<string, unknown>;

  hashtags?: Record<string, unknown>;

  contentType?: string;

  platform?: string;

  characterId?: string;

}



export type DerivativeAction =

  | "CAPTION"

  | "REEL_VERSION"

  | "STORY_VERSION"

  | "PRODUCT_PLACEMENT";



export interface GenerationHistoryEntry {

  id: string;

  characterId: string;

  briefId?: string;

  assetId?: string;

  type: GenerationType;

  provider: string;

  model?: string;

  prompt: string;

  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

  outputUrl?: string;

  createdAt: string;

  followUpActions?: DerivativeAction[];

}



export interface StoredAsset {

  id: string;

  characterId: string;

  type: "IMAGE" | "VIDEO";

  name: string;

  url: string;

  thumbnailUrl?: string;

  briefId?: string;

  jobId?: string;

  locationId?: string;

  campaignId?: string;

  characterName?: string;

  campaignTitle?: string;

  metadata?: Record<string, unknown>;

  createdAt: string;

}


