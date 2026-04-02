import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  attenuateTokenInputSchema,
  listTokensInputSchema,
  revokeTokenInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;
const openWorld = { openWorldHint: true } as const;
const destructive = { destructiveHint: true, openWorldHint: true } as const;

export function registerTokenTools(server: McpServer, client: FoundryClient): void {
  server.registerTool(
    "list_tokens",
    {
      description:
        "List API tokens for the current account (root and attenuated). Sensitive — use for admin workflows only.",
      inputSchema: listTokensInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, () => client.tokens.list(args), {
        hint: "Requires a token with permission to list tokens.",
      }),
  );

  server.registerTool(
    "attenuate_token",
    {
      description:
        "Create a child token with restricted capabilities from a parent token string. Returns new token value once.",
      inputSchema: attenuateTokenInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, () => client.tokens.attenuate(args), {
        hint: "Parent token must allow attenuation; store the returned token securely.",
      }),
  );

  server.registerTool(
    "revoke_token",
    {
      description:
        "Revoke the current bearer token used by this MCP server session and revoke its children. Destructive — the server may stop working until restarted with a new `FOUNDRY_API_TOKEN`.",
      inputSchema: revokeTokenInputSchema.shape,
      annotations: destructive,
    },
    async (args) =>
      handleToolCall(server, () => client.tokens.revoke(args), {
        hint: "After revoke, subsequent Foundry calls with this server identity will fail until credentials are rotated.",
      }),
  );
}
