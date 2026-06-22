import { FriendRelation, InteriorStyle, LocationType, ResidenceType, RoomType } from "@prisma/client";
import { z } from "zod";

export const createWorldSchema = z.object({
  characterId: z.string().uuid(),
  name: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  culture: z.record(z.unknown()).optional(),
  summary: z.string().max(5000).optional(),
});

export const createResidenceSchema = z.object({
  worldId: z.string().uuid(),
  neighborhood: z.string().min(1).max(200),
  type: z.nativeEnum(ResidenceType).optional(),
  interiorStyle: z.nativeEnum(InteriorStyle).optional(),
  description: z.string().min(1),
  address: z.string().max(500).optional(),
});

export const createRoomSchema = z.object({
  residenceId: z.string().uuid(),
  type: z.nativeEnum(RoomType),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const createLocationSchema = z.object({
  worldId: z.string().uuid(),
  type: z.nativeEnum(LocationType),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
});

export const createFriendSchema = z.object({
  worldId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  relationship: z.nativeEnum(FriendRelation).optional(),
  personality: z.record(z.unknown()).optional(),
});

export type CreateWorldSchema = z.infer<typeof createWorldSchema>;
export type CreateResidenceSchema = z.infer<typeof createResidenceSchema>;
export type CreateRoomSchema = z.infer<typeof createRoomSchema>;
export type CreateLocationSchema = z.infer<typeof createLocationSchema>;
export type CreateFriendSchema = z.infer<typeof createFriendSchema>;
