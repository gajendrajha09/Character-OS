/**
 * World Builder module — thin wrapper over world service (World, Residence, Room).
 */
export { worldService, WorldService } from "../../services/world.service.js";

import { worldService } from "../../services/world.service.js";

export const worldBuilderService = {
  getWorldGraph: (characterId: string) => worldService.getWorldGraph(characterId),
  createWorld: worldService.createWorld.bind(worldService),
  createResidence: worldService.addResidence.bind(worldService),
  createRoom: worldService.addRoom.bind(worldService),
  ensureWorldShell: worldService.ensureWorldShell.bind(worldService),
  markComplete: worldService.markComplete.bind(worldService),
};
