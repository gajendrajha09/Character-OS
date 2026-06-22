import { z } from "zod";

const bibleSectionSchema = z.record(z.unknown());

export const generateBibleSchema = z.object({
  regenerate: z.boolean().optional().default(false),
  sections: z
    .array(
      z.enum([
        "identity",
        "personality",
        "home",
        "socialCircle",
        "lifestyle",
        "fashion",
        "goals",
        "dailyRoutine",
        "favoritePlaces",
      ])
    )
    .optional(),
});

export const updateBibleSchema = z.object({
  identity: bibleSectionSchema.optional(),
  personality: bibleSectionSchema.optional(),
  home: bibleSectionSchema.optional(),
  socialCircle: bibleSectionSchema.optional(),
  lifestyle: bibleSectionSchema.optional(),
  fashion: bibleSectionSchema.optional(),
  goals: bibleSectionSchema.optional(),
  dailyRoutine: bibleSectionSchema.optional(),
  favoritePlaces: bibleSectionSchema.optional(),
  rawMarkdown: z.string().optional(),
});

export type GenerateBibleSchema = z.infer<typeof generateBibleSchema>;
export type UpdateBibleSchema = z.infer<typeof updateBibleSchema>;
