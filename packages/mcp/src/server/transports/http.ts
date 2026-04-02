import { serve } from "@hono/node-server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { createFoundryClientForMcp, useMockFromEnv } from "../../foundry-client.js";
import {
  allowedOriginsMiddleware,
  mcpHttpBearerAuthMiddleware,
} from "../http/middleware/http-gateway.js";
import { requestIdMiddleware } from "../http/middleware/request-id.js";
import { mcpHttpRequestStore, type HttpGatewayVariables } from "../http/request-context.js";
import { createMcpServer } from "../mcp-server.js";

function parseAllowedOrigins(raw: string | undefined): Set<string> {
  if (!raw?.trim()) {
    return new Set();
  }
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export async function startHttp(): Promise<void> {
  const mcpHttpKey = process.env.MCP_HTTP_API_KEY?.trim();
  if (!mcpHttpKey) {
    throw new Error(
      "MCP_HTTP_API_KEY is required when MODE=http. Clients must send Authorization: Bearer <same value>.",
    );
  }

  const port = Number(process.env.PORT ?? "3333");
  const host = process.env.HOST ?? "127.0.0.1";
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

  if (useMockFromEnv()) {
    console.error(
      "[adaptyv-foundry-mcp] FOUNDRY_USE_MOCK: using in-memory mock client (no Foundry HTTP).",
    );
  }
  console.error(
    "[adaptyv-foundry-mcp] MCP_HTTP_API_KEY: Bearer auth required on /mcp.",
  );
  const foundryClient = createFoundryClientForMcp();

  const app = new Hono<{ Variables: HttpGatewayVariables }>();

  app.use("*", requestIdMiddleware);
  app.use("*", allowedOriginsMiddleware(allowedOrigins));

  app.get("/health", (c) => {
    c.header("X-Request-Id", c.get("requestId"));
    return c.json({ status: "ok", service: "adaptyv-foundry-mcp" });
  });

  app.use("/mcp", mcpHttpBearerAuthMiddleware());

  app.all("/mcp", async (c) => {
    const requestId = c.get("requestId");
    return mcpHttpRequestStore.run({ requestId }, async () => {
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      const server = createMcpServer(foundryClient);
      await server.connect(transport);
      const res = await transport.handleRequest(c.req.raw);
      const headers = new Headers(res.headers);
      headers.set("X-Request-Id", requestId);
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    });
  });

  serve({ fetch: app.fetch, port, hostname: host }, (info) => {
    console.error(
      `[adaptyv-foundry-mcp] HTTP listening on http://${host}:${info.port} (MCP: /mcp)`,
    );
  });
}
