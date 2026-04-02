import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  confirmStandaloneQuoteInputSchema,
  getQuoteInputSchema,
  listQuotesInputSchema,
  rejectQuoteInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;
const openWorld = { openWorldHint: true } as const;

export function registerQuoteTools(server: McpServer, client: FoundryClient): void {
  server.registerTool(
    "list_quotes",
    {
      description:
        "List standalone quotes for the organization (paginated). Distinct from per-experiment quotes — use `get_experiment_quote` for experiment-scoped quotes.",
      inputSchema: listQuotesInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.quotes.list(args), {
        hint: "Try pagination; quotes may be empty if none were issued.",
      }),
  );

  server.registerTool(
    "get_quote",
    {
      description:
        "Get full quote detail by `quote_id` including line items, totals, and Stripe quote URL.",
      inputSchema: getQuoteInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.quotes.get(args), {
        hint: "Use `list_quotes` to discover `quote_id` values.",
      }),
  );

  server.registerTool(
    "confirm_quote",
    {
      description:
        "Accept a standalone quote (`quote_id`). Optional PO number and notes.",
      inputSchema: confirmStandaloneQuoteInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, () => client.quotes.confirm(args), {
        hint: "Quote must be `open`; use `get_quote` to verify status.",
      }),
  );

  server.registerTool(
    "reject_quote",
    {
      description:
        "Reject a standalone quote with a reason enum (price, scope, timeline, budget, other) and optional feedback text.",
      inputSchema: rejectQuoteInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, () => client.quotes.reject(args), {
        hint: "Only open quotes can typically be rejected.",
      }),
  );
}
