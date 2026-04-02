import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { getMcpRequestId } from "./http/request-context.js";

export async function handleToolCall<T>(
  server: McpServer,
  fn: () => Promise<T>,
  options?: { hint?: string; binary?: boolean },
): Promise<CallToolResult> {
  try {
    const result = await fn();
    if (options?.binary && result instanceof ArrayBuffer) {
      const b64 = Buffer.from(result).toString("base64");
      return {
        content: [
          {
            type: "text",
            text: `[base64-encoded PDF, ${result.byteLength} bytes]\n${b64}`,
          },
        ],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const requestId = getMcpRequestId();
    const logPrefix = requestId
      ? `[adaptyv-foundry-mcp] requestId=${requestId}`
      : "[adaptyv-foundry-mcp]";
    if (err instanceof FoundryApiError) {
      const msg =
        typeof err.body === "object" &&
        err.body !== null &&
        "error" in err.body
          ? String((err.body as { error: string }).error)
          : JSON.stringify(err.body);
      const parts = [`Foundry API error (${err.status}): ${msg}`];
      if (options?.hint) parts.push(options.hint);
      const text = parts.join(". ");
      try {
        await server.sendLoggingMessage({
          level: "warning",
          data: {
            kind: "FoundryApiError",
            status: err.status,
            body: err.body,
            ...(requestId ? { requestId } : {}),
          },
        });
      } catch {
        /* client may not support logging */
      }
      console.error(logPrefix, text);
      return {
        isError: true,
        content: [{ type: "text", text }],
      };
    }
    try {
      await server.sendLoggingMessage({
        level: "error",
        data: {
          kind: "unexpected",
          message: String(err),
          ...(requestId ? { requestId } : {}),
        },
      });
    } catch {
      /* ignore */
    }
    console.error(logPrefix, "unexpected tool error", err);
    throw err;
  }
}
