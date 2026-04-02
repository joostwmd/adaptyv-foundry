import { FoundryClient } from "@adaptyv/foundry-sdk";
import { createMockFoundryClient } from "@adaptyv/foundry-sdk/mock";

export function useMockFromEnv(): boolean {
  const v = process.env.FOUNDRY_USE_MOCK?.toLowerCase().trim();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Always required — same contract in mock and live mode. Mock mode does not send it over the network;
 * live mode uses it as the Foundry API bearer token.
 */
export function requireFoundryApiToken(): string {
  const v = process.env.FOUNDRY_API_TOKEN?.trim();
  if (!v) {
    throw new Error(
      "FOUNDRY_API_TOKEN is required in the environment (set for every process: mock mode only swaps the in-memory client; the variable must still be present).",
    );
  }
  return v;
}

export function createFoundryClientForMcp(): FoundryClient {
  const apiKey = requireFoundryApiToken();
  if (useMockFromEnv()) {
    return createMockFoundryClient();
  }
  return new FoundryClient({ apiKey });
}
