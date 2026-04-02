import { AsyncLocalStorage } from "node:async_hooks";

/** Hono `Variables` bag for HTTP gateway (request id middleware). */
export type HttpGatewayVariables = {
  requestId: string;
};

export type McpHttpRequestContext = {
  requestId: string;
  /** Set when an MCP tool handler runs (HTTP mode); used for completion logs. */
  lastToolName?: string;
};

/** Per-HTTP-request context for MCP tool execution (stdio has no store). */
export const mcpHttpRequestStore = new AsyncLocalStorage<McpHttpRequestContext>();

export function getMcpRequestId(): string | undefined {
  return mcpHttpRequestStore.getStore()?.requestId;
}

export function recordMcpToolInvocation(toolName: string): void {
  const ctx = mcpHttpRequestStore.getStore();
  if (ctx) {
    ctx.lastToolName = toolName;
  }
}

export function getMcpLastInvokedTool(): string | undefined {
  return mcpHttpRequestStore.getStore()?.lastToolName;
}
