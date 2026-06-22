import { CreationMode, CharacterStatus } from "@prisma/client";
import { z } from "zod";

export const createCharacterSchema = z.object({
  userId: z.string().uuid(),
  userProfileId: z.string().uuid(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(13).max(120).optional(),
  contentNiche: z.string().max(200).optional(),
  brandVoice: z.string().max(500).optional(),
  creationMode: z.nativeEnum(CreationMode).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  avatarUrl: z.string().url().optional(),
  status: z.nativeEnum(CharacterStatus).optional(),
  contentNiche: z.string().max(200).optional(),
  brandVoice: z.string().max(500).optional(),
  socialMediaStyle: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateCharacterSchema = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterSchema = z.infer<typeof updateCharacterSchema>;
