import type { ContentGoal, ModelRecommendation } from "../../types/generation.js";
import type { ParsedIntent } from "./intent-parser.js";
import { ProductionBriefContentType } from "@prisma/client";

export interface ModelSelectionInput {
  contentGoal: ContentGoal;
  contentType: ProductionBriefContentType;
  scene?: string;
  isProduct?: boolean;
  isLuxury?: boolean;
  isPortrait?: boolean;
  isTravel?: boolean;
  modelOverride?: string;
}

const HIGGSFIELD_MODELS = {
  LIFESTYLE: "soul_2",
  PRODUCT: "marketing_studio_image",
  LUXURY_FASHION: "soul_2",
  PORTRAIT: "soul_2",
  TRAVEL: "soul_2",
  VIDEO_LIFESTYLE: "seedance_2_0",
  VIDEO_PRODUCT: "marketing_studio_video",
  VIDEO_REEL: "higgsfield_preset",
} as const;

export function inferContentGoal(
  parsed: ParsedIntent,
  options?: { productName?: string; isCampaign?: boolean }
): ContentGoal {
  if (options?.productName) return "PRODUCT_PROMOTION";
  if (options?.isCampaign) return "CAMPAIGN";
  if (parsed.scene === "gym") return "GYM";
  if (parsed.scene === "cafe") return "CAFE";
  if (parsed.scene === "morning" || parsed.scene === "weekend") return "MORNING_ROUTINE";
  if (parsed.scene === "fashion") return "LUXURY_FASHION";
  if (parsed.scene === "travel") return "TRAVEL";
  return "LIFESTYLE";
}

export function selectImageModel(input: ModelSelectionInput): ModelRecommendation {
  if (input.modelOverride) {
    return {
      model: input.modelOverride,
      provider: "higgsfield",
      reason: "User override",
      aspectRatio: aspectRatioForContent(input.contentType),
    };
  }

  if (
    input.isProduct ||
    input.contentGoal === "PRODUCT_PROMOTION" ||
    input.contentGoal === "PRODUCT_PHOTOGRAPHY"
  ) {
    return {
      model: HIGGSFIELD_MODELS.PRODUCT,
      provider: "higgsfield",
      reason: "Product photography — commercial studio model",
      aspectRatio: "4:5",
    };
  }

  if (input.isLuxury || input.contentGoal === "LUXURY_FASHION") {
    return {
      model: HIGGSFIELD_MODELS.LUXURY_FASHION,
      provider: "higgsfield",
      reason: "Luxury fashion — editorial portrait model",
      aspectRatio: "4:5",
    };
  }

  if (input.isPortrait || input.contentGoal === "INFLUENCER_PORTRAIT") {
    return {
      model: HIGGSFIELD_MODELS.PORTRAIT,
      provider: "higgsfield",
      reason: "Influencer portrait — character consistency model",
      aspectRatio: "4:5",
    };
  }

  if (input.isTravel || input.contentGoal === "TRAVEL") {
    return {
      model: HIGGSFIELD_MODELS.TRAVEL,
      provider: "higgsfield",
      reason: "Travel content — environment-rich model",
      aspectRatio: "4:5",
    };
  }

  return {
    model: HIGGSFIELD_MODELS.LIFESTYLE,
    provider: "higgsfield",
    reason: "Lifestyle content — UGC editorial model",
    aspectRatio: aspectRatioForContent(input.contentType),
  };
}

export function selectVideoModel(input: ModelSelectionInput): ModelRecommendation {
  if (input.modelOverride) {
    return {
      model: input.modelOverride,
      provider: "higgsfield",
      reason: "User override",
      aspectRatio: "9:16",
    };
  }

  if (
    input.isProduct ||
    input.contentGoal === "PRODUCT_PROMOTION" ||
    input.contentGoal === "PRODUCT_PHOTOGRAPHY"
  ) {
    return {
      model: HIGGSFIELD_MODELS.VIDEO_PRODUCT,
      provider: "higgsfield",
      reason: "Product video — marketing studio model",
      aspectRatio: "9:16",
    };
  }

  if (input.contentType === ProductionBriefContentType.REEL) {
    return {
      model: HIGGSFIELD_MODELS.VIDEO_REEL,
      provider: "higgsfield",
      reason: "Trending reel — preset UGC model",
      aspectRatio: "9:16",
    };
  }

  return {
    model: HIGGSFIELD_MODELS.VIDEO_LIFESTYLE,
    provider: "higgsfield",
    reason: "Lifestyle vlog — identity-preserving video model",
    aspectRatio: "9:16",
  };
}

function aspectRatioForContent(contentType: ProductionBriefContentType): string {
  switch (contentType) {
    case ProductionBriefContentType.STORY:
      return "9:16";
    case ProductionBriefContentType.CAROUSEL:
      return "1:1";
    default:
      return "4:5";
  }
}

export function defaultNegativePrompt(): string {
  return "deformed, blurry, watermark, text, logo, cartoon, anime, extra fingers, bad anatomy, low quality";
}
