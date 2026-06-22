/**
 * Location Library module — thin wrapper over world service location methods.
 */
import { worldService } from "../../services/world.service.js";
import { prisma } from "../../db/prisma.js";

export const locationLibraryService = {
  listByWorld: async (worldId: string) =>
    prisma.location.findMany({ where: { worldId }, orderBy: { name: "asc" } }),
  getById: async (locationId: string) =>
    prisma.location.findUnique({ where: { id: locationId } }),
  create: worldService.addLocation.bind(worldService),
  listFavorites: async (worldId: string) =>
    prisma.location.findMany({ where: { worldId, isFavorite: true } }),
};
