/**
 * Friend Network module — thin wrapper over world service social graph methods.
 */
import { worldService } from "../../services/world.service.js";
import { prisma } from "../../db/prisma.js";

export const friendNetworkService = {
  listFriends: async (worldId: string) =>
    prisma.friend.findMany({ where: { worldId }, orderBy: { name: "asc" } }),
  listFamily: async (worldId: string) =>
    prisma.familyMember.findMany({ where: { worldId }, orderBy: { name: "asc" } }),
  listPets: async (worldId: string) =>
    prisma.pet.findMany({ where: { worldId }, orderBy: { name: "asc" } }),
  createFriend: worldService.addFriend.bind(worldService),
};
