import { prisma } from "../../db/prisma.js";
import type { CampaignStatus, CampaignType, Platform } from "@prisma/client";

/**
 * Campaign Planner module — owns Campaign, BrandDeal, and WorldEvent.
 */
export const campaignPlannerService = {
  async listCampaigns(characterId: string, status?: CampaignStatus) {
    return prisma.campaign.findMany({
      where: { characterId, ...(status ? { status } : {}) },
      orderBy: { startDate: "desc" },
    });
  },

  async createCampaign(input: {
    characterId: string;
    title: string;
    type: CampaignType;
    platform: Platform[];
    startDate: Date;
    endDate: Date;
    goal?: string;
    brandDealId?: string;
  }) {
    return prisma.campaign.create({ data: input });
  },

  async listWorldEvents(worldId: string) {
    return prisma.worldEvent.findMany({
      where: { worldId },
      orderBy: { date: "asc" },
    });
  },

  /** Generate campaign brief and content calendar — delegates to Generation layer when implemented. */
  async generateCampaign(_characterId: string, _input: Record<string, unknown>): Promise<never> {
    throw new Error("campaignPlannerService.generateCampaign: not implemented");
  },
};
