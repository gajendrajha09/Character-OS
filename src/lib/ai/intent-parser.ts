import {
  ContentIdeaType,
  LocationType,
  Platform,
  ProductionBriefContentType,
  ReelFormat,
  RoutineType,
} from "@prisma/client";

export interface ParsedIntent {
  raw: string;
  contentType: ProductionBriefContentType;
  scene: string;
  dayType?: "WEEKDAY" | "WEEKEND";
  dayName?: string;
  locationType?: LocationType;
  platform: Platform;
  format?: ReelFormat | ContentIdeaType;
  title?: string;
}

const PRESET_INTENTS: Record<string, Omit<ParsedIntent, "raw">> = {
  "generate monday morning reel": {
    contentType: ProductionBriefContentType.REEL,
    scene: "morning",
    dayType: "WEEKDAY",
    dayName: "monday",
    platform: Platform.INSTAGRAM,
    format: ReelFormat.TRENDING,
    title: "Monday Morning at Home",
  },
  "generate gym content": {
    contentType: ProductionBriefContentType.REEL,
    scene: "gym",
    locationType: LocationType.GYM,
    platform: Platform.INSTAGRAM,
    format: ReelFormat.TRENDING,
    title: "Gym Session",
  },
  "generate coffee shop reel": {
    contentType: ProductionBriefContentType.REEL,
    scene: "cafe",
    locationType: LocationType.CAFE,
    platform: Platform.INSTAGRAM,
    format: ReelFormat.TRENDING,
    title: "Coffee Shop Moment",
  },
  "generate weekend vlog": {
    contentType: ProductionBriefContentType.REEL,
    scene: "weekend",
    dayType: "WEEKEND",
    platform: Platform.INSTAGRAM,
    format: ReelFormat.VLOG,
    title: "Weekend Vlog",
  },
  "generate fashion shoot": {
    contentType: ProductionBriefContentType.CAROUSEL,
    scene: "fashion",
    platform: Platform.INSTAGRAM,
    format: ContentIdeaType.CAROUSEL,
    title: "Fashion Shoot",
  },
  "generate instagram post": {
    contentType: ProductionBriefContentType.POST,
    scene: "lifestyle",
    platform: Platform.INSTAGRAM,
    format: ContentIdeaType.POST,
    title: "Lifestyle Post",
  },
};

function normalizeIntent(intent: string): string {
  return intent.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parse preset button labels or structured intent into assembly rules. */
export function parseIntent(intent: string, platformOverride?: Platform): ParsedIntent {
  const normalized = normalizeIntent(intent);
  const preset = PRESET_INTENTS[normalized];

  if (preset) {
    return {
      ...preset,
      raw: intent,
      platform: platformOverride ?? preset.platform,
    };
  }

  // Fallback: infer from keywords
  const isReel = normalized.includes("reel") || normalized.includes("vlog");
  const isPost = normalized.includes("post") && !isReel;
  const contentType = isPost
    ? ProductionBriefContentType.POST
    : ProductionBriefContentType.REEL;

  let scene = "lifestyle";
  if (normalized.includes("morning")) scene = "morning";
  else if (normalized.includes("gym")) scene = "gym";
  else if (normalized.includes("coffee") || normalized.includes("cafe")) scene = "cafe";
  else if (normalized.includes("weekend")) scene = "weekend";
  else if (normalized.includes("fashion")) scene = "fashion";

  const dayNameMatch = normalized.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/
  );

  return {
    raw: intent,
    contentType,
    scene,
    dayType: normalized.includes("weekend") ? "WEEKEND" : "WEEKDAY",
    dayName: dayNameMatch?.[1],
    locationType: inferLocationType(scene),
    platform: platformOverride ?? Platform.INSTAGRAM,
    format: isReel ? ReelFormat.TRENDING : ContentIdeaType.POST,
    title: capitalizeWords(intent.replace(/^generate\s+/i, "")),
  };
}

function inferLocationType(scene: string): LocationType | undefined {
  const map: Record<string, LocationType> = {
    gym: LocationType.GYM,
    cafe: LocationType.CAFE,
    morning: LocationType.OTHER,
    weekend: LocationType.OTHER,
    fashion: LocationType.OTHER,
    lifestyle: LocationType.OTHER,
  };
  return map[scene];
}

function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function sceneLabel(parsed: ParsedIntent): string {
  if (parsed.dayName && parsed.scene === "morning") {
    return `${capitalizeWords(parsed.dayName)} Morning`;
  }
  if (parsed.scene === "morning") return "Morning";
  if (parsed.scene === "weekend") return "Weekend";
  if (parsed.scene === "gym") return "Gym Session";
  if (parsed.scene === "cafe") return "Coffee Shop";
  if (parsed.scene === "fashion") return "Fashion";
  return capitalizeWords(parsed.scene);
}

export function platformLabel(platform: Platform, contentType: ProductionBriefContentType): string {
  const platformNames: Partial<Record<Platform, string>> = {
    INSTAGRAM: "Instagram",
    TIKTOK: "TikTok",
    YOUTUBE_SHORTS: "YouTube Shorts",
  };
  const name = platformNames[platform] ?? platform;
  if (contentType === ProductionBriefContentType.REEL) return `${name} Reel`;
  if (contentType === ProductionBriefContentType.POST) return `${name} Post`;
  return name;
}

export function defaultDuration(platform: Platform, contentType: ProductionBriefContentType): number | null {
  if (contentType === ProductionBriefContentType.POST) return null;
  if (platform === Platform.YOUTUBE_SHORTS) return 30;
  return 15;
}
