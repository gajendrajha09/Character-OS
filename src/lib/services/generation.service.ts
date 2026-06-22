import { ProductionBriefContentType } from "@prisma/client";

import { assembleBrief } from "../ai/brief-assembler";

import {

  buildConsistencyInjection,

  injectConsistencyIntoPrompt,

} from "../ai/consistency-layer";

import { loadCharacterContext } from "../ai/context-builder";

import { parseIntent } from "../ai/intent-parser";

import {

  defaultNegativePrompt,

  inferContentGoal,

  selectImageModel,

  selectVideoModel,

} from "../ai/model-selector";

import { getActiveProvider, getConfiguredProviderName } from "../ai/providers/provider-factory";

import type { DerivativeAction, GenerationHistoryEntry, StoredAsset } from "../../types/generation.js";

import { memoryStore, useMemoryStorage } from "../store/memory-store";



export type GenerateContentIntent =

  | "Generate Post"

  | "Generate Reel"

  | "Generate Product Promotion"

  | "Generate Content Calendar"

  | "Generate Story Sequence"

  | "Generate Campaign";



const FOLLOW_UP_ACTIONS: DerivativeAction[] = [

  "CAPTION",

  "REEL_VERSION",

  "STORY_VERSION",

  "PRODUCT_PLACEMENT",

];



export interface GenerationFlowResult {

  briefId: string;

  jobId: string;

  asset: StoredAsset;

  brief: Record<string, unknown>;

  model: string;

  modelReason: string;

  followUpActions: DerivativeAction[];

  provider: string;

  mock?: boolean;

}



export class GenerationService {

