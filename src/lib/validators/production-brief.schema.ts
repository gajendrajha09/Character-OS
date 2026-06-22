import { Platform } from "@prisma/client";
import { z } from "zod";

export const generateBriefSchema = z.object({
  intent: z.string().min(1).max(500),
  platform: z.nativeEnum(Platform).optional(),
});

export const updateBriefSchema = z.object({
  location: z.string().max(200).optional(),
  scene: z.string().max(200).optional(),
  wardrobe: z.string().max(200).optional(),
  mood: z.string().max(100).optional(),
  camera: z.string().max(200).optional(),
  platform: z.nativeEnum(Platform).optional(),
  duration: z.number().int().min(1).max(180).optional(),
  locationId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  outfitId: z.string().uuid().optional(),
});

export type GenerateBriefSchema = z.infer<typeof generateBriefSchema>;
export type UpdateBriefSchema = z.infer<typeof updateBriefSchema>;
