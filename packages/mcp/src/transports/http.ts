import { FoundryClient } from "@adaptyv/foundry-sdk";
import { serve } from "@hono/node-server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { createMcpServer } from "../server.js";

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
  const port = Number(process.env.PORT ?? "3333");
  const host = process.env.HOST ?? "127.0.0.1";
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

  const foundryClient = new FoundryClient({});

  const app = new Hono();

  app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
      return c.text("Forbidden", 403);
    }
    await next();
  });

  app.get("/health", (c) => c.json({ status: "ok", service: "adaptyv-foundry-mcp" }));

  app.all("/mcp", async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createMcpServer(foundryClient);
    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  serve({ fetch: app.fetch, port, hostname: host }, (info) => {
    console.error(
      `[adaptyv-foundry-mcp] HTTP listening on http://${host}:${info.port} (MCP: /mcp)`,
    );
  });
}
