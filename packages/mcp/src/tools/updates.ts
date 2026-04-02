import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  listUpdatesForExperimentInputSchema,
  listUpdatesInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;

export function registerUpdateTools(server: McpServer, client: FoundryClient): void {
  server.registerTool(
    "list_updates",
    {
      description:
        "List timeline / audit updates across experiments (created, submitted, quote sent, etc.). Paginated.",
      inputSchema: listUpdatesInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.updates.list(args), {
        hint: "Adjust limit/offset; scope to one experiment via `list_experiment_updates`.",
      }),
  );

  server.registerTool(
    "list_experiment_updates",
    {
      description:
        "List timeline updates for a single experiment (`experiment_id`).",
      inputSchema: listUpdatesForExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.updates.listForExperiment(args), {
        hint: "Confirm `experiment_id` from `list_experiments`.",
      }),
  );
}
