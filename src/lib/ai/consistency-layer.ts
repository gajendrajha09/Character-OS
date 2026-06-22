import type { FullCharacterContext } from "./context-builder.js";
import { getPersonalityTraits } from "./context-builder.js";
import type { PersonalityTraits } from "../../types/character.js";

export interface ConsistencyInjection {
  appearance: string;
  hair: string;
  face: string;
  wardrobe: string;
  personality: string;
  style: string;
  locationContext: string;
  brandStyle: string;
}

export function buildConsistencyInjection(
  context: FullCharacterContext,
  brief: {
    wardrobe: string;
    location: string;
    mood: string;
    scene: string;
  }
): ConsistencyInjection {
  const bible = context.bible;
  const fashion = (bible?.fashion ?? {}) as Record<string, unknown>;
  const identity = (bible?.identity ?? {}) as Record<string, unknown>;
  const traits = getPersonalityTraits(bible);

  const hairStyle = String(fashion.hairStyle ?? fashion.hair ?? "natural styled hair");
  const wardrobeStyle = String(fashion.wardrobeStyle ?? fashion.signatureLook ?? brief.wardrobe);
  const age = context.character.age ?? 25;
  const name = context.character.name;

  return {
    appearance: `${age}-year-old ${name}, ${context.character.contentNiche ?? "lifestyle creator"}`,
    hair: hairStyle,
    face: inferFaceDescription(traits, identity),
    wardrobe: brief.wardrobe || wardrobeStyle,
    personality: formatPersonality(traits),
    style: `${brief.mood}, ${context.character.brandVoice ?? "authentic lifestyle aesthetic"}`,
    locationContext: `${brief.location}, ${brief.scene} scene`,
    brandStyle: String(fashion.signatureLook ?? fashion.wardrobeStyle ?? "consistent personal brand aesthetic"),
  };
}

export function injectConsistencyIntoPrompt(
  basePrompt: string,
  injection: ConsistencyInjection
): string {
  return [
    basePrompt,
    `Character: ${injection.appearance}.`,
    `Hair: ${injection.hair}. Face: ${injection.face}.`,
    `Wearing: ${injection.wardrobe}.`,
    `Personality vibe: ${injection.personality}.`,
    `Visual style: ${injection.style}. Brand: ${injection.brandStyle}.`,
    `Setting: ${injection.locationContext}.`,
    "Photorealistic, natural lighting, Instagram-quality, consistent character identity.",
  ].join(" ");
}

function inferFaceDescription(traits: PersonalityTraits, identity: Record<string, unknown>): string {
  const parts: string[] = [];
  if ((traits.feminine ?? 0) >= 6) parts.push("soft feminine features");
  if ((traits.confident ?? 0) >= 7) parts.push("confident expression");
  if ((traits.playful ?? 0) >= 6) parts.push("warm approachable smile");
  if (identity.languages) parts.push("South Asian features");
  return parts.length > 0 ? parts.join(", ") : "natural expressive face";
}

function formatPersonality(traits: PersonalityTraits): string {
  const labels: string[] = [];
  if ((traits.playful ?? 0) >= 6) labels.push("playful");
  if ((traits.luxury ?? 0) >= 6) labels.push("luxury");
  if ((traits.feminine ?? 0) >= 6) labels.push("feminine");
  if ((traits.minimalist ?? 0) >= 6) labels.push("minimalist");
  if ((traits.adventure ?? 0) >= 6) labels.push("adventurous");
  return labels.join(", ") || "authentic";
}
