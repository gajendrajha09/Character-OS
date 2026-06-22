import type {
  Character,
  CharacterBible,
  ContentIdea,
  Hobby,
  Location,
  Occupation,
  Outfit,
  Prompt,
  Residence,
  Room,
  Routine,
  World,
} from "@prisma/client";
import { memoryStore, useMemoryStorage } from "../store/memory-store.js";
import { prisma } from "../db/prisma.js";
import type { WorldGraph } from "../../types/world.js";
import type { PersonalityTraits } from "../../types/character.js";

export interface FullCharacterContext {
  character: Character;
  bible: CharacterBible | null;
  occupation: Occupation | null;
  routines: Routine[];
  hobbies: Hobby[];
  outfits: Outfit[];
  world: WorldGraph | null;
  canonicalPrompts: Prompt[];
  recentContentIdeas: ContentIdea[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function hashContext(context: FullCharacterContext): string {
  const key = [
    context.character.id,
    context.character.updatedAt.toISOString(),
    context.bible?.version ?? 0,
    context.world?.world.updatedAt.toISOString() ?? "no-world",
  ].join(":");
  return Buffer.from(key).toString("base64url").slice(0, 16);
}

export async function loadCharacterContext(characterId: string): Promise<FullCharacterContext> {
  if (useMemoryStorage()) {
    const record = memoryStore.getCharacter(characterId);
    if (!record) {
      throw new Error(`Character not found: ${characterId}`);
    }
    return {
      character: record.character,
      bible: record.bible,
      occupation: record.occupation,
      routines: record.routines,
      hobbies: [],
      outfits: record.outfits,
      world: record.world,
      canonicalPrompts: [],
      recentContentIdeas: [],
    };
  }

  const character = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
    include: {
      bible: true,
      occupation: true,
      routines: { include: { location: true } },
      hobbies: true,
      outfits: true,
      world: {
        include: {
          residence: { include: { rooms: { orderBy: { sortOrder: "asc" } } } },
          locations: true,
          friends: true,
          pets: true,
          worldEvents: true,
        },
      },
      prompts: { where: { isCanonical: true } },
      contentIdeas: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  const world: WorldGraph | null = character.world
    ? {
        world: character.world,
        residence: character.world.residence,
        locations: character.world.locations,
        friends: character.world.friends,
        pets: character.world.pets,
        worldEvents: character.world.worldEvents,
      }
    : null;

  return {
    character,
    bible: character.bible,
    occupation: character.occupation,
    routines: character.routines,
    hobbies: character.hobbies,
    outfits: character.outfits,
    world,
    canonicalPrompts: character.prompts,
    recentContentIdeas: character.contentIdeas,
  };
}

export function getPersonalityTraits(bible: CharacterBible | null): PersonalityTraits {
  if (!bible?.personality || typeof bible.personality !== "object") {
    return {};
  }
  return bible.personality as PersonalityTraits;
}

export function getResidenceLabel(
  residence: (Residence & { rooms: Room[] }) | null,
  room?: Room | null,
  location?: Location | null
): string {
  if (location) {
    return location.name;
  }
  if (residence) {
    const base = `${residence.neighborhood} ${formatResidenceType(residence.type)}`;
    if (room) {
      return base;
    }
    return base;
  }
  return "Unknown Location";
}

function formatResidenceType(type: Residence["type"]): string {
  const map: Record<string, string> = {
    APARTMENT: "Apartment",
    HOUSE: "House",
    STUDIO: "Studio",
    PENTHOUSE: "Penthouse",
    LOFT: "Loft",
  };
  return map[type] ?? "Home";
}

export { slugify };
