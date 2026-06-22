import { prisma } from "../../db/prisma.js";
import type { ContentIdeaStatus, ContentIdeaType, Platform } from "@prisma/client";

/**
 * Content Planner module — owns ContentIdea, Post, Reel, and ProductPromotion.
 */
export const contentPlannerService = {
  async listIdeas(characterId: string, status?: ContentIdeaStatus) {
    return prisma.contentIdea.findMany({
      where: { characterId, ...(status ? { status } : {}) },
      orderBy: { scheduledDate: "asc" },
    });
  },

  async createIdea(input: {
    characterId: string;
    title: string;
    type: ContentIdeaType;
    platform: Platform;
    concept: string;
    campaignId?: string;
    locationId?: string;
    outfitId?: string;
    scheduledDate?: Date;
  }) {
    return prisma.contentIdea.create({ data: input });
  },

  async getReel(reelId: string) {
    return prisma.reel.findUnique({ where: { id: reelId } });
  },

  async getPost(postId: string) {
    return prisma.post.findUnique({ where: { id: postId } });
  },

  /** Generate content ideas from world context — delegates to Generation layer when implemented. */
  async generateIdeas(_characterId: string, _count: number): Promise<never> {
    throw new Error("contentPlannerService.generateIdeas: not implemented");
  },
};