  async generateFromIntent(

    characterId: string,

    intent: GenerateContentIntent

  ): Promise<GenerationFlowResult> {

    const provider = getActiveProvider();

    const providerName = getConfiguredProviderName();

    const context = await loadCharacterContext(characterId);

    const campaign = memoryStore.getActiveCampaign(characterId);



    const assembled = await assembleBrief(characterId, intent);

    const parsed = parseIntent(intent);

    const contentGoal = inferContentGoal(parsed, {

      productName: intent.includes("Product") ? "Featured Product" : undefined,

      isCampaign: intent.includes("Campaign"),

    });



    const consistency = buildConsistencyInjection(context, assembled);

    const isVideo =

      parsed.contentType === ProductionBriefContentType.REEL || intent.includes("Reel");

    const isPost = intent === "Generate Post" || parsed.contentType === ProductionBriefContentType.POST;

    const isPromo = intent.includes("Product");



    const modelRec = isVideo

      ? selectVideoModel({

          contentGoal,

          contentType: parsed.contentType,

          scene: parsed.scene,

          isProduct: isPromo,

        })

      : selectImageModel({

          contentGoal,

          contentType: parsed.contentType,

          scene: parsed.scene,

          isProduct: isPromo,

          isLuxury: assembled.mood.toLowerCase().includes("luxury"),

        });



    const negativePrompt = defaultNegativePrompt();

    const visualPrompt = injectConsistencyIntoPrompt(assembled.promptHidden, consistency);



    const briefId = crypto.randomUUID();

    const jobId = crypto.randomUUID();



    memoryStore.addBrief({

      id: briefId,

      characterId,

      campaignId: campaign?.id,

      contentType: assembled.contentType,

      intent,

      character: assembled.character,

      location: assembled.location,

      scene: assembled.scene,

      wardrobe: assembled.wardrobe,

      mood: assembled.mood,

      camera: assembled.camera,

      platform: assembled.platform,

      duration: assembled.duration,

      theme: assembled.theme ?? assembled.scene,

      goal: assembled.goal ?? intent,

      campaign: assembled.campaign,

      status: "GENERATING",

      promptHidden: visualPrompt,

      generationPayload: assembled.generationPayload,

      assembledFrom: assembled.assembledFrom as unknown as Record<string, unknown>,

      createdAt: new Date().toISOString(),

    });



    memoryStore.addJob({

      id: jobId,

      characterId,

      campaignId: campaign?.id,

      type: isVideo ? "REEL" : isPromo ? "PRODUCT_PROMOTION" : "IMAGE",

      status: "PENDING",

      provider: providerName,

      prompt: visualPrompt,

      input: { intent, briefId, model: modelRec.model, campaignId: campaign?.id },

      createdAt: new Date().toISOString(),

    });



    memoryStore.updateJob(jobId, {

      status: "PROCESSING",

      startedAt: new Date().toISOString(),

    });



    let genResult;

    try {

      if (isPromo) {

        genResult = await provider.generateProductPromo({

          characterId,

          briefId,

          prompt: visualPrompt,

          negativePrompt,

          model: modelRec.model,

          aspectRatio: modelRec.aspectRatio,

          productName: "Featured Product",

          campaignGoal: assembled.goal,

        });

      } else if (isPost) {

        genResult = await provider.generatePost({

          characterId,

          briefId,

          prompt: visualPrompt,

          negativePrompt,

          model: modelRec.model,

          aspectRatio: modelRec.aspectRatio,

          theme: assembled.theme ?? assembled.scene,

          goal: assembled.goal ?? intent,

          campaign: assembled.campaign,

          mood: assembled.mood,

          location: assembled.location,

        });

      } else if (isVideo) {

        genResult = await provider.generateReel({

          characterId,

          briefId,

          prompt: visualPrompt,

          model: modelRec.model,

          aspectRatio: modelRec.aspectRatio,

          duration: assembled.duration ?? 15,

          theme: assembled.scene,

          mood: assembled.mood,

        });

      } else {

        genResult = await provider.generateImage({

          characterId,

          briefId,

          prompt: visualPrompt,

          negativePrompt,

          model: modelRec.model,

          aspectRatio: modelRec.aspectRatio,

        });

      }



      if (!genResult.success || !genResult.output?.url) {

        memoryStore.updateJob(jobId, {

          status: "FAILED",

          error: genResult.error ?? "Generation failed",

          completedAt: new Date().toISOString(),

        });

        throw new Error(genResult.error ?? "Generation failed");

      }



      const asset = memoryStore.addAsset({

        id: crypto.randomUUID(),

        characterId,

        type: isVideo ? "VIDEO" : "IMAGE",

        name: `${assembled.scene} — ${assembled.character}`,

        url: genResult.output.url,

        thumbnailUrl: genResult.output.thumbnailUrl ?? genResult.output.url,

        briefId,

        jobId,

        locationId: assembled.assembledFrom.locationId,

        campaignId: campaign?.id,

        characterName: context.character.name,

        campaignTitle: campaign?.title ?? assembled.campaign,

        metadata: {

          provider: genResult.provider,

          model: genResult.output.model ?? modelRec.model,

          prompt: visualPrompt,

          negativePrompt,

          seed: genResult.output.seed,

          contentGoal,

          intent,

          mock: genResult.raw?.mock === true,

          theme: assembled.theme,

          goal: assembled.goal,

        },

        createdAt: new Date().toISOString(),

      });



      memoryStore.updateJob(jobId, {

        status: "COMPLETED",

        output: genResult as unknown as Record<string, unknown>,

        result: { url: asset.url, assetId: asset.id },

        completedAt: new Date().toISOString(),

      });



      const historyEntry: GenerationHistoryEntry = {

        id: jobId,

        characterId,

        briefId,

        assetId: asset.id,

        type: isVideo ? "REEL" : "IMAGE",

        provider: genResult.provider,

        model: modelRec.model,

        prompt: visualPrompt,

        status: "COMPLETED",

        outputUrl: asset.url,

        createdAt: new Date().toISOString(),

        followUpActions: FOLLOW_UP_ACTIONS,

      };

      memoryStore.addHistory(historyEntry);



      return {

        briefId,

        jobId,

        asset,

        model: modelRec.model,

        modelReason: modelRec.reason,

        followUpActions: FOLLOW_UP_ACTIONS,

        provider: genResult.provider,

        mock: genResult.raw?.mock === true,

        brief: {

          contentType: isVideo ? "Instagram Reel" : "Instagram Post",

          goal: assembled.goal ?? intent,

          theme: assembled.theme ?? assembled.scene,

          campaign: assembled.campaign ?? campaign?.title,

          platform: assembled.platform,

          character: assembled.character,

          location: assembled.location,

          wardrobe: assembled.wardrobe,

          mood: assembled.mood,

          camera: assembled.camera,

          duration: assembled.duration ? `${assembled.duration} sec` : undefined,

        },

      };

    } catch (err) {

      if (memoryStore.getJob(jobId)?.status !== "FAILED") {

        memoryStore.updateJob(jobId, {

          status: "FAILED",

          error: err instanceof Error ? err.message : "Generation failed",

          completedAt: new Date().toISOString(),

        });

      }

      throw err;

    }

  }



  async deriveFromAsset(

    characterId: string,

    assetId: string,

    action: DerivativeAction

  ): Promise<GenerationFlowResult> {

    const asset = memoryStore.getAsset(assetId);

    if (!asset) throw new Error("Asset not found");



    const intentMap: Record<DerivativeAction, GenerateContentIntent> = {

      CAPTION: "Generate Post",

      REEL_VERSION: "Generate Reel",

      STORY_VERSION: "Generate Story Sequence",

      PRODUCT_PLACEMENT: "Generate Product Promotion",

    };



    const result = await this.generateFromIntent(characterId, intentMap[action]);

    return {

      ...result,

      asset: {

        ...result.asset,

        metadata: { ...result.asset.metadata, derivedFrom: assetId, derivative: action },

      },

    };

  }



  async listAssets(characterId: string): Promise<StoredAsset[]> {

    if (useMemoryStorage()) {

      return memoryStore.listAssets(characterId);

    }

    return memoryStore.listAssets(characterId);

  }



  async getHistory(characterId: string): Promise<GenerationHistoryEntry[]> {

    if (useMemoryStorage()) {

      return memoryStore.getHistory(characterId);

    }

    return memoryStore.getHistory(characterId);

  }



  async getJob(jobId: string) {

    return memoryStore.getJob(jobId);

  }

}



export const generationService = new GenerationService();


