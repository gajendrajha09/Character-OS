import type {
  Platform,
  ProductionBrief,
  ProductionBriefContentType,
  ProductionBriefStatus,
} from "@prisma/client";

export type { ProductionBrief, ProductionBriefContentType, ProductionBriefStatus, Platform };

/** Human-readable brief shown to the user — no prompts. */
export interface HumanReadableBrief {
  character: string;
  location: string;
  scene: string;
  wardrobe: string;
  mood: string;
  camera: string;
  platform: Platform;
  duration: number | null;
  title?: string;
  campaign?: string;
  theme?: string;
  goal?: string;
}

/** World memory refs used during assembly. */
export interface AssembledFromRefs {
  characterId: string;
  locationId?: string;
  roomId?: string;
  outfitId?: string;
  routineId?: string;
  worldEventId?: string;
  canonicalPromptIds?: string[];
  parsedIntent: Record<string, unknown>;
  worldContextHash?: string;
  locationLabel?: string;
}

/** Full assembly result before persistence. */
export interface AssembledBrief extends HumanReadableBrief {
  contentType: ProductionBriefContentType;
  intent: string;
  assembledFrom: AssembledFromRefs;
  generationPayload: Record<string, unknown>;
  promptHidden: string;
}

export interface GenerateBriefInput {
  characterId: string;
  intent: string;
  platform?: Platform;
}

export interface UpdateBriefInput {
  location?: string;
  scene?: string;
  wardrobe?: string;
  mood?: string;
  camera?: string;
  platform?: Platform;
  duration?: number;
  locationId?: string;
  roomId?: string;
  outfitId?: string;
}
