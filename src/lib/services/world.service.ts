import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import {
  createFriendSchema,
  createLocationSchema,
  createResidenceSchema,
  createRoomSchema,
  createWorldSchema,
} from "../validators/world.schema.js";
import type {
  CreateFriendInput,
  CreateLocationInput,
  CreateResidenceInput,
  CreateRoomInput,
  CreateWorldInput,
} from "../../types/world.js";

export class WorldService {
  async createWorld(input: CreateWorldInput) {
    const data = createWorldSchema.parse(input);
    return prisma.world.create({
      data: {
        ...data,
        culture: data.culture as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getWorldGraph(characterId: string) {
    return prisma.world.findUnique({
      where: { characterId },
      include: {
        residence: { include: { rooms: { orderBy: { sortOrder: "asc" } } } },
        locations: true,
        friends: true,
        familyMembers: true,
        pets: true,
        worldEvents: true,
      },
    });
  }

  /** Create world shell for a character if none exists. */
  async ensureWorldShell(characterId: string, city: string, name?: string) {
    const existing = await prisma.world.findUnique({ where: { characterId } });
    if (existing) return existing;

    const character = await prisma.character.findUniqueOrThrow({
      where: { id: characterId },
    });

    return prisma.world.create({
      data: {
        characterId,
        name: name ?? `${character.name}'s World`,
        city,
        isComplete: false,
      },
    });
  }

  async addResidence(input: CreateResidenceInput) {
    const data = createResidenceSchema.parse(input);
    return prisma.residence.create({ data });
  }

  async addRoom(input: CreateRoomInput) {
    const data = createRoomSchema.parse(input);
    return prisma.room.create({ data });
  }

  async addLocation(input: CreateLocationInput) {
    const data = createLocationSchema.parse(input);
    return prisma.location.create({ data });
  }

  async addFriend(input: CreateFriendInput) {
    const data = createFriendSchema.parse({
      worldId: input.worldId,
      name: input.name,
      description: input.description,
      relationship: input.relationship,
      personality: input.personality,
    });
    return prisma.friend.create({
      data: {
        ...data,
        personality: data.personality as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async markComplete(worldId: string) {
    return prisma.world.update({
      where: { id: worldId },
      data: { isComplete: true },
    });
  }
}

export const worldService = new WorldService();
