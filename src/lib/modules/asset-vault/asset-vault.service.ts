import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import type { AssetType } from "@prisma/client";

/**
 * Asset Vault module — owns Asset and Prompt entities (visual consistency layer).
 */
export const assetVaultService = {
  async listAssets(characterId: string, type?: AssetType) {
    return prisma.asset.findMany({
      where: { characterId, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
    });
  },

  async getCanonicalPrompts(characterId: string) {
    return prisma.prompt.findMany({
      where: { characterId, isCanonical: true },
    });
  },

  async createAsset(input: {
    characterId: string;
    type: AssetType;
    name: string;
    url: string;
    thumbnailUrl?: string;
    tags?: string[];
    locationId?: string;
    roomId?: string;
    campaignId?: string;
    promptId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.asset.create({ data: input });
  },

  /** Resolve canonical prompt IDs for a given entity context. */
  async resolveCanonicalPromptIds(
    characterId: string,
    refs: { locationId?: string; roomId?: string; outfitId?: string }
  ) {
    const prompts = await prisma.prompt.findMany({
      where: {
        characterId,
        isCanonical: true,
        OR: [
          ...(refs.locationId ? [{ locations: { some: { id: refs.locationId } } }] : []),
          ...(refs.roomId ? [{ rooms: { some: { id: refs.roomId } } }] : []),
          ...(refs.outfitId ? [{ outfits: { some: { id: refs.outfitId } } }] : []),
        ],
      },
      select: { id: true },
    });
    return prompts.map((p) => p.id);
  },
};
