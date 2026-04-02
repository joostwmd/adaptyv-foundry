import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  getResultInputSchema,
  listResultsForExperimentInputSchema,
  listResultsInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;

export function registerResultTools(server: McpServer, client: FoundryClient): void {
  server.registerTool(
    "list_results",
    {
      description:
        "List characterization results (affinity, thermostability, etc.) across experiments. Paginated.",
      inputSchema: listResultsInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.results.list(args), {
        hint: "Use pagination; narrow by experiment via `list_experiment_results`.",
      }),
  );

  server.registerTool(
    "get_result",
    {
      description:
        "Fetch one result record by `result_id` (summary, metadata, data package URL).",
      inputSchema: getResultInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.results.get(args), {
        hint: "Obtain `result_id` from `list_results` or `list_experiment_results`.",
      }),
  );

  server.registerTool(
    "list_experiment_results",
    {
      description:
        "List all results attached to a single experiment (`experiment_id`).",
      inputSchema: listResultsForExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.results.listForExperiment(args), {
        hint: "Ensure the experiment has completed enough workflow for results to exist.",
      }),
  );
}
