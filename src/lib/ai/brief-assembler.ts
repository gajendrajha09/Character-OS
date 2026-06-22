import {
  LocationType,
  OutfitOccasion,
  Platform,
  ProductionBriefContentType,
  RoomType,
  RoutineType,
} from "@prisma/client";
import type { Location, Outfit, Room, Routine } from "@prisma/client";
import {
  getPersonalityTraits,
  getResidenceLabel,
  hashContext,
  loadCharacterContext,
  type FullCharacterContext,
} from "./context-builder.js";
import {
  defaultDuration,
  parseIntent,
  platformLabel,
  sceneLabel,
  type ParsedIntent,
} from "./intent-parser.js";
import type { AssembledBrief, AssembledFromRefs } from "../../types/production-brief.js";
import type { PersonalityTraits } from "../../types/character.js";
import type { CompiledGenerationPayload } from "../../types/generation.js";
import { memoryStore, useMemoryStorage } from "../store/memory-store.js";

interface ResolvedLocation {
  label: string;
  locationId?: string;
  roomId?: string;
}

interface ResolvedWardrobe {
  label: string;
  outfitId?: string;
}

export async function assembleBrief(
  characterId: string,
  intent: string,
  platformOverride?: Platform
): Promise<AssembledBrief> {
  const context = await loadCharacterContext(characterId);
  const parsed = parseIntent(intent, platformOverride);

  const location = resolveLocation(context, parsed);
  const wardrobe = resolveWardrobe(context, parsed);
  const mood = resolveMood(context);
  const camera = resolveCamera(context, parsed);
  const duration = defaultDuration(parsed.platform, parsed.contentType);
  const scene = sceneLabel(parsed);

  const campaign = useMemoryStorage()
    ? memoryStore.getActiveCampaign(characterId)
    : undefined;
  const campaignTitle = campaign?.title;
  const theme = scene;
  const goal = intent;

  const assembledFrom: AssembledFromRefs = {
    characterId,
    locationId: location.locationId,
    roomId: location.roomId,
    outfitId: wardrobe.outfitId,
    routineId: findMatchingRoutine(context.routines, parsed)?.id,
    canonicalPromptIds: context.canonicalPrompts.map((p) => p.id),
    parsedIntent: parsed as unknown as Record<string, unknown>,
    worldContextHash: hashContext(context),
    locationLabel: location.label,
  };

  const humanBrief = {
    character: context.character.name,
    location: location.label,
    scene,
    wardrobe: wardrobe.label,
    mood,
    camera,
    platform: parsed.platform,
    duration,
    title: parsed.title ?? `${scene} — ${context.character.name}`,
    campaign: campaignTitle,
    theme,
    goal,
  };

  const promptHidden = compileHiddenPrompt(context, humanBrief, parsed);
  const generationPayload = compileGenerationPayload(context, humanBrief, parsed, promptHidden);

  return {
    ...humanBrief,
    contentType: parsed.contentType,
    intent,
    assembledFrom,
    generationPayload,
    promptHidden,
  };
}

function findMatchingRoutine(routines: Routine[], parsed: ParsedIntent): Routine | undefined {
  if (parsed.scene === "morning") {
    return routines.find((r) => r.type === RoutineType.MORNING);
  }
  if (parsed.scene === "weekend") {
    return routines.find((r) => r.type === RoutineType.WEEKEND);
  }
  if (parsed.dayType === "WEEKDAY") {
    return routines.find((r) => r.type === RoutineType.WEEKDAY);
  }
  return undefined;
}

