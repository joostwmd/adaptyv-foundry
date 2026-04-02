import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  getCustomTargetRequestInputSchema,
  getTargetInputSchema,
  listCustomTargetRequestsInputSchema,
  listTargetsInputSchema,
  requestCustomTargetInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;
const openWorld = { openWorldHint: true } as const;

export function registerTargetTools(server: McpServer, client: FoundryClient): void {
  server.registerTool(
    "list_targets",
    {
      description:
        "Search catalog protein targets available for Foundry experiments. Returns a paginated list with IDs, vendors, and UniProt IDs. If you only have a target name, call this first to resolve `target_id` for `create_experiment`.",
      inputSchema: listTargetsInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.targets.list(args), {
        hint: "Try another search term, relax filters, or adjust limit/offset.",
      }),
  );

  server.registerTool(
    "get_target",
    {
      description:
        "Fetch full details for one catalog target by `target_id` (from `list_targets`). Includes optional pricing/details when available.",
      inputSchema: getTargetInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.targets.get(args), {
        hint: "Verify `target_id` via `list_targets` — IDs are UUIDs.",
      }),
  );

  server.registerTool(
    "list_custom_target_requests",
    {
      description:
        "List custom antigen / target requests submitted by your organization (pending review, approved, etc.).",
      inputSchema: listCustomTargetRequestsInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.targets.listCustomRequests(args), {
        hint: "Use pagination or check permissions if the list is empty.",
      }),
  );

  server.registerTool(
    "get_custom_target_request",
    {
      description:
        "Get one custom target request by `request_id` (from `list_custom_target_requests`).",
      inputSchema: getCustomTargetRequestInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.targets.getCustomRequest(args), {
        hint: "Confirm `request_id` from `list_custom_target_requests`.",
      }),
  );

  server.registerTool(
    "request_custom_target",
    {
      description:
        "Submit a new custom target / antigen request (sequence, vendor link, optional PDB). Creates a pending review request.",
      inputSchema: requestCustomTargetInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, () => client.targets.requestCustom(args), {
        hint: "Ensure required fields (name, product_id, sequence) are valid per API validation errors.",
      }),
  );
}
