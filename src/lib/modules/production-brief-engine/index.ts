/**
 * Production Brief Engine — thin wrapper over production-brief service + AI layer.
 */
export {
  productionBriefService,
  ProductionBriefService,
} from "../../services/production-brief.service.js";
export { assembleBrief } from "../../ai/brief-assembler.js";
export { loadCharacterContext, slugify } from "../../ai/context-builder.js";
export { parseIntent } from "../../ai/intent-parser.js";

import { productionBriefService } from "../../services/production-brief.service.js";

export const productionBriefEngine = {
  assemble: productionBriefService.generate.bind(productionBriefService),
  parseIntent: productionBriefService.parseIntent.bind(productionBriefService),
  getById: productionBriefService.findById.bind(productionBriefService),
  listByCharacter: productionBriefService.listByCharacter.bind(productionBriefService),
  update: productionBriefService.update.bind(productionBriefService),
  generateFromBrief: productionBriefService.triggerGeneration.bind(productionBriefService),
};
