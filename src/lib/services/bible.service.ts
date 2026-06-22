import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { loadCharacterContext } from "../ai/context-builder.js";
import { generateBibleSchema, updateBibleSchema } from "../validators/bible.schema.js";

export class BibleService {
  async get(characterId: string) {
    return prisma.characterBible.findUnique({ where: { characterId } });
  }

  async assembleFromCharacter(characterId: string) {
    const ctx = await loadCharacterContext(characterId);
    const { character, occupation, hobbies, world, bible } = ctx;

    const identity = {
      name: character.name,
      age: character.age,
      contentNiche: character.contentNiche,
      brandVoice: character.brandVoice,
      occupation: occupation?.title,
      company: occupation?.company,
    };

    const personality = bible?.personality ?? { traits: [] };
    const home = world
      ? {
          city: world.world.city,
          neighborhood: world.residence?.neighborhood,
          interiorStyle: world.residence?.interiorStyle,
          residenceType: world.residence?.type,
        }
      : {};

    const socialCircle = {
      friends: world?.friends.map((f) => ({ name: f.name, relationship: f.relationship })) ?? [],
      pets: world?.pets.map((p) => ({ name: p.name, species: p.species })) ?? [],
    };

    const lifestyle = {
      hobbies: hobbies.map((h) => h.name),
      routines: ctx.routines.map((r) => ({ title: r.title, type: r.type })),
    };

    const fashion = bible?.fashion ?? {
      wardrobeStyle: character.contentNiche,
      outfits: ctx.outfits.map((o) => ({ name: o.name, occasion: o.occasion })),
    };

    return { identity, personality, home, socialCircle, lifestyle, fashion };
  }

  async createOrUpdate(characterId: string, regenerate = false) {
    generateBibleSchema.parse({ regenerate });
    const sections = await this.assembleFromCharacter(characterId);
    const existing = await prisma.characterBible.findUnique({ where: { characterId } });

    if (existing && !regenerate) {
      return existing;
    }

    if (existing) {
      return prisma.characterBible.update({
        where: { characterId },
        data: {
          identity: sections.identity as Prisma.InputJsonValue,
          personality: sections.personality as Prisma.InputJsonValue,
          home: sections.home as Prisma.InputJsonValue,
          socialCircle: sections.socialCircle as Prisma.InputJsonValue,
          lifestyle: sections.lifestyle as Prisma.InputJsonValue,
          fashion: sections.fashion as Prisma.InputJsonValue,
          version: existing.version + 1,
        },
      });
    }

    return prisma.characterBible.create({
      data: {
        characterId,
        identity: sections.identity as Prisma.InputJsonValue,
        personality: sections.personality as Prisma.InputJsonValue,
        home: sections.home as Prisma.InputJsonValue,
        socialCircle: sections.socialCircle as Prisma.InputJsonValue,
        lifestyle: sections.lifestyle as Prisma.InputJsonValue,
        fashion: sections.fashion as Prisma.InputJsonValue,
        version: 1,
      },
    });
  }

  async update(characterId: string, input: Record<string, unknown>) {
    const data = updateBibleSchema.parse(input);
    const existing = await prisma.characterBible.findUniqueOrThrow({
      where: { characterId },
    });

    return prisma.characterBible.update({
      where: { characterId },
      data: {
        ...data,
        identity: data.identity as Prisma.InputJsonValue | undefined,
        personality: data.personality as Prisma.InputJsonValue | undefined,
        home: data.home as Prisma.InputJsonValue | undefined,
        socialCircle: data.socialCircle as Prisma.InputJsonValue | undefined,
        lifestyle: data.lifestyle as Prisma.InputJsonValue | undefined,
        fashion: data.fashion as Prisma.InputJsonValue | undefined,
        goals: data.goals as Prisma.InputJsonValue | undefined,
        dailyRoutine: data.dailyRoutine as Prisma.InputJsonValue | undefined,
        favoritePlaces: data.favoritePlaces as Prisma.InputJsonValue | undefined,
        version: existing.version + 1,
      },
    });
  }
}

export const bibleService = new BibleService();
