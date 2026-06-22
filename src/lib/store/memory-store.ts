import type {
  Campaign,
  CampaignStatus,
  CampaignType,
  Character,
  CharacterBible,
  CharacterStatus,
  CreationMode,
  Location,
  Occupation,
  Outfit,
  OutfitOccasion,
  Residence,
  ResidenceType,
  Room,
  RoomType,
  Routine,
  RoutineType,
} from "@prisma/client";
import type { StoredAsset, GenerationHistoryEntry } from "../../types/generation.js";
import type { WorldGraph } from "../../types/world.js";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface MemoryProductionBrief {
  id: string;
  characterId: string;
  campaignId?: string;
  contentType: string;
  intent: string;
  character: string;
  location: string;
  scene: string;
  wardrobe: string;
  mood: string;
  camera: string;
  platform: string;
  duration: number | null;
  theme: string;
  goal: string;
  campaign?: string;
  status: string;
  promptHidden: string;
  generationPayload: Record<string, unknown>;
  assembledFrom: Record<string, unknown>;
  createdAt: string;
}

export interface MemoryGenerationJob {
  id: string;
  characterId: string;
  campaignId?: string;
  type: string;
  status: JobStatus;
  provider: string;
  prompt: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  result?: { url?: string; assetId?: string };
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MemoryCharacterRecord {
  character: Character;
  bible: CharacterBible | null;
  occupation: Occupation | null;
  routines: Routine[];
  outfits: Outfit[];
  world: WorldGraph | null;
  campaigns: Campaign[];
}

const characters = new Map<string, MemoryCharacterRecord>();
const assets: StoredAsset[] = [];
const jobs: MemoryGenerationJob[] = [];
const briefs: MemoryProductionBrief[] = [];
const history: GenerationHistoryEntry[] = [];

export const DEMO_CHARACTER_ID =
  process.env.DEMO_CHARACTER_ID ?? "00000000-0000-4000-8000-000000000001";

export function useMemoryStorage(): boolean {
  return (
    process.env.GENERATION_PROVIDER === "mock" ||
    process.env.MOCK_GENERATION === "true" ||
    !process.env.DATABASE_URL
  );
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function makeCharacter(overrides: Partial<Character> & { name: string }): Character {
  const id = overrides.id ?? uuid();
  const created = new Date();
  return {
    id,
    userId: overrides.userId ?? "local-user",
    userProfileId: overrides.userProfileId ?? "local-profile",
    name: overrides.name,
    slug: overrides.slug ?? overrides.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    avatarUrl: overrides.avatarUrl ?? null,
    age: overrides.age ?? 23,
    birthday: overrides.birthday ?? null,
    status: overrides.status ?? ("ACTIVE" as CharacterStatus),
    creationMode: overrides.creationMode ?? ("QUICK" as CreationMode),
    contentNiche: overrides.contentNiche ?? "Lifestyle Creator",
    brandVoice: overrides.brandVoice ?? "Warm, aspirational, authentic",
    socialMediaStyle: overrides.socialMediaStyle ?? null,
    metadata: overrides.metadata ?? null,
    createdAt: overrides.createdAt ?? created,
    updatedAt: overrides.updatedAt ?? created,
  };
}

function makeBible(characterId: string, name: string): CharacterBible {
  const created = new Date();
  return {
    id: uuid(),
    characterId,
    version: 1,
    identity: { name, age: 23, languages: ["English", "Hindi"] },
    personality: { playful: 8, luxury: 7, feminine: 8, minimalist: 6 },
    home: { city: "Mumbai", neighborhood: "Powai" },
    socialCircle: { bestFriend: "Priya" },
    lifestyle: { niche: "Lifestyle Creator" },
    fashion: { hairStyle: "Soft waves", wardrobeStyle: "Minimalist chic", signatureLook: "Quiet luxury" },
    goals: { content: "Build authentic lifestyle brand" },
    dailyRoutine: { morning: "Coffee, skincare, apartment views" },
    favoritePlaces: ["Blue Tokai", "Powai Lake"],
    rawMarkdown: null,
    generatedAt: created,
    createdAt: created,
    updatedAt: created,
  };
}

function makeWorldGraph(characterId: string, name: string, city: string): WorldGraph {
  const worldId = uuid();
  const residenceId = uuid();
  const created = new Date();

  const world = {
    id: worldId,
    characterId,
    name: `${name}'s World`,
    city,
    country: "India",
    timezone: "Asia/Kolkata",
    culture: { vibe: "Urban cosmopolitan" },
    summary: `${name} lives in ${city} — a curated lifestyle world.`,
    isComplete: true,
    createdAt: created,
    updatedAt: created,
  };

  const residence: Residence & { rooms: Room[] } = {
    id: residenceId,
    worldId,
    neighborhood: city === "Mumbai" ? "Powai" : "Downtown",
    type: "APARTMENT" as ResidenceType,
    interiorStyle: "MODERN",
    description: `A sunlit apartment with floor-to-ceiling windows and warm neutral tones.`,
    address: null,
    floor: 12,
    squareMeters: 85,
    exteriorDescription: "Modern high-rise with glass facade",
    viewDescription: "City skyline and lake views",
    imageUrl: null,
    promptId: null,
    createdAt: created,
    updatedAt: created,
    rooms: [
      {
        id: uuid(),
        residenceId,
        type: "BEDROOM" as RoomType,
        name: "Bedroom",
        description: "Soft morning light, linen bedding, minimalist decor",
        designDetails: { palette: "beige, cream, warm wood" },
        story: "Where morning content begins",
        imageUrl: null,
        promptId: null,
        sortOrder: 0,
        createdAt: created,
        updatedAt: created,
      },
      {
        id: uuid(),
        residenceId,
        type: "LIVING_ROOM" as RoomType,
        name: "Living Room",
        description: "Open plan living with plants and natural textures",
        designDetails: null,
        story: null,
        imageUrl: null,
        promptId: null,
        sortOrder: 1,
        createdAt: created,
        updatedAt: created,
      },
    ],
  };

  const locations: Location[] = [
    {
      id: uuid(),
      worldId,
      type: "CAFE",
      name: "Blue Tokai",
      description: "Favorite weekend coffee spot",
      address: null,
      story: "Morning ritual cafe",
      visitFrequency: "WEEKLY",
      isFavorite: true,
      relationship: "Morning ritual cafe",
      imageUrl: null,
      promptId: null,
      createdAt: created,
      updatedAt: created,
    },
    {
      id: uuid(),
      worldId,
      type: "GYM",
      name: "Fitness First Powai",
      description: "Weekday workout spot",
      address: null,
      story: null,
      visitFrequency: "WEEKLY",
      isFavorite: false,
      relationship: "Fitness routine",
      imageUrl: null,
      promptId: null,
      createdAt: created,
      updatedAt: created,
    },
  ];

  return {
    world,
    residence,
    locations,
    friends: [],
    pets: [],
    worldEvents: [],
  };
}

function makeOutfits(characterId: string): Outfit[] {
  const created = new Date();
  return [
    {
      id: uuid(),
      characterId,
      name: "Oversized Beige Sweater",
      description: "Cozy luxury loungewear for morning posts",
      occasion: "LOUNGE" as OutfitOccasion,
      items: [{ item: "Cashmere sweater", brand: "Quiet luxury" }],
      brands: ["Minimalist chic"],
      hairStyle: "Soft waves",
      makeup: "Natural glow",
      imageUrl: null,
      promptId: null,
      createdAt: created,
      updatedAt: created,
    },
    {
      id: uuid(),
      characterId,
      name: "Street Style Set",
      description: "Casual city outfit for cafe content",
      occasion: "CASUAL" as OutfitOccasion,
      items: [{ item: "Linen blazer", brand: "Contemporary" }],
      brands: [],
      hairStyle: null,
      makeup: null,
      imageUrl: null,
      promptId: null,
      createdAt: created,
      updatedAt: created,
    },
  ];
}

function makeRoutines(characterId: string, locationId?: string): Routine[] {
  const created = new Date();
  return [
    {
      id: uuid(),
      characterId,
      type: "MORNING" as RoutineType,
      title: "Monday Morning",
      description: "Slow morning routine at home",
      schedule: { days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      locationId: locationId ?? null,
      createdAt: created,
      updatedAt: created,
    },
  ];
}

function makeCampaign(characterId: string, title: string, goal: string): Campaign {
  const created = new Date();
  return {
    id: uuid(),
    characterId,
    title,
    type: "WEEKLY" as CampaignType,
    goal,
    platform: ["INSTAGRAM"],
    startDate: created,
    endDate: new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: "ACTIVE" as CampaignStatus,
    brief: { theme: title, focus: "Lifestyle authenticity" },
    brandDealId: null,
    createdAt: created,
    updatedAt: created,
  };
}

function seedMimi(): void {
  if (characters.has(DEMO_CHARACTER_ID)) return;

  const character = makeCharacter({
    id: DEMO_CHARACTER_ID,
    name: "Mimi",
    age: 23,
    contentNiche: "Lifestyle Creator",
    brandVoice: "Warm, aspirational",
  });
  const bible = makeBible(DEMO_CHARACTER_ID, "Mimi");
  const world = makeWorldGraph(DEMO_CHARACTER_ID, "Mimi", "Mumbai");
  const outfits = makeOutfits(DEMO_CHARACTER_ID);
  const routines = makeRoutines(DEMO_CHARACTER_ID, world.locations[0]?.id);
  const campaign = makeCampaign(DEMO_CHARACTER_ID, "Monsoon in Mumbai", "Authentic lifestyle content");

  characters.set(DEMO_CHARACTER_ID, {
    character,
    bible,
    occupation: {
      id: uuid(),
      characterId: DEMO_CHARACTER_ID,
      title: "Marketing Executive",
      company: "Creative Agency",
      description: "Brand marketing and content strategy",
      industry: "Marketing",
      income: null,
      workStyle: "HYBRID",
      workplaceLocationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    routines,
    outfits,
    world,
    campaigns: [campaign],
  });
}

seedMimi();

export const memoryStore = {
  getCharacter(characterId: string): MemoryCharacterRecord | undefined {
    return characters.get(characterId);
  },

  listCharacters(): MemoryCharacterRecord[] {
    return Array.from(characters.values());
  },

  createQuickCharacter(input: {
    name: string;
    age?: number;
    contentNiche?: string;
    city?: string;
  }): MemoryCharacterRecord {
    const character = makeCharacter({
      name: input.name,
      age: input.age ?? 23,
      contentNiche: input.contentNiche ?? "Lifestyle Creator",
      creationMode: "QUICK",
    });
    const bible = makeBible(character.id, input.name);
    const world = makeWorldGraph(character.id, input.name, input.city ?? "Mumbai");
    const outfits = makeOutfits(character.id);
    const routines = makeRoutines(character.id, world.locations[0]?.id);
    const campaign = makeCampaign(
      character.id,
      `${input.name}'s Launch Week`,
      "Establish character voice and visual identity"
    );

    const record: MemoryCharacterRecord = {
      character,
      bible,
      occupation: {
        id: uuid(),
        characterId: character.id,
        title: "Content Creator",
        company: "Independent",
        description: "Lifestyle content creation",
        industry: "Media",
        income: null,
        workStyle: "REMOTE",
        workplaceLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      routines,
      outfits,
      world,
      campaigns: [campaign],
    };

    characters.set(character.id, record);
    return record;
  },

  getActiveCampaign(characterId: string): Campaign | undefined {
    const record = characters.get(characterId);
    return record?.campaigns.find((c) => c.status === "ACTIVE") ?? record?.campaigns[0];
  },

  addAsset(asset: StoredAsset): StoredAsset {
    assets.unshift(asset);
    return asset;
  },

  listAssets(characterId: string): StoredAsset[] {
    return assets.filter((a) => a.characterId === characterId);
  },

  getAsset(assetId: string): StoredAsset | undefined {
    return assets.find((a) => a.id === assetId);
  },

  addJob(job: MemoryGenerationJob): MemoryGenerationJob {
    jobs.unshift(job);
    return job;
  },

  updateJob(id: string, patch: Partial<MemoryGenerationJob>): MemoryGenerationJob | undefined {
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    jobs[idx] = { ...jobs[idx], ...patch };
    return jobs[idx];
  },

  getJob(id: string): MemoryGenerationJob | undefined {
    return jobs.find((j) => j.id === id);
  },

  listJobs(characterId: string): MemoryGenerationJob[] {
    return jobs.filter((j) => j.characterId === characterId);
  },

  addBrief(brief: MemoryProductionBrief): MemoryProductionBrief {
    briefs.unshift(brief);
    return brief;
  },

  getBrief(id: string): MemoryProductionBrief | undefined {
    return briefs.find((b) => b.id === id);
  },

  addHistory(entry: GenerationHistoryEntry): void {
    history.unshift(entry);
  },

  getHistory(characterId: string): GenerationHistoryEntry[] {
    return history.filter((h) => h.characterId === characterId);
  },
};
