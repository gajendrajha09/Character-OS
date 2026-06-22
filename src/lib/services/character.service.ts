import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import {
  createCharacterSchema,
  updateCharacterSchema,
} from "../validators/character.schema.js";
import { slugify } from "../ai/context-builder.js";
import type { CreateCharacterInput, UpdateCharacterInput } from "../../types/character.js";

export class CharacterService {
  async create(input: CreateCharacterInput) {
    const data = createCharacterSchema.parse(input);
    const slug = slugify(data.name);

    return prisma.character.create({
      data: {
        userId: data.userId,
        userProfileId: data.userProfileId,
        name: data.name,
        slug,
        age: data.age,
        contentNiche: data.contentNiche,
        brandVoice: data.brandVoice,
        creationMode: data.creationMode,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findById(characterId: string) {
    return prisma.character.findUnique({
      where: { id: characterId },
      include: {
        bible: true,
        world: true,
        occupation: true,
        _count: { select: { assets: true } },
      },
    });
  }

  async listByUser(userId: string, status?: string) {
    return prisma.character.findMany({
      where: {
        userId,
        ...(status ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
      },
      include: {
        world: { select: { city: true, isComplete: true } },
        _count: { select: { assets: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(characterId: string, input: UpdateCharacterInput) {
    const data = updateCharacterSchema.parse(input);
    return prisma.character.update({
      where: { id: characterId },
      data: {
        ...data,
        socialMediaStyle: data.socialMediaStyle as Prisma.InputJsonValue | undefined,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async delete(characterId: string) {
    return prisma.character.delete({ where: { id: characterId } });
  }
}

export const characterService = new CharacterService();
