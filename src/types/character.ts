import type {
  Character,
  CharacterBible,
  CharacterStatus,
  CreationMode,
  Hobby,
  Occupation,
  Outfit,
  Routine,
} from "@prisma/client";

export type { Character, CharacterBible, CharacterStatus, CreationMode, Hobby, Occupation, Outfit, Routine };

export interface CreateCharacterInput {
  userId: string;
  userProfileId: string;
  name: string;
  age?: number;
  contentNiche?: string;
  brandVoice?: string;
  creationMode?: CreationMode;
  metadata?: Record<string, unknown>;
}

export interface UpdateCharacterInput {
  name?: string;
  age?: number;
  avatarUrl?: string;
  status?: CharacterStatus;
  contentNiche?: string;
  brandVoice?: string;
  socialMediaStyle?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CharacterWithRelations extends Character {
  bible?: CharacterBible | null;
  occupation?: Occupation | null;
  routines?: Routine[];
  hobbies?: Hobby[];
  outfits?: Outfit[];
}

export interface PersonalityTraits {
  playful?: number;
  luxury?: number;
  feminine?: number;
  minimalist?: number;
  adventure?: number;
  confident?: number;
  reserved?: number;
  [key: string]: number | undefined;
}
