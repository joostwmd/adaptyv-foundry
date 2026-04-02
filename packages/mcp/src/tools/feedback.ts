import type { FoundryClient } from "@adaptyv/foundry-sdk";
import { submitFeedbackInputSchema } from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const openWorld = { openWorldHint: true } as const;

export function registerFeedbackTools(
  server: McpServer,
  client: FoundryClient,
): void {
  server.registerTool(
    "submit_feedback",
    {
      description:
        "Submit product feedback or bug reports to Adaptyv (request UUID, type, title, optional human note and JSON context).",
      inputSchema: submitFeedbackInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, () => client.feedback.submit(args), {
        hint: "Include `request_uuid` and structured `json_body` when reporting API failures.",
      }),
  );
}