export function resolveLocation(context: FullCharacterContext, parsed: ParsedIntent): ResolvedLocation {
  const { world, routines } = context;
  const routine = findMatchingRoutine(routines, parsed);

  if (parsed.locationType && world) {
    const loc = world.locations.find((l) => l.type === parsed.locationType);
    if (loc) {
      return { label: loc.name, locationId: loc.id };
    }
  }

  if (routine?.locationId && world) {
    const loc = world.locations.find((l) => l.id === routine.locationId);
    if (loc) {
      return { label: loc.name, locationId: loc.id };
    }
  }

  // Home scenes: residence + morning room
  if (world?.residence && (parsed.scene === "morning" || parsed.scene === "weekend" || parsed.scene === "lifestyle")) {
    const room = pickMorningRoom(world.residence.rooms, parsed.scene);
    const label = getResidenceLabel(world.residence, room);
    return { label, roomId: room?.id };
  }

  if (world?.residence) {
    return { label: getResidenceLabel(world.residence) };
  }

  if (world) {
    return { label: `${world.world.city} — ${context.character.name}'s World` };
  }

  return { label: "Unknown Location" };
}

function pickMorningRoom(rooms: Room[], scene: string): Room | undefined {
  const preferred: RoomType[] =
    scene === "morning"
      ? [RoomType.BEDROOM, RoomType.LIVING_ROOM, RoomType.KITCHEN]
      : [RoomType.LIVING_ROOM, RoomType.BEDROOM];

  for (const type of preferred) {
    const match = rooms.find((r) => r.type === type);
    if (match) return match;
  }
  return rooms[0];
}

export function resolveWardrobe(context: FullCharacterContext, parsed: ParsedIntent): ResolvedWardrobe {
  const { outfits, bible } = context;
  const occasions = occasionForScene(parsed.scene);

  const matched = outfits.filter((o) => occasions.includes(o.occasion));
  const traits = getPersonalityTraits(bible);

  const scored = matched
    .map((o) => ({ outfit: o, score: scoreOutfit(o, traits) }))
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return { label: scored[0].outfit.name, outfitId: scored[0].outfit.id };
  }

  return { label: inferWardrobeFromPersonality(traits, parsed.scene) };
}

function occasionForScene(scene: string): OutfitOccasion[] {
  switch (scene) {
    case "gym":
      return [OutfitOccasion.GYM, OutfitOccasion.CASUAL];
    case "fashion":
      return [OutfitOccasion.CONTENT_SHOOT, OutfitOccasion.FORMAL, OutfitOccasion.CASUAL];
    case "morning":
    case "weekend":
    case "lifestyle":
      return [OutfitOccasion.LOUNGE, OutfitOccasion.CASUAL];
    case "cafe":
      return [OutfitOccasion.CASUAL, OutfitOccasion.DATE];
    default:
      return [OutfitOccasion.CASUAL, OutfitOccasion.LOUNGE];
  }
}

function scoreOutfit(outfit: Outfit, traits: PersonalityTraits): number {
  const desc = `${outfit.name} ${outfit.description}`.toLowerCase();
  let score = 0;
  if ((traits.luxury ?? 0) >= 7 && /luxury|cashmere|silk|designer|beige|neutral/.test(desc)) score += 3;
  if ((traits.feminine ?? 0) >= 7 && /dress|skirt|feminine|soft|pastel/.test(desc)) score += 2;
  if ((traits.playful ?? 0) >= 6 && /colorful|playful|fun|bright/.test(desc)) score += 2;
  if ((traits.minimalist ?? 0) >= 7 && /minimal|clean|simple|neutral/.test(desc)) score += 2;
  return score;
}

function inferWardrobeFromPersonality(traits: PersonalityTraits, scene: string): string {
  if (scene === "gym") return "Athletic Wear Set";
  if ((traits.luxury ?? 0) >= 7 && (traits.feminine ?? 0) >= 6) {
    return "Oversized Beige Sweater";
  }
  if ((traits.luxury ?? 0) >= 7) return "Quiet Luxury Loungewear";
  if (scene === "morning") return "Casual Loungewear";
  return "Everyday Casual Outfit";
}

