export type { GenerationProvider } from "./types.js";
export { higgsfieldProvider, HiggsfieldProvider } from "./higgsfield.provider.js";
export { mockProvider, MockProvider } from "./mock.provider.js";
export { getActiveProvider, getConfiguredProviderName, isMockMode } from "./provider-factory.js";
export { higgsfieldMCPProvider, HiggsfieldMCPProvider } from "./higgsfield-mcp.provider.js";
export { openaiProvider, OpenAIProvider } from "./openai.provider.js";
export { falProvider, FalProvider } from "./fal.provider.js";
export { replicateProvider, ReplicateProvider } from "./replicate.provider.js";

import { adaptLegacyProvider } from "./legacy-adapter.js";
import { falProvider } from "./fal.provider.js";
import { higgsfieldProvider } from "./higgsfield.provider.js";
import { mockProvider } from "./mock.provider.js";
import { openaiProvider } from "./openai.provider.js";
import { replicateProvider } from "./replicate.provider.js";
import { getActiveProvider } from "./provider-factory.js";

/** Primary provider chain — mock or Higgsfield first for visual content. */
export const allProviders = [
  mockProvider,
  higgsfieldProvider,
  adaptLegacyProvider(falProvider),
  adaptLegacyProvider(replicateProvider),
  adaptLegacyProvider(openaiProvider),
];

export { getActiveProvider as primaryProvider };
