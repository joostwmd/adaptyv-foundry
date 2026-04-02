import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  addSequencesInputSchema,
  getSequenceInputSchema,
  listSequencesForExperimentInputSchema,
  listSequencesInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;
const openWorld = { openWorldHint: true } as const;

export function registerSequenceTools(
  server: McpServer,
  client: FoundryClient,
): void {
  server.registerTool(
    "list_sequences",
    {
      description:
        "List sequences across experiments (paginated). Use `list_experiment_sequences` when you already know `experiment_id`.",
      inputSchema: listSequencesInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "list_sequences", () => client.sequences.list(args), {
        hint: "Adjust limit/offset or filter experiments first.",
      }),
  );

  server.registerTool(
    "get_sequence",
    {
      description:
        "Get one sequence by `sequence_id` including full AA string and parent experiment reference.",
      inputSchema: getSequenceInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "get_sequence", () => client.sequences.get(args), {
        hint: "Resolve `sequence_id` via `list_sequences` or `list_experiment_sequences`.",
      }),
  );

  server.registerTool(
    "add_sequences",
    {
      description:
        "Add amino-acid sequences to an experiment identified by `experiment_code`. Each entry can mark controls and optional metadata.",
      inputSchema: addSequencesInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, "add_sequences", () => client.sequences.add(args), {
        hint: "Use the experiment `code` from `list_experiments`; sequences must be valid protein sequences.",
      }),
  );

  server.registerTool(
    "list_experiment_sequences",
    {
      description:
        "List all sequences registered on a specific experiment (`experiment_id` + pagination).",
      inputSchema: listSequencesForExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "list_experiment_sequences", () => client.sequences.listForExperiment(args), {
        hint: "Confirm `experiment_id` via `list_experiments`.",
      }),
  );
}
