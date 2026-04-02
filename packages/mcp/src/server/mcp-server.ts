import { FoundryClient } from "@adaptyv/foundry-sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../tools/index.js";

const SERVER_INSTRUCTIONS = `You are connected to the Adaptyv Foundry API via MCP tools.
Use list_* tools to discover IDs before calling get_*.
Experiment types include: screening, affinity, thermostability, fluorescence, expression.
Experiment statuses progress from draft through production to done; check updates for timelines.`;

export function createMcpServer(client: FoundryClient): McpServer {
  const server = new McpServer(
    { name: "adaptyv-foundry", version: "0.1.0" },
    {
      capabilities: {
        logging: {},
      },
      instructions: SERVER_INSTRUCTIONS,
    },
  );
  registerAllTools(server, client);
  return server;
}
