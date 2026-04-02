import type { FoundryClient } from "@adaptyv/foundry-sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { MockedFunction } from "vitest";
import { vi } from "vitest";
import { createMcpServer } from "../src/server.js";

type AsyncFn = MockedFunction<(...args: unknown[]) => Promise<unknown>>;

/** Minimal `FoundryClient` with every SDK method mockable in tests. */
export type MockFoundryClient = FoundryClient & {
  targets: {
    list: AsyncFn;
    get: AsyncFn;
    listCustomRequests: AsyncFn;
    getCustomRequest: AsyncFn;
    requestCustom: AsyncFn;
  };
  experiments: {
    list: AsyncFn;
    create: AsyncFn;
    get: AsyncFn;
    update: AsyncFn;
    submit: AsyncFn;
    estimateCost: AsyncFn;
    getInvoice: AsyncFn;
    getQuote: AsyncFn;
    confirmQuote: AsyncFn;
    getQuotePdf: AsyncFn;
  };
  sequences: {
    list: AsyncFn;
    get: AsyncFn;
    add: AsyncFn;
    listForExperiment: AsyncFn;
  };
  results: {
    list: AsyncFn;
    get: AsyncFn;
    listForExperiment: AsyncFn;
  };
  quotes: {
    list: AsyncFn;
    get: AsyncFn;
    confirm: AsyncFn;
    reject: AsyncFn;
  };
  updates: {
    list: AsyncFn;
    listForExperiment: AsyncFn;
  };
  tokens: {
    list: AsyncFn;
    attenuate: AsyncFn;
    revoke: AsyncFn;
  };
  feedback: {
    submit: AsyncFn;
  };
};

export function createMockClient(): MockFoundryClient {
  const fn = () => vi.fn().mockResolvedValue({}) as AsyncFn;
  return {
    targets: {
      list: fn(),
      get: fn(),
      listCustomRequests: fn(),
      getCustomRequest: fn(),
      requestCustom: fn(),
    },
    experiments: {
      list: fn(),
      create: fn(),
      get: fn(),
      update: fn(),
      submit: fn(),
      estimateCost: fn(),
      getInvoice: fn(),
      getQuote: fn(),
      confirmQuote: fn(),
      getQuotePdf: fn(),
    },
    sequences: {
      list: fn(),
      get: fn(),
      add: fn(),
      listForExperiment: fn(),
    },
    results: {
      list: fn(),
      get: fn(),
      listForExperiment: fn(),
    },
    quotes: {
      list: fn(),
      get: fn(),
      confirm: fn(),
      reject: fn(),
    },
    updates: {
      list: fn(),
      listForExperiment: fn(),
    },
    tokens: {
      list: fn(),
      attenuate: fn(),
      revoke: fn(),
    },
    feedback: {
      submit: fn(),
    },
  } as unknown as MockFoundryClient;
}

export async function withMcpSession(
  mockClient: FoundryClient,
  run: (client: Client) => Promise<void>,
): Promise<void> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const mcpServer = createMcpServer(mockClient);
  await mcpServer.connect(serverSide);
  const client = new Client(
    { name: "adaptyv-foundry-mcp-test", version: "0.0.0" },
    { capabilities: {} },
  );
  await client.connect(clientSide);
  try {
    await run(client);
  } finally {
    await client.close();
    await mcpServer.close();
  }
}
