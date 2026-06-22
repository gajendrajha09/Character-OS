import type {
  Friend,
  Location,
  Pet,
  Residence,
  Room,
  World,
  WorldEvent,
} from "@prisma/client";

export type { Friend, Location, Pet, Residence, Room, World, WorldEvent };

export interface CreateWorldInput {
  characterId: string;
  name: string;
  city: string;
  country?: string;
  timezone?: string;
  culture?: Record<string, unknown>;
  summary?: string;
}

export interface CreateResidenceInput {
  worldId: string;
  neighborhood: string;
  type?: Residence["type"];
  interiorStyle?: Residence["interiorStyle"];
  description: string;
  address?: string;
}

export interface CreateRoomInput {
  residenceId: string;
  type: Room["type"];
  name: string;
  description: string;
  sortOrder?: number;
}

export interface CreateLocationInput {
  worldId: string;
  type: Location["type"];
  name: string;
  description: string;
  visitFrequency?: Location["visitFrequency"];
}

export interface CreateFriendInput {
  worldId: string;
  name: string;
  description: string;
  relationship?: Friend["relationship"];
  personality?: Record<string, unknown>;
}

export interface WorldGraph {
  world: World;
  residence: (Residence & { rooms: Room[] }) | null;
  locations: Location[];
  friends: Friend[];
  pets: Pet[];
  worldEvents: WorldEvent[];
}
