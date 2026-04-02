import type { JSONRPCMessage, MessageExtraInfo } from "@modelcontextprotocol/sdk/types.js";
import { getMcpLastInvokedTool } from "./request-context.js";

const LOG_PREFIX = "[adaptyv-foundry-mcp]";

type TransportWithCallbacks = {
  onmessage?: (message: JSONRPCMessage, extra?: MessageExtraInfo) => void;
  onerror?: (error: Error) => void;
};

function safeJsonLine(obj: Record<string, unknown>): string {
  return `${LOG_PREFIX} ${JSON.stringify(obj)}`;
}

/** Redacted summary of an inbound JSON-RPC message (no tool arguments or tokens). */
export function summarizeInboundMcpMessage(message: JSONRPCMessage): Record<string, unknown> {
  if ("method" in message && typeof message.method === "string") {
    const row: Record<string, unknown> = {
      kind: "rpc",
      method: message.method,
    };
    if ("id" in message && message.id !== undefined && message.id !== null) {
      row.rpcId = message.id;
    } else {
      row.notification = true;
    }
    if (message.method === "tools/call" && "params" in message && message.params && typeof message.params === "object") {
      const name = (message.params as { name?: unknown }).name;
      if (typeof name === "string") {
        row.tool = name;
      }
    }
    if (message.method === "initialize" && "params" in message && message.params && typeof message.params === "object") {
      const clientInfo = (message.params as { clientInfo?: { name?: string; version?: string } }).clientInfo;
      if (clientInfo?.name) {
        row.clientName = clientInfo.name;
      }
      if (clientInfo?.version) {
        row.clientVersion = clientInfo.version;
      }
    }
    return row;
  }
  if ("result" in message) {
    return { kind: "rpc_result", rpcId: message.id };
  }
  if ("error" in message) {
    return {
      kind: "rpc_error",
      rpcId: message.id,
      errorCode: message.error?.code,
      errorMessage: message.error?.message,
    };
  }
  return { kind: "rpc_unknown" };
}

/**
 * Log each inbound MCP JSON-RPC message. Install on the transport **before** `server.connect(transport)`
 * so the SDK chains your handler ahead of protocol handling.
 */
export function attachMcpInboundTransportLogging(
  transport: TransportWithCallbacks,
  meta: { requestId?: string; channel: "http" | "stdio" },
): void {
  const prevOnMessage = transport.onmessage;
  transport.onmessage = (message: JSONRPCMessage, extra?: MessageExtraInfo) => {
    const summary = summarizeInboundMcpMessage(message);
    const sessionFromHeader =
      extra?.requestInfo?.headers &&
      (extra.requestInfo.headers["mcp-session-id"] ?? extra.requestInfo.headers["Mcp-Session-Id"]);
    console.log(
      safeJsonLine({
        event: "mcp_inbound_message",
        channel: meta.channel,
        ...(meta.requestId ? { requestId: meta.requestId } : {}),
        ...(typeof sessionFromHeader === "string" ? { mcpSessionId: sessionFromHeader } : {}),
        ...summary,
      }),
    );
    prevOnMessage?.(message, extra);
  };

  const prevOnError = transport.onerror;
  transport.onerror = (error: Error) => {
    console.log(
      safeJsonLine({
        event: "mcp_transport_error",
        channel: meta.channel,
        ...(meta.requestId ? { requestId: meta.requestId } : {}),
        message: error.message,
        name: error.name,
      }),
    );
    prevOnError?.(error);
  };
}

/** One line per HTTP exchange to `/mcp` (method, timing, status). */
export function logMcpHttpExchangeStart(requestId: string, req: Request): void {
  const url = new URL(req.url);
  console.log(
    safeJsonLine({
      event: "mcp_http_request_start",
      channel: "http",
      requestId,
      httpMethod: req.method,
      path: url.pathname,
      mcpSessionId: req.headers.get("mcp-session-id") ?? undefined,
      mcpProtocolVersion: req.headers.get("mcp-protocol-version") ?? undefined,
      contentType: req.headers.get("content-type") ?? undefined,
      userAgent: truncate(req.headers.get("user-agent") ?? undefined, 200),
    }),
  );
}

export function logMcpHttpExchangeEnd(
  requestId: string,
  startedAtMs: number,
  res: Response,
): void {
  const tool = getMcpLastInvokedTool();
  console.log(
    safeJsonLine({
      event: "mcp_http_request_complete",
      channel: "http",
      requestId,
      httpStatus: res.status,
      durationMs: Math.round(performance.now() - startedAtMs),
      responseContentType: res.headers.get("content-type") ?? undefined,
      ...(tool ? { tool } : {}),
    }),
  );
}

function truncate(s: string | undefined, max: number): string | undefined {
  if (s === undefined) {
    return undefined;
  }
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}