export function resolveMood(context: FullCharacterContext): string {
  const traits = getPersonalityTraits(context.bible);
  const luxury = traits.luxury ?? 0;
  const playful = traits.playful ?? 0;
  const adventure = traits.adventure ?? 0;
  const confident = traits.confident ?? 0;

  if (luxury >= 7 && playful >= 6) return "Cozy Luxury";
  if (luxury >= 7 && playful < 6) return "Quiet Luxury";
  if (adventure >= 7) return "Adventurous Energy";
  if (confident >= 7) return "Confident & Bold";
  if (playful >= 7) return "Playful & Light";
  return "Authentic Lifestyle";
}

export function resolveCamera(context: FullCharacterContext, parsed: ParsedIntent): string {
  const niche = (context.character.contentNiche ?? "").toLowerCase();

  if (parsed.contentType === ProductionBriefContentType.POST) {
    if (parsed.scene === "fashion") return "Editorial Lifestyle";
    return "Editorial Lifestyle";
  }

  if (parsed.scene === "gym") return "Action Handheld";
  if (parsed.platform === Platform.TIKTOK) return "POV Handheld";
  if (niche.includes("lifestyle") || niche.includes("creator")) return "Handheld Lifestyle Vlog";
  if (parsed.format === "VLOG") return "Handheld Lifestyle Vlog";
  return "Handheld Lifestyle Vlog";
}

function compileHiddenPrompt(
  context: FullCharacterContext,
  brief: Pick<AssembledBrief, "location" | "scene" | "wardrobe" | "mood" | "camera">,
  parsed: ParsedIntent
): string {
  const { character, occupation, bible } = context;
  const age = character.age ?? 25;
  const occupationTitle = occupation?.title ?? "content creator";
  const roomDesc =
    context.world?.residence?.rooms.find((r) => r.type === RoomType.BEDROOM)?.description ??
    context.world?.residence?.description ??
    brief.location;

  const personality = bible?.personality ? JSON.stringify(bible.personality) : "";

  return [
    `${brief.camera}, ${age}-year-old ${character.name}, ${occupationTitle},`,
    `scene: ${brief.scene}, location: ${brief.location} (${roomDesc}),`,
    `wardrobe: ${brief.wardrobe}, mood: ${brief.mood},`,
    `platform: ${platformLabel(parsed.platform, parsed.contentType)}, duration: ${defaultDuration(parsed.platform, parsed.contentType) ?? "N/A"}s,`,
    `personality context: ${personality},`,
    `vertical 9:16, natural authentic UGC style`,
  ].join(" ");
}

function compileGenerationPayload(
  context: FullCharacterContext,
  brief: Pick<AssembledBrief, "character" | "location" | "scene" | "wardrobe" | "mood" | "camera" | "platform" | "duration" | "title">,
  parsed: ParsedIntent,
  promptHidden: string
): CompiledGenerationPayload & Record<string, unknown> {
  const duration = brief.duration ?? 15;

  return {
    script: {
      provider: "openai",
      template: "TRENDING_REEL",
      variables: {
        "character.name": brief.character,
        scene: brief.scene,
        "location.description": brief.location,
        "outfit.description": brief.wardrobe,
        mood: brief.mood,
        duration,
      },
    },
    video: {
      provider: "higgsfield",
      template: "TRENDING_REEL",
      prompt: promptHidden,
      parameters: {
        duration,
        aspectRatio: "9:16",
        style: "UGC",
      },
    },
    thumbnail: {
      provider: "fal",
      model: "fal-ai/flux-pro",
      prompt: `${brief.character} in ${brief.wardrobe}, ${brief.location}, ${brief.mood}, lifestyle photography, vertical crop`,
      parameters: { width: 1080, height: 1920 },
    },
    caption: {
      provider: "openai",
      template: "INSTAGRAM_CAPTION",
      variables: {
        "contentIdea.title": brief.title ?? brief.scene,
        mood: brief.mood.toLowerCase(),
      },
    },
    contentType: parsed.contentType,
    platform: parsed.platform,
    characterId: context.character.id,
  };
}
