/**
 * Character Bible module — thin wrapper over character + bible services.
 * @see docs/architecture/MODULE_ARCHITECTURE.md
 */
export { characterService, CharacterService } from "../../services/character.service.js";
export { bibleService, BibleService } from "../../services/bible.service.js";

import { characterService } from "../../services/character.service.js";
import { bibleService } from "../../services/bible.service.js";

/** Module-facing facade combining character identity and bible lifecycle. */
export const characterBibleService = {
  getById: (characterId: string) => characterService.findById(characterId),
  create: characterService.create.bind(characterService),
  update: characterService.update.bind(characterService),
  listByUser: characterService.listByUser.bind(characterService),
  getBible: (characterId: string) => bibleService.get(characterId),
  generateBible: (characterId: string, regenerate?: boolean) =>
    bibleService.createOrUpdate(characterId, regenerate),
};
