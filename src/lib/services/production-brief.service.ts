import { Prisma, ProductionBriefStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { assembleBrief } from "../ai/brief-assembler.js";
import { mcpGenerationClient } from "../ai/mcp/generation-client.js";
import {
  generateBriefSchema,
  updateBriefSchema,
} from "../validators/production-brief.schema.js";
import type { GenerateBriefInput } from "../../types/production-brief.js";

export class ProductionBriefService {
  /** Parse intent and assemble brief from world memory — core flow. */
  async parseIntent(characterId: string, intent: string) {
    return assembleBrief(characterId, intent);
  }

  async generate(input: GenerateBriefInput) {
    generateBriefSchema.parse({ intent: input.intent, platform: input.platform });

    const assembled = await assembleBrief(input.characterId, input.intent, input.platform);

    const brief = await prisma.productionBrief.create({
      data: {
        characterId: input.characterId,
        contentType: assembled.contentType,
        intent: assembled.intent,
        character: assembled.character,
        locationId: assembled.assembledFrom.locationId,
        roomId: assembled.assembledFrom.roomId,
        outfitId: assembled.assembledFrom.outfitId,
        scene: assembled.scene,
        wardrobe: assembled.wardrobe,
        mood: assembled.mood,
        camera: assembled.camera,
        platform: assembled.platform,
        duration: assembled.duration,
        status: ProductionBriefStatus.DRAFT,
        assembledFrom: assembled.assembledFrom as unknown as Prisma.InputJsonValue,
        generationPayload: assembled.generationPayload as unknown as Prisma.InputJsonValue,
        promptHidden: assembled.promptHidden,
      },
    });

    return {
      id: brief.id,
      status: brief.status,
      brief: this.toHumanReadable(brief),
    };
  }

  async findById(briefId: string) {
    return prisma.productionBrief.findUnique({ where: { id: briefId } });
  }

  async listByCharacter(characterId: string) {
    return prisma.productionBrief.findMany({
      where: { characterId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(briefId: string, input: Record<string, unknown>) {
    const parsed = updateBriefSchema.parse(input);
    const { location: _location, ...data } = parsed;
    return prisma.productionBrief.update({
      where: { id: briefId },
      data,
    });
  }

  /** Trigger generation via MCP — user never sees promptHidden. */
  async triggerGeneration(briefId: string) {
    const brief = await prisma.productionBrief.findUniqueOrThrow({
      where: { id: briefId },
    });

    await prisma.productionBrief.update({
      where: { id: briefId },
      data: { status: ProductionBriefStatus.GENERATING },
    });

    const payload = (brief.generationPayload ?? {}) as Record<string, unknown>;
    const result = await mcpGenerationClient.sendFromBriefPayload(
      briefId,
      brief.characterId,
      payload,
      brief.promptHidden ?? ""
    );

    const status = result.success
      ? ProductionBriefStatus.COMPLETED
      : ProductionBriefStatus.FAILED;

    return prisma.productionBrief.update({
      where: { id: briefId },
      data: { status },
    });
  }

  toHumanReadable(brief: {
    character: string;
    scene: string;
    wardrobe: string;
    mood: string;
    camera: string;
    platform: string;
    duration: number | null;
    assembledFrom: unknown;
  }) {
    const refs = brief.assembledFrom as { locationLabel?: string };
    return {
      character: brief.character,
      location: refs.locationLabel ?? brief.scene,
      scene: brief.scene,
      wardrobe: brief.wardrobe,
      mood: brief.mood,
      camera: brief.camera,
      platform: brief.platform,
      duration: brief.duration,
    };
  }
}

export const productionBriefService = new ProductionBriefService();
