import type { GenerationProvider } from "./types.js";
import { higgsfieldProvider } from "./higgsfield.provider.js";
import { mockProvider } from "./mock.provider.js";

export type ProviderName = "mock" | "higgsfield";

export function getConfiguredProviderName(): ProviderName {
  const configured = process.env.GENERATION_PROVIDER?.toLowerCase();
  if (configured === "higgsfield") return "higgsfield";
  return "mock";
}

export function getActiveProvider(): GenerationProvider {
  const name = getConfiguredProviderName();
  if (name === "higgsfield") return higgsfieldProvider;
  return mockProvider;
}

export function isMockMode(): boolean {
  return getConfiguredProviderName() === "mock";
}
