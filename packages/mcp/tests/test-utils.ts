import type { FoundryClient } from "@adaptyv/foundry-sdk";
import { createMockFoundryClient } from "@adaptyv/foundry-sdk/mock";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/server/mcp-server.js";

export { createMockFoundryClient };

export async function withMcpSession(
  foundryClient: FoundryClient,
  run: (client: Client) => Promise<void>,
): Promise<void> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const mcpServer = createMcpServer(foundryClient);
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
