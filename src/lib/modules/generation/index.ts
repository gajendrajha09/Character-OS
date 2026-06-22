/**
 * Generation layer — thin wrapper over AI generation router + Higgsfield MCP client.
 */
export {
  routeGeneration,
  estimateCredits,
  providersForType,
  ROUTING,
} from "../../ai/generation-router.js";
export {
  mcpGenerationClient,
  MCPGenerationClient,
} from "../../ai/mcp/generation-client.js";
export {
  allProviders,
  higgsfieldMCPProvider,
  openaiProvider,
  falProvider,
  replicateProvider,
} from "../../ai/providers/index.js";
export type { GenerationProvider } from "../../ai/providers/types.js";

import { routeGeneration } from "../../ai/generation-router.js";
import { mcpGenerationClient } from "../../ai/mcp/generation-client.js";

/** Module-facing MCP bridge alias. */
export const mcpBridge = {
  dispatchFromBrief: (
    briefId: string,
    characterId: string,
    generationPayload: Record<string, unknown>,
    promptHidden: string
  ) => mcpGenerationClient.sendFromBriefPayload(briefId, characterId, generationPayload, promptHidden),
  route: routeGeneration,
};
