import { FoundryClient } from "@adaptyv/foundry-sdk";
import { createMockFoundryClient } from "@adaptyv/foundry-sdk/mock";

export function useMockFromEnv(): boolean {
  const v = process.env.FOUNDRY_USE_MOCK?.toLowerCase().trim();
  return v === "1" || v === "true" || v === "yes";
}

export function createFoundryClientForMcp(): FoundryClient {
  if (useMockFromEnv()) {
    return createMockFoundryClient();
  }
  return new FoundryClient({});
}
